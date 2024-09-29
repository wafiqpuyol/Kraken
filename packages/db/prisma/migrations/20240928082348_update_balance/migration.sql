/*
  Warnings:

  - Added the required column `currency` to the `balance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `balance` ADD COLUMN `currency` VARCHAR(191) NOT NULL;
