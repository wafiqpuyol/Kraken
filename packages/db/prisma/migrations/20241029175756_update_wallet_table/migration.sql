-- AlterTable
ALTER TABLE `wallet` ADD COLUMN `pincodeResetLimit` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `pincodeResetLimitDailyLimitExpiresAt` DATETIME(3) NULL;
