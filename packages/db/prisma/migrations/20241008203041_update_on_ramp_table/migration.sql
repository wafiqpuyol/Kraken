/*
  Warnings:

  - The values [Failure] on the enum `onramptransaction_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `onramptransaction` MODIFY `status` ENUM('Success', 'Failed', 'Processing') NOT NULL;
