/*
  Warnings:

  - Added the required column `receiver_number` to the `p2ptransfer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sender_number` to the `p2ptransfer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `p2ptransfer` ADD COLUMN `receiver_number` VARCHAR(191) NOT NULL,
    ADD COLUMN `sender_number` VARCHAR(191) NOT NULL;
