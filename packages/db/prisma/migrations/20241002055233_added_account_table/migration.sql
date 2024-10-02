-- CreateTable
CREATE TABLE `account` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `email_update_pending` BOOLEAN NOT NULL DEFAULT false,
    `email_update` JSON NULL,
    `authorization_code` VARCHAR(191) NULL,
    `confirmation_code` VARCHAR(191) NULL,

    UNIQUE INDEX `Account_userId_key`(`userId`),
    INDEX `Account_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
