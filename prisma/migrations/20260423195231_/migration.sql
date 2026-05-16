-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `associacaoId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_associacaoId_fkey` FOREIGN KEY (`associacaoId`) REFERENCES `Associacao`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
