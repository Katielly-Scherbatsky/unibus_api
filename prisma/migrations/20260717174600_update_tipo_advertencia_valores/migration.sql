-- Expand enum temporarily to include both old and new values
ALTER TABLE `Advertencia` MODIFY COLUMN `tipo` ENUM('LEVE', 'MEDIA', 'GRAVE', 'HIGIENE', 'CONDUTA', 'PERTURBACAO', 'HORARIO') NOT NULL;

-- Update legacy values to default category
UPDATE `Advertencia` SET `tipo` = 'HIGIENE' WHERE `tipo` IN ('LEVE', 'MEDIA', 'GRAVE');

-- Restrict enum to new values only
ALTER TABLE `Advertencia` MODIFY COLUMN `tipo` ENUM('HIGIENE', 'CONDUTA', 'PERTURBACAO', 'HORARIO') NOT NULL;
