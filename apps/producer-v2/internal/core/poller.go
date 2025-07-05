package core

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/wafiqpuyol/kraken/apps/producer-v2/internal/model"

	"github.com/segmentio/kafka-go"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)


type OutboxRecord struct {
	ID          string
	KafkaTopic  string
	KafkaKey    string
	Payload     json.RawMessage
	AggregateID string
}
type Service struct {
	db *gorm.DB
	kw *kafka.Writer
}

var messages []kafka.Message

func NewService(db *gorm.DB, kw *kafka.Writer) *Service {
	return &Service{db: db, kw: kw}
}



func (s *Service) StartPoller(ctx context.Context, wg *sync.WaitGroup, interval time.Duration) {
	defer wg.Done()
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	var outboxPorcessorWg sync.WaitGroup
	topics := []string{"send_money"}
	tables := []string{"transaction"}

	log.Printf("Fallback poller started. Will run every %v.", interval)

	for {
		select {
		case <-ctx.Done():
			log.Println("Poller stopping.")
			return
		case <-ticker.C:
			outboxPorcessorWg.Add(len(topics))
			log.Println("Polling for missed events...")
			for idx, topic := range topics {
				go func(Iwg *sync.WaitGroup) {
					defer Iwg.Done()
					if err := s.ProcessOutboxBatch(ctx, topic, tables[idx]); err != nil {
						log.Printf("ERROR (Poller): Failed to process batch: %v", err)
					}
				}(&outboxPorcessorWg)
			}
			outboxPorcessorWg.Wait()
		}
	}
}


func (s *Service) ProcessOutboxBatch(ctx context.Context, topicName string, tableName string) error {
	var trxnTable model.Transaction
	var trxnOutboxTables []model.TransactionOutbox
	var trxnOutboxTable model.TransactionOutbox

	// Begin a new database transaction.
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

	// The critical query to atomically fetch and lock jobs.
	if err := tx.Table(tableName + "_outbox").Limit(10).Find(&trxnOutboxTables).Error; err != nil {
		tx.Rollback()
		fmt.Errorf("Failed to fetch transaction outbox records, %w", err)
	}

	if len(trxnOutboxTables) == 0 {
		return tx.Commit().Error
	}

	for _, trxnOutboxTable = range trxnOutboxTables {
		result := tx.Table(tableName).Clauses(clause.Locking{Strength: "UPDATE", Options: "SKIP LOCKED"}).
			Where("id = ? AND status = ?", trxnOutboxTable.TransactionID, "Pending").
			Update("status", "Processing")

		if result.Error != nil {
			tx.Rollback()
			return result.Error
		}
		fmt.Println(result)
		log.Printf("Successfully updated transaction status.")

		// fetch the recently updated transaction record & populate to trxnTable struct
		if err := tx.Table(tableName).Where("id = ?", trxnOutboxTable.TransactionID).First(&trxnTable).Error; err != nil {
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
			fmt.Println(topicName, tableName)
			tx.Rollback()
			return err
		}
		log.Printf("Successfully delivered %d messages to Kafka.", messages)

		if err := tx.Table(tableName+"_outbox").Clauses(clause.Locking{Strength: "DELETE", Options: "SKIP LOCKED"}).
			Where("id = ?", trxnOutboxTable.ID).Delete(&trxnOutboxTable).Error; err != nil {
			tx.Rollback()
			return err
		}
		log.Printf("Successfully deleted the transaction outbox record, %s", trxnOutboxTable.ID)
	}

	return tx.Commit().Error
}
