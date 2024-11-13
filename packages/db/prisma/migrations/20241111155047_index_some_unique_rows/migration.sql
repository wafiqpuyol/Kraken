-- CreateIndex
CREATE INDEX `OnRampTransaction_token_fkey` ON `onramptransaction`(`token`);

-- CreateIndex
CREATE INDEX `P2pTransfer_transactionID_fkey` ON `p2ptransfer`(`transactionID`);

-- CreateIndex
CREATE INDEX `User_email_fkey` ON `user`(`email`);

-- CreateIndex
CREATE INDEX `User_number_fkey` ON `user`(`number`);
