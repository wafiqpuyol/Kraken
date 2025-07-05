package model

import "time"

type Transaction struct {
	ID                string `gorm:"primaryKey;type:uuid"`
	UserId            string `gorm:"column:userId;index"`
	Amount            int
	CreatedAt         time.Time  `gorm:"column:createdAt;autoCreateTime"`
	UpdatedAt         *time.Time `gorm:"column:updatedAt;autoUpdateTime"`
	Status            string
	Risk              int `gorm:"default:0"`
	Location          string
	User              User               `gorm:"foreignKey:UserId;references:ID"`
	TransactionOutbox *TransactionOutbox `gorm:"foreignKey:TransactionID;references:ID"`
}

type TransactionOutbox struct {
	ID            string `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	TransactionID string `gorm:"column:transactionId;uniqueIndex"`
}

type User struct {
	ID                         int     `gorm:"primaryKey"`
	Email                      *string `gorm:"uniqueIndex:User_email_key"`
	Name                       *string
	Number                     string `gorm:"uniqueIndex:User_number_key"`
	Password                   string
	TwoFactorActivated         bool `gorm:"default:false"`
	TwoFactorSecret            *string
	Country                    *string
	OtpVerified                bool   `gorm:"default:false"`
	IsVerified                 bool   `gorm:"default:false"`
	VerificationToken          string `gorm:"default:''"`
	VerificationTokenExpiresAt *time.Time
	Transactions               []Transaction `gorm:"foreignKey:UserId"`
}
