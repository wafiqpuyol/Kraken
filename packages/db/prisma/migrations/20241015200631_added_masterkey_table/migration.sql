-- CreateTable
CREATE TABLE `masterkey` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `otpVerfied` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `MasterKey_userId_key`(`userId`),
    INDEX `MasterKey_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `masterkey` ADD CONSTRAINT `MasterKey_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
