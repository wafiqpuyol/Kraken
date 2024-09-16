-- AlterTable
ALTER TABLE `user` ADD COLUMN `twoFactorActivated` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `twoFactorSecret` VARCHAR(191) NULL;
