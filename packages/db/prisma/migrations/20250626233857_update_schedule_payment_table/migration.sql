/*
  Warnings:

  - Added the required column `payee_number` to the `schedulePayment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schedulePayment" ADD COLUMN     "payee_number" TEXT NOT NULL;
