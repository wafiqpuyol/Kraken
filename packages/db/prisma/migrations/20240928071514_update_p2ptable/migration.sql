/*
  Warnings:

  - You are about to drop the column `trasactionID` on the `p2ptransfer` table. All the data in the column will be lost.
  - Added the required column `transactionID` to the `p2ptransfer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `p2ptransfer` DROP COLUMN `trasactionID`,
    ADD COLUMN `transactionID` VARCHAR(191) NOT NULL;
