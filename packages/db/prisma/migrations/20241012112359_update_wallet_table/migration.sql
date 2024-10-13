/*
  Warnings:

  - You are about to drop the column `otp` on the `p2ptransfer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `p2ptransfer` DROP COLUMN `otp`;

-- AlterTable
ALTER TABLE `wallet` ADD COLUMN `otp` VARCHAR(191) NULL;
