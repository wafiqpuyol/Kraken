package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/wafiqpuyol/Kraken/apps/processor/internal/client"
	"github.com/wafiqpuyol/Kraken/apps/processor/internal/db"
	"github.com/wafiqpuyol/Kraken/apps/processor/internal/service"
)

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Connect to database
	database, err := db.ConnectDB("postgresql://postgres:postgres@localhost:5432/bkash?sslmode=disable")
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Connect to gRPC server
	grpcClient, err :=client.NewGRPCClient("localhost:50051")
	if err != nil {
		log.Fatalf("Failed to connect to gRPC server: %v", err)
	}
	defer grpcClient.Close()

	// Initialize outbox processor
	outboxProcessor := service.NewOutboxProcessor(database, grpcClient)
	if err := outboxProcessor.StartListener(ctx); err != nil {
		log.Fatalf("Failed to start notification listener: %v", err)
	}

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")
}
