package client

import (
	"context"
	"fmt"
	"log"
	"time"

	"google.golang.org/grpc"

	pb "github.com/wafiqpuyol/Kraken/apps/processor/proto/gen"
)

type GRPCClient struct {
	conn   *grpc.ClientConn
	client pb.ProcessorServiceClient
}

func NewGRPCClient(grpcServerURL string) (*GRPCClient, error) {
	conn, err := grpc.NewClient(grpcServerURL, grpc.WithInsecure())
	if err != nil {
		return nil, err
	}

	log.Printf("Connected to gRPC server at %s", grpcServerURL)

	return &GRPCClient{
		conn:   conn,
		client: pb.NewProcessorServiceClient(conn),
	}, nil
}

func (c *GRPCClient) Close() {
	c.conn.Close()
}

func (c *GRPCClient) Processor(payload string) {
	fmt.Println("---------------------------payload---------------------------", payload)
	ctx, cancel := context.WithTimeout(context.Background(), 7*time.Second)
	defer cancel()

	req := &pb.ProcessorRequest{
		Payload: payload,
	}

	_, err := c.client.Processor(ctx, req)
	if err != nil {
		log.Printf("Error calling Process RPC method: %v", err)
	}

}
