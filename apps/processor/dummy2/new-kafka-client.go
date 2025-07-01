package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"log"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/segmentio/kafka-go"
	// Import the lib/pq driver and its listener functionality
	"github.com/lib/pq"
)

// --- CONFIGURATION ---
// Configuration is loaded from environment variables for production-readiness.
const (
	// Database connection string.
	// Example: "postgres://user:password@localhost:5432/mydatabase?sslmode=disable"
	dbConnectionString = "DATABASE_URL"
	// Kafka broker addresses, comma-separated.
	// Example: "localhost:9092,anotherhost:9092"
	kafkaBrokers = "KAFKA_BROKERS"
	// The PostgreSQL channel our service will LISTEN to for real-time notifications.
	postgresNotifyChannel = "send_money"
	// How often the fallback poller should run to sweep for missed jobs.
	pollingInterval = 3 * time.Minute
	// How many records to process in a single batch.
	batchSize = 10
)

// OutboxRecord struct mirrors the structure of our outbox table.
// Using json.RawMessage is efficient as it avoids unmarshaling/remarshaling the payload.
type OutboxRecord struct {
	ID          string          `db:"id"`
	KafkaTopic  string          `db:"kafka_topic"`
	KafkaKey    string          `db:"kafka_key"`
	Payload     json.RawMessage `db:"payload"`
	AggregateID string          `db:"aggregate_id"` // The ID of the corresponding record in the sendMoney table
}

// main is the entry point for our service. It sets up all components
// and orchestrates the graceful shutdown.
func main() {
	log.Println("Starting Producer Service...")

	// --- 1. SETUP ---
	// Create a context that we can cancel on shutdown. This is crucial for
	// ensuring all goroutines can terminate gracefully.
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Load configuration from environment variables.
	dbURL := os.Getenv(dbConnectionString)
	if dbURL == "" {
		log.Fatalf("FATAL: Environment variable %s is not set.", dbConnectionString)
	}
	brokers := os.Getenv(kafkaBrokers)
	if brokers == "" {
		log.Fatalf("FATAL: Environment variable %s is not set.", kafkaBrokers)
	}

	// Create a database connection pool using the lib/pq driver.
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("FATAL: Could not connect to database: %v", err)
	}
	defer db.Close()
	// Verify the connection is alive.
	if err := db.PingContext(ctx); err != nil {
		log.Fatalf("FATAL: Database is not reachable: %v", err)
	}

	// Create a Kafka writer instance from segmentio/kafka-go.
	// It's configured to be durable and wait for acknowledgements from all replicas.
	kafkaWriter := &kafka.Writer{
		Addr:         kafka.TCP(brokers),
		Balancer:     &kafka.LeastBytes{},
		RequiredAcks: kafka.RequireAll, // Ensures highest durability
	}
	defer kafkaWriter.Close()

	// A WaitGroup allows us to wait for all our goroutines to finish before exiting.
	var wg sync.WaitGroup

	// --- 2. START BACKGROUND PROCESSES ---
	// Start the real-time PostgreSQL NOTIFY listener.
	wg.Add(1)
	go listenForNotifications(ctx, &wg, dbURL, db, kafkaWriter) // Pass dbURL for the listener

	// Start the fallback poller.
	wg.Add(1)
	go pollForMissedEvents(ctx, &wg, db, kafkaWriter)

	log.Println("Service is running. Waiting for notifications or polling interval.")

	// --- 3. GRACEFUL SHUTDOWN HANDLING ---
	// Wait for an OS interrupt signal (Ctrl+C, etc.)
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan // Block until a signal is received.

	log.Println("Shutdown signal received. Shutting down gracefully...")

	// Cancel the context to signal all goroutines to stop.
	cancel()

	// Wait for all goroutines to acknowledge they have finished.
	wg.Wait()

	log.Println("Producer Service stopped.")
}

// listenForNotifications connects to Postgres and waits for notifications on our channel.
// This is the corrected version using the lib/pq specific listener.
func listenForNotifications(ctx context.Context, wg *sync.WaitGroup, conninfo string, db *sql.DB, kw *kafka.Writer) {
	defer wg.Done()

	// The pq.NewListener function creates a dedicated listener connection.
	listener := pq.NewListener(conninfo, 10*time.Second, time.Minute, func(ev pq.ListenerEventType, err error) {
		if err != nil {
			log.Printf("ERROR (Listener): Connection error: %v", err)
		}
	})

	// Start listening on our channel.
	err := listener.Listen(postgresNotifyChannel)
	if err != nil {
		log.Printf("ERROR (Listener): Failed to execute LISTEN command: %v", err)
		return
	}

	log.Println("Listener started. Waiting for real-time notifications...")

	for {
		select {
		case <-ctx.Done(): // Check for shutdown signal
			log.Println("Listener stopping due to context cancellation.")
			listener.Close()
			return
		case notification := <-listener.Notify:
			if notification == nil {
				// This can happen if the connection is lost and reconnecting.
				continue
			}
			log.Printf("Notification received on channel '%s'. Triggering batch processing.", notification.Channel)
			// Upon receiving a notification, we trigger a processing batch.
			if err := processOutboxBatch(ctx, db, kw); err != nil {
				log.Printf("ERROR (Listener): Failed to process batch after notification: %v", err)
			}
		case <-time.After(90 * time.Second):
			// Periodically ping the connection to ensure it's alive.
			go func() {
				if err := listener.Ping(); err != nil {
					log.Printf("ERROR (Listener): Ping failed, connection might be lost: %v", err)
				}
			}()
		}
	}
}

