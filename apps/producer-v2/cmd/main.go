package main

import (
	"context"
	"fmt"
	"log"
	"sync"

	"github.com/wafiqpuyol/kraken/apps/producer-v2/internal/config"
	"github.com/wafiqpuyol/kraken/apps/producer-v2/internal/core"
	"github.com/wafiqpuyol/kraken/apps/producer-v2/internal/db"
	"github.com/wafiqpuyol/kraken/apps/producer-v2/internal/kafka"
	"github.com/wafiqpuyol/kraken/apps/producer-v2/internal/listener"
)

func main() {
	log.Println("Starting Producer Service...")

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("FATAL: could not load configuration: %v", err)
	}
	fmt.Println(cfg)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	db, err := db.NewConnection(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("FATAL: could not connect to database: %v", err)
	}

	kafkaWriter := kafka.NewWriter(cfg.KafkaBrokers)
	defer kafkaWriter.Close()

	// --- 3. START BACKGROUND PROCESSES & Pg Listener ---
	var wg sync.WaitGroup
	coreService := core.NewService(db, kafkaWriter)
	newListener := listener.NewLister(db, kafkaWriter)

	// Start the real-time PostgreSQL NOTIFY listener.
	wg.Add(1)
	go newListener.Start(ctx, &wg, cfg.DatabaseURL)

	// Start the fallback poller.
	wg.Add(1)
	go coreService.StartPoller(ctx, &wg, cfg.PollingInterval)

	log.Println("Service is running. Waiting for notifications or polling interval.")

	// // --- 4. GRACEFUL SHUTDOWN HANDLING ---
	// // Wait for an OS interrupt signal and cancel the context.
	// shutdown.Handle(cancel)

	wg.Wait()

	log.Println("Producer Service stopped.")
}
