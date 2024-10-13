/*
  Warnings:

  - Added the required column `receiver_name` to the `p2ptransfer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sender_name` to the `p2ptransfer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `p2ptransfer` ADD COLUMN `receiver_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `sender_name` VARCHAR(191) NOT NULL;
