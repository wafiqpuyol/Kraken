/*
  Warnings:

  - You are about to drop the column `passkeyVerfied` on the `masterkey` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `masterkey` DROP COLUMN `passkeyVerfied`,
    ADD COLUMN `passkeyVerified` BOOLEAN NOT NULL DEFAULT false;
