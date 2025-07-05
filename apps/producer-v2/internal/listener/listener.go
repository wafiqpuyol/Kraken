package listener

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/wafiqpuyol/kraken/apps/producer-v2/internal/model"

	"github.com/lib/pq"
	"github.com/segmentio/kafka-go"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type listener struct {
	db *gorm.DB
	kw *kafka.Writer
}

func NewLister(db *gorm.DB, kw *kafka.Writer) *listener {
	return &listener{db: db, kw: kw}
}

type NotificationExtra struct {
	ID            string `json:"id"`
	TransactionID string `json:"transactionId"`
}

var messages []kafka.Message

func (s *listener) Start(ctx context.Context, wg *sync.WaitGroup, conninfo string) {
	defer wg.Done()

	var listernerWg sync.WaitGroup

	listener := pq.NewListener(conninfo, 10*time.Second, time.Minute, func(ev pq.ListenerEventType, err error) {
		if err != nil {
			log.Printf("ERROR (Listener): Connection error: %v", err)
		}
	})

	listerners := []string{"outbox_new_message", "depositOutbox_new_message", "notificationOutbox_new_message"}
	topics := []string{"send_money", "deposit", "notification"}
	listernerWg.Add(len(listerners))

	for _, channel := range listerners {

		if err := listener.Listen(channel); err != nil {
			log.Printf("ERROR (Listener): Failed to execute LISTEN command, disabling listener: %v", err)
			// If we can't listen, this goroutine can't do its job. We exit so the service can
			// rely solely on the fallback poller.
			return
		}

		log.Println("Listener started. Waiting for real-time notifications...")

		go func(Iwg *sync.WaitGroup, ch string) {
			defer Iwg.Done()

			for {
				select {
				case <-ctx.Done():
					log.Println("Listener stopping due to context cancellation.")
					listener.Close()
					return

				case notification := <-listener.Notify:
					if notification == nil {
						continue
					}

					var extra NotificationExtra
					err := json.Unmarshal([]byte(notification.Extra), &extra)
					if err != nil {
						log.Fatalf("Failed to parse notification extra: %v", err)
					} else {
						fmt.Printf("Extracted id: %s, transactionId: %s\n", extra.ID, extra.TransactionID)
					}

					log.Printf("Notification received on channel '%s'. Triggering batch processing.", notification.Channel)
					switch ch {
					case "outbox_new_message":
						fmt.Println(channel)
						if err := s.execute(ctx, &extra, "transaction", topics[0]); err != nil {
							log.Printf("ERROR (Listener): Failed to process batch after notification: %v", err)
						}
					case "depositOutbox_new_message":
						fmt.Println(channel)
						if err := s.execute(ctx, &extra, "deposit", topics[1]); err != nil {
							log.Printf("ERROR (Listener): Failed to process batch after notification: %v", err)
						}
					case "notificationOutbox_new_message":
						fmt.Println(channel)
						if err := s.execute(ctx, &extra, "notification", topics[2]); err != nil {
							log.Printf("ERROR (Listener): Failed to process batch after notification: %v", err)
						}
					}

				case <-time.After(90 * time.Second):
					// Periodically ping the connection to ensure it's alive and to handle
					// potential silent connection drops.
					go func() {
						if err := listener.Ping(); err != nil {
							log.Printf("ERROR (Listener): Ping failed, connection might be lost: %v", err)
						}
					}()
				}

			}
		}(&listernerWg, channel)
	}

	listernerWg.Wait()
}

func (s *listener) execute(ctx context.Context, channelPayload *NotificationExtra, tableName string, topicName string) error {
	var trxnTable model.Transaction
	var trxnOutboxTable model.TransactionOutbox

	// Atomically lookup, update, kafka message produce, delete outbox record.
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := tx.Error; err != nil {
		tx.Rollback()
		return err
	}

	result := tx.Table(tableName).Clauses(clause.Locking{Strength: "UPDATE", Options: "SKIP LOCKED"}).
		Where("id = ? AND status = ?", channelPayload.TransactionID, "Pending").
		Update("status", "Processing")

	if result.Error != nil {
		tx.Rollback()
		return result.Error
	}
	fmt.Println(result)
	log.Printf("Successfully updated transaction status.")

	// fetch the recently updated transaction record & populate to trxnTable struct
	if err := tx.Table(tableName).Where("id = ?", channelPayload.TransactionID).First(&trxnTable).Error; err != nil {
		tx.Rollback()
		return err
	}
	fmt.Println(trxnTable)

	// Converting json struct to bytes by serializing
	trxnBytes, err := json.Marshal(trxnTable)
	if err != nil {
		tx.Rollback()
		return err
	}
	messages = append(messages, kafka.Message{
		Topic: topicName,
		// Key:   []byte(record.KafkaKey),
		Value: trxnBytes,
	})

	if err := s.kw.WriteMessages(ctx, messages...); err != nil {
		tx.Rollback()
		return err
	}
	log.Printf("Successfully delivered %d messages to Kafka.", messages)

	if err := tx.Table(tableName+"_outbox").Where("id = ?", channelPayload.ID).Delete(&trxnOutboxTable).Error; err != nil {
		tx.Rollback()
		return err
	}
	log.Printf("Successfully deleted the transaction outbox record, %s", channelPayload.ID)

	return tx.Commit().Error
}
