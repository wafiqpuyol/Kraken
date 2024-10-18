/*
  Warnings:

  - You are about to drop the column `otpVerfied` on the `masterkey` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `masterkey` DROP COLUMN `otpVerfied`,
    ADD COLUMN `otpVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `passKeyActivated` BOOLEAN NOT NULL DEFAULT false;
