-- AlterTable
ALTER TABLE `p2ptransfer` ADD COLUMN `domestic_trxn_fee` VARCHAR(191) NULL,
    ADD COLUMN `international_trxn_fee` VARCHAR(191) NULL;
