-- AlterTable
ALTER TABLE `User` ADD COLUMN `passwordResetCode` VARCHAR(191) NULL,
    ADD COLUMN `passwordResetCodeExpires` DATETIME(3) NULL;
