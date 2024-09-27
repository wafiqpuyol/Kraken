-- CreateTable
CREATE TABLE `preference` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `language` VARCHAR(191) NOT NULL DEFAULT 'U.S. English',
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `timezone` VARCHAR(191) NOT NULL DEFAULT '[-04:00 EDT] New York, N. America',

    INDEX `Preference_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `preference` ADD CONSTRAINT `Preference_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
