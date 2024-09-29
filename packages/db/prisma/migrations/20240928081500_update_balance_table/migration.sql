/*
  Warnings:

  - Added the required column `currency` to the `balance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `balance` ADD COLUMN `currency` ENUM('USD', 'INR', 'BDT', 'JPY', 'EUR') NOT NULL;
