package kafka

import (
	"strings"

	"github.com/segmentio/kafka-go"
)

// NewWriter creates and configures a new Kafka writer instance.
func NewWriter(brokers string) *kafka.Writer {
	// The kafka.Writer is configured for high durability.
	// `RequireAll` ensures the leader waits for all in-sync replicas to acknowledge
	// the write before responding, which is critical for financial transactions.
	return &kafka.Writer{
		Addr:         kafka.TCP(strings.Split(brokers, ",")...),
		Balancer:     &kafka.LeastBytes{},
		RequiredAcks: kafka.RequireAll,
	}
}
