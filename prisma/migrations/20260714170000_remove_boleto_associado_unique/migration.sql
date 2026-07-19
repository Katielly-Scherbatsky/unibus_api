-- DropForeignKey
ALTER TABLE `Boleto` DROP FOREIGN KEY `Boleto_associadoId_fkey`;

-- DropIndex
DROP INDEX `Boleto_associadoId_key` ON `Boleto`;

-- CreateIndex
CREATE INDEX `Boleto_associadoId_idx` ON `Boleto`(`associadoId`);

-- AddForeignKey
ALTER TABLE `Boleto` ADD CONSTRAINT `Boleto_associadoId_fkey` FOREIGN KEY (`associadoId`) REFERENCES `Associado`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
