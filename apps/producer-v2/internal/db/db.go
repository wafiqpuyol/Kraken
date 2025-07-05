package db

import (
	"context"
	"fmt"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
)

func NewConnection(ctx context.Context, connString string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(connString), &gorm.Config{
		NamingStrategy: schema.NamingStrategy{
			SingularTable: true,
		},
		Logger: logger.Default.LogMode(logger.Info),
	})
	fmt.Println("🚀 Successfully connected to the database!")
	return db, err
}
