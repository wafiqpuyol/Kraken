-- CreateTable
CREATE TABLE "schedulePayment" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "jobId" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "executionDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedulePayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "_userId_fkey" ON "schedulePayment"("userId");

-- AddForeignKey
ALTER TABLE "schedulePayment" ADD CONSTRAINT "schedulePayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