// pollForMissedEvents is our durability mechanism. It runs periodically to ensure
// no events are left behind if the listener was down or a notification was missed.
func pollForMissedEvents(ctx context.Context, wg *sync.WaitGroup, db *sql.DB, kw *kafka.Writer) {
	defer wg.Done()
	// Create a ticker that fires at our configured interval.
	ticker := time.NewTicker(pollingInterval)
	defer ticker.Stop()

	log.Printf("Fallback poller started. Will run every %v.", pollingInterval)

	for {
		select {
		case <-ctx.Done():
			// The context was cancelled, so we are shutting down.
			log.Println("Poller stopping.")
			return
		case <-ticker.C:
			// The ticker fired, it's time to poll for work.
			log.Println("Polling for missed events...")
			if err := processOutboxBatch(ctx, db, kw); err != nil {
				log.Printf("ERROR (Poller): Failed to process batch: %v", err)
			}
		}
	}
}

// processOutboxBatch is the core logic of our service. It is called by both the
// listener and the poller. It fetches a batch of jobs from the outbox, processes them
// atomically, and ensures exactly-once semantics between instances.
func processOutboxBatch(ctx context.Context, db *sql.DB, kw *kafka.Writer) error {
	// --- 1. ATOMICALLY CLAIM JOBS ---
	// Begin a new database transaction.
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	// Defer a rollback. If we commit successfully, this is a no-op.
	// If any error occurs before commit, this ensures the transaction is aborted.
	defer tx.Rollback()

	// This is the most critical query.
	// - It selects a batch of records from the outbox.
	// - `FOR UPDATE` places a lock on the selected rows.
	// - `SKIP LOCKED` tells Postgres to ignore any rows that are already locked by
	//   another concurrent transaction (e.g., another running instance of this service).
	// This combination guarantees that two service instances will never process the same job.
	rows, err := tx.QueryContext(ctx, `
        SELECT id, kafka_topic, kafka_key, payload, aggregate_id
        FROM sendMoneyOutbox
        ORDER BY created_at ASC
        LIMIT $1
        FOR UPDATE SKIP LOCKED
    `, batchSize)
	if err != nil {
		return err
	}
	defer rows.Close()

	var records []OutboxRecord
	for rows.Next() {
		var r OutboxRecord
		if err := rows.Scan(&r.ID, &r.KafkaTopic, &r.KafkaKey, &r.Payload, &r.AggregateID); err != nil {
			return err
		}
		records = append(records, r)
	}
	// This checks for errors during the row iteration itself.
	if err = rows.Err(); err != nil {
		return err
	}

	if len(records) == 0 {
		// No work to do. Commit the empty transaction and return.
		return tx.Commit()
	}

	log.Printf("Claimed %d jobs for processing.", len(records))

	// --- 2. PROCESS CLAIMED JOBS ---
	// Prepare messages for Kafka.
	var messages []kafka.Message
	for _, record := range records {
		// First, update the main business table status to 'PROCESSING'.
		_, err = tx.ExecContext(
			ctx,
			"UPDATE sendMoney SET status = 'PROCESSING' WHERE id = $1 AND status = 'PENDING'",
			record.AggregateID,
		)
		if err != nil {
			log.Printf("ERROR: Failed to update sendMoney table for id %s: %v", record.AggregateID, err)
			return err // This will trigger the deferred tx.Rollback()
		}

		// Add the message to the batch we'll send to Kafka.
		messages = append(messages, kafka.Message{
			Topic: record.KafkaTopic,
			Key:   []byte(record.KafkaKey),
			Value: record.Payload,
		})
	}

	// Publish the entire batch of messages to Kafka.
	// The `WriteMessages` call is synchronous and will block until acks are received.
	err = kw.WriteMessages(ctx, messages...)
	if err != nil {
		log.Printf("ERROR: Kafka write failed: %v", err)
		// If the batch write fails, we must roll back the entire transaction.
		// The jobs will be retried on the next polling cycle.
		return err
	}
	log.Printf("Successfully delivered %d messages to Kafka.", len(messages))

	// --- 3. FINALIZE TRANSACTION ---
	// All messages were successfully published to Kafka. Now we can safely delete
	// the jobs from the outbox table.
	for _, record := range records {
		_, err = tx.ExecContext(ctx, "DELETE FROM sendMoneyOutbox WHERE id = $1", record.ID)
		if err != nil {
			log.Printf("CRITICAL ERROR: Kafka publish succeeded but failed to delete from outbox for id %s: %v. Manual intervention may be required.", record.ID, err)
			return err // Rollback to be safe, though this state is problematic.
		}
	}

	// Everything succeeded. Commit the transaction to make all changes permanent.
	return tx.Commit()
}
