-- CreateEnum
CREATE TYPE "schedulePayment_status" AS ENUM ('Completed', 'Pending', 'Failed', 'Processing');

-- AlterTable
ALTER TABLE "schedulePayment" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "editCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "schedulePayment_status" NOT NULL DEFAULT 'Pending',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
