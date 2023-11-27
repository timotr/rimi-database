/*
  Warnings:

  - Added the required column `type` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `customer` ADD COLUMN `pin` VARCHAR(191) NULL,
    ADD COLUMN `type` TINYINT NOT NULL;
