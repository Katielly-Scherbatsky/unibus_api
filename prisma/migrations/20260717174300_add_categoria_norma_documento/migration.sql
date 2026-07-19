-- AlterTable
ALTER TABLE `NormaDocumento` ADD COLUMN `categoria` VARCHAR(191) NULL DEFAULT 'DOCUMENTO';

-- CreateIndex
CREATE INDEX `NormaDocumento_categoria_idx` ON `NormaDocumento`(`categoria`);
