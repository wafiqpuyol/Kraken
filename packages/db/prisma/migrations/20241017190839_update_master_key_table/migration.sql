/*
  Warnings:

  - You are about to alter the column `passKeyID` on the `masterkey` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `masterkey` MODIFY `passKeyID` JSON NULL;
