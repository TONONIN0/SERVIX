/*
  Warnings:

  - Added the required column `updatedAt` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable

ALTER TABLE `Session`
ADD COLUMN `updatedAt` DATETIME(3) NULL;

UPDATE `Session`
SET `updatedAt` = `createdAt`
WHERE `updatedAt` IS NULL;

ALTER TABLE `Session`
MODIFY COLUMN `updatedAt` DATETIME(3) NOT NULL;


