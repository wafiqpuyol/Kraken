-- CreateEnum
CREATE TYPE "onramptransaction_status" AS ENUM ('Success', 'Failed', 'Processing');

-- CreateEnum
CREATE TYPE "p2p_transaction_status" AS ENUM ('Success', 'Failed', 'Processing');

-- CreateEnum
CREATE TYPE "merchant_auth_type" AS ENUM ('Google', 'Github');

-- CreateEnum
CREATE TYPE "transaction_type" AS ENUM ('Send', 'Recieve');

-- CreateEnum
CREATE TYPE "transaction_category" AS ENUM ('Domestic', 'International');

-- CreateEnum
CREATE TYPE "transaction_status" AS ENUM ('Completed', 'Pending', 'Failed', 'Flagged', 'Reviewing');

-- CreateTable
CREATE TABLE "balance" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "locked" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,

    CONSTRAINT "balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "auth_type" "merchant_auth_type" NOT NULL,

    CONSTRAINT "merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onramptransaction" (
    "id" SERIAL NOT NULL,
    "status" "onramptransaction_status" NOT NULL,
    "token" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "lockedAmount" INTEGER NOT NULL,

    CONSTRAINT "onramptransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "p2ptransfer" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "fromUserId" INTEGER NOT NULL,
    "toUserId" INTEGER NOT NULL,
    "transactionType" "transaction_type" NOT NULL,
    "transactionID" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "transactionCategory" "transaction_category" NOT NULL,
    "domestic_trxn_fee" TEXT,
    "international_trxn_fee" TEXT,
    "status" "p2p_transaction_status" NOT NULL,
    "receiver_number" TEXT NOT NULL,
    "sender_number" TEXT NOT NULL,
    "receiver_name" TEXT NOT NULL,
    "sender_name" TEXT NOT NULL,
    "fee_currency" TEXT NOT NULL,

    CONSTRAINT "p2ptransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "status" "transaction_status" NOT NULL,
    "risk" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_outbox" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,

    CONSTRAINT "transaction_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" INTEGER NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "number" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "twoFactorActivated" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "country" TEXT,
    "otpVerified" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT NOT NULL DEFAULT '',
    "verificationTokenExpiresAt" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "userAgent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiredAt" TIMESTAMP(3),

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resetpassword" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "token" TEXT,
    "tokenExpiry" TIMESTAMP(3),

    CONSTRAINT "resetpassword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preference" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'U.S. English',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "timezone" TEXT NOT NULL DEFAULT '[-04:00 EDT] New York, N. America',
    "notification_status" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "preference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "email_update_pending" BOOLEAN NOT NULL DEFAULT false,
    "email_update" JSONB NOT NULL,
    "authorization_code" TEXT,
    "confirmation_code" TEXT,
    "current_email" TEXT NOT NULL,
    "isLock" BOOLEAN NOT NULL DEFAULT false,
    "lock_expiresAt" TIMESTAMP(3),
    "dailyLimitExceed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "pincode" TEXT,
    "emergency_code" TEXT,
    "emergency_code_expiresAt" TIMESTAMP(3),
    "otp" TEXT,
    "otpIssuer" TEXT,
    "otpVerified" BOOLEAN NOT NULL DEFAULT false,
    "otp_expiresAt" TIMESTAMP(3),
    "withDrawOTPVerified" BOOLEAN NOT NULL DEFAULT false,
    "withDrawTwoFAActivated" BOOLEAN NOT NULL DEFAULT false,
    "withDrawTwoFASecret" TEXT,
    "wrongPincodeAttempts" INTEGER NOT NULL DEFAULT 0,
    "pincodeResetLimit" INTEGER NOT NULL DEFAULT 0,
    "pincodeResetLimitDailyLimitExpiresAt" TIMESTAMP(3),

    CONSTRAINT "wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "masterkey" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "passkeys" JSONB,
    "transports" JSONB,
    "otpVerified" BOOLEAN NOT NULL DEFAULT false,
    "passKeyActivated" BOOLEAN NOT NULL DEFAULT false,
    "passKeyID" JSONB,
    "passkeyVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "masterkey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "message" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Balance_userId_key" ON "balance"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_email_key" ON "merchant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "OnRampTransaction_token_key" ON "onramptransaction"("token");

-- CreateIndex
CREATE INDEX "OnRampTransaction_userId_fkey" ON "onramptransaction"("userId");

-- CreateIndex
CREATE INDEX "OnRampTransaction_token_fkey" ON "onramptransaction"("token");

-- CreateIndex
CREATE UNIQUE INDEX "P2pTransfer_transactionID_key" ON "p2ptransfer"("transactionID");

-- CreateIndex
CREATE INDEX "P2pTransfer_fromUserId_fkey" ON "p2ptransfer"("fromUserId");

-- CreateIndex
CREATE INDEX "P2pTransfer_toUserId_fkey" ON "p2ptransfer"("toUserId");

-- CreateIndex
CREATE INDEX "P2pTransfer_transactionID_fkey" ON "p2ptransfer"("transactionID");

-- CreateIndex
CREATE INDEX "Transaction_userId_fkey" ON "transaction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_outbox_transactionId_key" ON "transaction_outbox"("transactionId");

-- CreateIndex
CREATE INDEX "Transaction_outbox_transactionId_fkey" ON "transaction_outbox"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_number_key" ON "user"("number");

-- CreateIndex
CREATE INDEX "User_email_fkey" ON "user"("email");

-- CreateIndex
CREATE INDEX "User_number_fkey" ON "user"("number");

-- CreateIndex
CREATE INDEX "Session_userId_fkey" ON "session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiredAt_fkey" ON "session"("expiredAt");

-- CreateIndex
CREATE INDEX "ResetPassword_userId_fkey" ON "resetpassword"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Preference_userId_key" ON "preference"("userId");

-- CreateIndex
CREATE INDEX "Preference_userId_fkey" ON "preference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_userId_key" ON "account"("userId");

-- CreateIndex
CREATE INDEX "Account_userId_fkey" ON "account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "wallet"("userId");

-- CreateIndex
CREATE INDEX "Wallet_userId_fkey" ON "wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MasterKey_userId_key" ON "masterkey"("userId");

-- CreateIndex
CREATE INDEX "MasterKey_userId_fkey" ON "masterkey"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_fkey" ON "notification"("userId");

-- AddForeignKey
ALTER TABLE "balance" ADD CONSTRAINT "Balance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onramptransaction" ADD CONSTRAINT "onramptransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "p2ptransfer" ADD CONSTRAINT "p2ptransfer_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "p2ptransfer" ADD CONSTRAINT "p2ptransfer_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_outbox" ADD CONSTRAINT "transaction_outbox_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resetpassword" ADD CONSTRAINT "resetpassword_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preference" ADD CONSTRAINT "preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "masterkey" ADD CONSTRAINT "masterkey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create a notification function
CREATE OR REPLACE FUNCTION notify_user_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Notify the channel 'outbox_new_message' with the new ID
    PERFORM pg_notify(
        'outbox_new_message',
        row_to_json(NEW)::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists (for migration reruns)
DROP TRIGGER IF EXISTS outbox_insert_trigger ON transaction_outbox;

-- Create the trigger
CREATE TRIGGER outbox_insert_trigger
AFTER INSERT ON transaction_outbox
FOR EACH ROW
EXECUTE FUNCTION notify_user_insert();