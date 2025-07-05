package config

import (
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/spf13/viper"
)

type Config struct {
	DatabaseURL     string
	KafkaBrokers    string
	PollingInterval time.Duration
	BatchSize       int
}

func Load() (*Config, error) {
	viper.SetConfigFile(".env")
	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("While reading env %s", err)
	}
	dbURL := viper.GetString("DATABASE_URL")
	if dbURL == "" {
		return nil, fmt.Errorf("environment variable DATABASE_URL is not set")
	}

	kafkaBrokers := viper.GetString("KAFKA_BROKERS")
	if kafkaBrokers == "" {
		return nil, fmt.Errorf("environment variable KAFKA_BROKERS is not set")
	}

	pollingIntervalSeconds, err := strconv.Atoi(getEnv("POLLING_INTERVAL_SECONDS", "180"))
	if err != nil {
		return nil, fmt.Errorf("invalid POLLING_INTERVAL_SECONDS: must be an integer")
	}

	batchSize, err := strconv.Atoi(getEnv("BATCH_SIZE", "10"))
	if err != nil {
		return nil, fmt.Errorf("invalid BATCH_SIZE: must be an integer")
	}

	return &Config{
		DatabaseURL:     dbURL,
		KafkaBrokers:    kafkaBrokers,
		PollingInterval: time.Duration(pollingIntervalSeconds) * time.Second,
		BatchSize:       batchSize,
	}, nil
}

// getEnv is a helper function to read an environment variable or return a default value.
func getEnv(key, fallback string) string {
	value := viper.GetString(key)
	if len(value) == 0 {
		return fallback
	}
	return value
}
