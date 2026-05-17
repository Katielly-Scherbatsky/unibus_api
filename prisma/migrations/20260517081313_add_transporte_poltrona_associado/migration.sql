-- AlterTable
ALTER TABLE `Associado` ADD COLUMN `poltrona` INTEGER NULL,
    ADD COLUMN `transporteId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Associado` ADD CONSTRAINT `Associado_transporteId_fkey` FOREIGN KEY (`transporteId`) REFERENCES `Transporte`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
