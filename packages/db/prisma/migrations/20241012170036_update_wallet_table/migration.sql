/*
  Warnings:

  - You are about to drop the column `otpVerifier` on the `wallet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `wallet` DROP COLUMN `otpVerifier`,
    ADD COLUMN `otpVerified` BOOLEAN NOT NULL DEFAULT false;
