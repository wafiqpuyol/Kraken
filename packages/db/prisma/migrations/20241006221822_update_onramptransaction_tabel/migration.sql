/*
  Warnings:

  - Made the column `lockedAmount` on table `onramptransaction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `onramptransaction` MODIFY `lockedAmount` INTEGER NOT NULL;
