-- AlterTable
ALTER TABLE `wallet` ADD COLUMN `twoFactorActivated` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `withDrawOTPSecret` VARCHAR(191) NULL,
    ADD COLUMN `withDrawOTPVerified` BOOLEAN NOT NULL DEFAULT false;
