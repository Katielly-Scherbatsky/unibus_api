-- Limpar registros órfãos de AvisoUsuario antes de adicionar as foreign keys
DELETE FROM `AvisoUsuario`
WHERE `avisoId` NOT IN (SELECT `id` FROM `Aviso`);

DELETE FROM `AvisoUsuario`
WHERE `associadoId` NOT IN (SELECT `id` FROM `Associado`);

-- AddForeignKey
ALTER TABLE `AvisoUsuario` ADD CONSTRAINT `AvisoUsuario_avisoId_fkey` FOREIGN KEY (`avisoId`) REFERENCES `Aviso`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AvisoUsuario` ADD CONSTRAINT `AvisoUsuario_associadoId_fkey` FOREIGN KEY (`associadoId`) REFERENCES `Associado`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX `Aviso_status_idx` ON `Aviso`(`status`);

-- CreateIndex
CREATE INDEX `Aviso_tipo_idx` ON `Aviso`(`tipo`);

-- CreateIndex
CREATE INDEX `Aviso_createdAt_idx` ON `Aviso`(`createdAt`);
