-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_customerId_fkey`;

-- AlterTable
ALTER TABLE `order` MODIFY `customerId` INTEGER NULL;

-- CreateTable
CREATE TABLE `StoreEmployees` (
    `storeId` INTEGER NOT NULL,
    `employeeId` INTEGER NOT NULL,

    PRIMARY KEY (`storeId`, `employeeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StoreEmployees` ADD CONSTRAINT `StoreEmployees_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StoreEmployees` ADD CONSTRAINT `StoreEmployees_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
