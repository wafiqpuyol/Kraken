-- AlterTable
ALTER TABLE `account` ADD COLUMN `lock_expiresAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `wallet` ADD COLUMN `wrongPincodeAttempts` INTEGER NOT NULL DEFAULT 0;
