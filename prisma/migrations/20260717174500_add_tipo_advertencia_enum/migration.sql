-- Update invalid/legacy values to default enum value
UPDATE `Advertencia` SET `tipo` = 'LEVE' WHERE `tipo` NOT IN ('LEVE', 'MEDIA', 'GRAVE') OR `tipo` IS NULL;

-- AlterTable
ALTER TABLE `Advertencia` MODIFY COLUMN `tipo` ENUM('LEVE', 'MEDIA', 'GRAVE') NOT NULL;

-- CreateIndex
CREATE INDEX `Advertencia_tipo_idx` ON `Advertencia`(`tipo`);
