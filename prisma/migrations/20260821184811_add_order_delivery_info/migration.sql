/*
  Warnings:

  - Added the required column `ciudad` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `direccion` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefono` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Order` ADD COLUMN `ciudad` VARCHAR(191) NOT NULL,
    ADD COLUMN `direccion` VARCHAR(191) NOT NULL,
    ADD COLUMN `notas` TEXT NULL,
    ADD COLUMN `telefono` VARCHAR(191) NOT NULL;
