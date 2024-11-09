/*
  Warnings:

  - A unique constraint covering the columns `[transactionID]` on the table `p2ptransfer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `P2pTransfer_transactionID_key` ON `p2ptransfer`(`transactionID`);
