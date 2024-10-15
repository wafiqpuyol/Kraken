/*
  Warnings:

  - You are about to drop the column `withDrawOTPSecret` on the `wallet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `wallet` DROP COLUMN `withDrawOTPSecret`,
    ADD COLUMN `withDrawTwoFASecret` VARCHAR(191) NULL;
