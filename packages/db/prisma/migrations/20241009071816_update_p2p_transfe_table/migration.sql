/*
  Warnings:

  - Added the required column `status` to the `p2ptransfer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `p2ptransfer` ADD COLUMN `status` ENUM('Success', 'Failed') NOT NULL;
