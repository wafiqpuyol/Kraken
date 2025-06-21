/*
  Warnings:

  - A unique constraint covering the columns `[jobId]` on the table `schedulePayment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "_userId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "SchedulePayment_jobId" ON "schedulePayment"("jobId");

-- CreateIndex
CREATE INDEX "schedulePayment_jobId_fkey" ON "schedulePayment"("jobId");
