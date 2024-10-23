-- AlterTable
ALTER TABLE `resetpassword` MODIFY `token` VARCHAR(191) NULL,
    MODIFY `tokenExpiry` DATETIME(3) NULL;
