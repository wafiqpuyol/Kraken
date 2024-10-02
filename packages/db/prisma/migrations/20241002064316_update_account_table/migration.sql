/*
  Warnings:

  - Added the required column `current_email` to the `account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `account` ADD COLUMN `current_email` VARCHAR(191) NOT NULL;
