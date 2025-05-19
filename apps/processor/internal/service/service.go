package service

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/lib/pq"

	"github.com/wafiqpuyol/Kraken/apps/processor/internal/client"
)

type outboxProcessor struct {
	db         *sql.DB
	grpcClient *client.GRPCClient
}

func NewOutboxProcessor(db *sql.DB, grpcClient *client.GRPCClient) *outboxProcessor {
	return &outboxProcessor{db: db, grpcClient: grpcClient}
}

func (p *outboxProcessor) StartListener(ctx context.Context) error {
	connStr := "postgresql://postgres:postgres@localhost:5432/bkash?sslmode=disable"
	listener := pq.NewListener(
		connStr,
		10*time.Second,
		time.Minute,
		func(ev pq.ListenerEventType, err error) {
			if err != nil {
				log.Printf("Error in listener: %v\n", err)
			}
		},
	)
	fmt.Println("Listening for notifications on channel: outbox_new_message")
	err := listener.Listen("outbox_new_message")
	if err != nil {
		return fmt.Errorf("failed to start listening: %w", err)
	}

	go func() {
		defer listener.Close()

		for {
			select {
			case <-ctx.Done():
				log.Println("Shutting down notification listener")
				return
			case notification := <-listener.Notify:
				log.Printf("Received notification 1 : %s\n", notification)
				log.Printf("Received notification 2: %s\n", notification.Extra)
				p.grpcClient.Processor(notification.Extra)
			case <-time.After(90 * time.Second):
				// Check connection health
				go func() {
					if err := listener.Ping(); err != nil {
						log.Printf("Error pinging listener: %v\n", err)
					}
				}()
			}
		}
	}()

	return nil
}
