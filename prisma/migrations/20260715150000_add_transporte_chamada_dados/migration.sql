-- AlterTable
ALTER TABLE `Transporte` ADD COLUMN `placa` VARCHAR(191) NULL,
    ADD COLUMN `identificacao` VARCHAR(191) NULL,
    ADD COLUMN `rota` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Chamada` ADD COLUMN `motorista` VARCHAR(191) NULL,
    ADD COLUMN `observacoes` VARCHAR(191) NULL;
