package kfaka_client

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
	// Use the pgx driver for its performance and support for modern PostgreSQL features.
	_ "github.com/jackc/pgx/v5/stdlib"
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

	// Create a database connection pool.
	db, err := sql.Open("pgx", dbURL)
	if err != nil {
		log.Fatalf("FATAL: Could not connect to database: %v", err)
	}
	defer db.Close()
	// Verify the connection is alive.
	if err := db.PingContext(ctx); err != nil {
		log.Fatalf("FATAL: Database is not reachable: %v", err)
	}

	// Create a Kafka producer instance.
	producer, err := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": brokers})
	if err != nil {
		log.Fatalf("FATAL: Could not create Kafka producer: %v", err)
	}
	defer producer.Close()

	// A WaitGroup allows us to wait for all our goroutines to finish before exiting.
	var wg sync.WaitGroup

	// --- 2. START BACKGROUND PROCESSES ---
	// Start the real-time PostgreSQL NOTIFY listener.
	wg.Add(1)
	go listenForNotifications(ctx, &wg, db, producer)

	// Start the fallback poller.
	wg.Add(1)
	go pollForMissedEvents(ctx, &wg, db, producer)

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
// This provides real-time event processing.
func listenForNotifications(ctx context.Context, wg *sync.WaitGroup, db *sql.DB, p *kafka.Producer) {
	defer wg.Done()

	// LISTEN requires a dedicated connection that is not returned to the pool.
	conn, err := db.Conn(ctx)
	if err != nil {
		log.Printf("ERROR (Listener): Failed to get dedicated DB connection: %v", err)
		return
	}
	defer conn.Close()

	// Execute the LISTEN command.
	_, err = conn.ExecContext(ctx, "LISTEN "+postgresNotifyChannel)
	if err != nil {
		log.Printf("ERROR (Listener): Failed to execute LISTEN command: %v", err)
		return
	}

	log.Println("Listener started. Waiting for real-time notifications...")

	for {
		// Wait for a notification. This blocks until a notification is received,
		// the context is cancelled, or the timeout is reached.
		notification, err := conn.WaitForNotification(ctx)
		if err != nil {
			// If context is cancelled, err will be context.Canceled. We exit cleanly.
			log.Printf("Listener stopping: %v", err)
			return
		}

		log.Printf("Notification received: %s. Triggering batch processing.", notification.Payload)
		// Upon receiving a notification, we trigger a processing batch.
		// The actual processing logic is shared to prevent race conditions.
		if err := processOutboxBatch(db, p); err != nil {
			log.Printf("ERROR (Listener): Failed to process batch after notification: %v", err)
		}
	}
}

// pollForMissedEvents is our durability mechanism. It runs periodically to ensure
// no events are left behind if the listener was down or a notification was missed.
func pollForMissedEvents(ctx context.Context, wg *sync.WaitGroup, db *sql.DB, p *kafka.Producer) {
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
			if err := processOutboxBatch(db, p); err != nil {
				log.Printf("ERROR (Poller): Failed to process batch: %v", err)
			}
		}
	}
}

// processOutboxBatch is the core logic of our service. It is called by both the
// listener and the poller. It fetches a batch of jobs from the outbox, processes them
// atomically, and ensures exactly-once semantics between instances.
func processOutboxBatch(db *sql.DB, p *kafka.Producer) error {
	// --- 1. ATOMICALLY CLAIM JOBS ---
	// Begin a new database transaction.
	tx, err := db.Begin()
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
	rows, err := tx.Query(`
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
	// Create a channel to receive delivery reports from Kafka. This allows us to
	// ensure messages are actually produced before we commit our DB transaction.
	deliveryChan := make(chan kafka.Event, len(records))

	for _, record := range records {
		// First, update the main business table status to 'PROCESSING'.
		_, err = tx.Exec(
			"UPDATE sendMoney SET status = 'PROCESSING' WHERE id = $1 AND status = 'PENDING'",
			record.AggregateID,
		)
		if err != nil {
			log.Printf("ERROR: Failed to update sendMoney table for id %s: %v", record.AggregateID, err)
			return err // This will trigger the deferred tx.Rollback()
		}

		// Now, produce the message to the Kafka topic.
		err = p.Produce(&kafka.Message{
			TopicPartition: kafka.TopicPartition{Topic: &record.KafkaTopic, Partition: kafka.PartitionAny},
			Key:            []byte(record.KafkaKey),
			Value:          record.Payload,
		}, deliveryChan)

		if err != nil {
			log.Printf("ERROR: Failed to produce message to Kafka: %v", err)
			return err // Rollback
		}
	}

	// Wait for all delivery reports from Kafka.
	for i := 0; i < len(records); i++ {
		e := <-deliveryChan
		m := e.(*kafka.Message)

		if m.TopicPartition.Error != nil {
			log.Printf("ERROR: Kafka delivery failed: %v", m.TopicPartition.Error)
			// If even one message fails, we must roll back the entire batch.
			// They will be retried on the next polling cycle.
			return m.TopicPartition.Error
		}
		log.Printf("Successfully delivered message to %s [%d] at offset %v",
			*m.TopicPartition.Topic, m.TopicPartition.Partition, m.TopicPartition.Offset)
	}
	close(deliveryChan)

	// --- 3. FINALIZE TRANSACTION ---
	// All messages were successfully published to Kafka. Now we can safely delete
	// the jobs from the outbox table.
	for _, record := range records {
		_, err = tx.Exec("DELETE FROM sendMoneyOutbox WHERE id = $1", record.ID)
		if err != nil {
			log.Printf("CRITICAL ERROR: Kafka publish succeeded but failed to delete from outbox for id %s: %v. Manual intervention may be required.", record.ID, err)
			return err // Rollback to be safe, though this state is problematic.
		}
	}

	// Everything succeeded. Commit the transaction to make all changes permanent.
	return tx.Commit()
}
