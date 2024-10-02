/*
  Warnings:

  - Made the column `email_update` on table `account` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `account` MODIFY `email_update` JSON NOT NULL;
