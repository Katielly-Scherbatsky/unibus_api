-- CreateIndex
CREATE INDEX `Solicitacao_associadoId_idx` ON `Solicitacao`(`associadoId`);

-- DropIndex
DROP INDEX `Solicitacao_associadoId_key` ON `Solicitacao`;

-- AlterTable
ALTER TABLE `Solicitacao` ADD COLUMN `atendidoPor` VARCHAR(191) NULL;
