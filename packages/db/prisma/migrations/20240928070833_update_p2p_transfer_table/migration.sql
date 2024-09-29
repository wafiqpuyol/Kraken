/*
  Warnings:

  - Added the required column `transactionType` to the `p2ptransfer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trasactionID` to the `p2ptransfer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `p2ptransfer` ADD COLUMN `transactionType` ENUM('Send', 'Recieve') NOT NULL,
    ADD COLUMN `trasactionID` VARCHAR(191) NOT NULL;
