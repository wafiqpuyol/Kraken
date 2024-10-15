/*
  Warnings:

  - You are about to drop the column `twoFactorActivated` on the `wallet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `wallet` DROP COLUMN `twoFactorActivated`,
    ADD COLUMN `withDrawTwoFAActivated` BOOLEAN NOT NULL DEFAULT false;
