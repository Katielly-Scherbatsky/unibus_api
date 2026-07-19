-- AlterTable
ALTER TABLE `Associado` ADD COLUMN `adminId` INTEGER NULL,
    ADD COLUMN `diasTransporte` VARCHAR(191) NULL,
    ADD COLUMN `primeiroAcesso` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `Usuario` DROP COLUMN `primeiroAcesso`,
    ADD COLUMN `avatarUrl` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `NormaDocumento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `associacaoId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `NormaDocumento_associacaoId_idx`(`associacaoId`),
    INDEX `NormaDocumento_tipo_idx`(`tipo`),
    INDEX `NormaDocumento_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Documento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `associadoId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Documento_associadoId_idx`(`associadoId`),
    INDEX `Documento_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Advertencia_associadoId_idx` ON `Advertencia`(`associadoId`);

-- CreateIndex
CREATE INDEX `Associado_associacaoId_status_idx` ON `Associado`(`associacaoId`, `status`);

-- CreateIndex
CREATE INDEX `Associado_status_idx` ON `Associado`(`status`);

-- CreateIndex
CREATE INDEX `Associado_cpf_idx` ON `Associado`(`cpf`);

-- CreateIndex
CREATE INDEX `Associado_createdAt_idx` ON `Associado`(`createdAt`);

-- CreateIndex
CREATE INDEX `Aviso_associadoId_idx` ON `Aviso`(`associadoId`);

-- CreateIndex
CREATE INDEX `Boleto_status_idx` ON `Boleto`(`status`);

-- CreateIndex
CREATE INDEX `Boleto_dataVencimento_idx` ON `Boleto`(`dataVencimento`);

-- CreateIndex
CREATE INDEX `Boleto_createdAt_idx` ON `Boleto`(`createdAt`);

-- CreateIndex
CREATE INDEX `Boleto_status_dataVencimento_idx` ON `Boleto`(`status`, `dataVencimento`);

-- CreateIndex
CREATE INDEX `Chamada_data_idx` ON `Chamada`(`data`);

-- CreateIndex
CREATE INDEX `Chamada_status_idx` ON `Chamada`(`status`);

-- CreateIndex
CREATE INDEX `Chamada_createdAt_idx` ON `Chamada`(`createdAt`);

-- CreateIndex
CREATE INDEX `Chamada_data_status_idx` ON `Chamada`(`data`, `status`);

-- CreateIndex
CREATE INDEX `PasswordReset_codigo_idx` ON `PasswordReset`(`codigo`);

-- CreateIndex
CREATE INDEX `PasswordReset_expiraEm_idx` ON `PasswordReset`(`expiraEm`);

-- CreateIndex
CREATE INDEX `PasswordReset_usado_idx` ON `PasswordReset`(`usado`);

-- CreateIndex
CREATE INDEX `PresencaChamada_chamadaId_idx` ON `PresencaChamada`(`chamadaId`);

-- CreateIndex
CREATE INDEX `PresencaChamada_associadoId_idx` ON `PresencaChamada`(`associadoId`);

-- CreateIndex
CREATE UNIQUE INDEX `PresencaChamada_chamadaId_associadoId_key` ON `PresencaChamada`(`chamadaId`, `associadoId`);

-- CreateIndex
CREATE INDEX `Solicitacao_status_idx` ON `Solicitacao`(`status`);

-- CreateIndex
CREATE INDEX `Solicitacao_tipo_idx` ON `Solicitacao`(`tipo`);

-- CreateIndex
CREATE INDEX `Solicitacao_createdAt_idx` ON `Solicitacao`(`createdAt`);

-- CreateIndex
CREATE INDEX `Transporte_associacaoId_idx` ON `Transporte`(`associacaoId`);

-- CreateIndex
CREATE INDEX `Usuario_deletedAt_idx` ON `Usuario`(`deletedAt`);

-- CreateIndex
CREATE INDEX `Usuario_createdAt_idx` ON `Usuario`(`createdAt`);

-- AddForeignKey
ALTER TABLE `NormaDocumento` ADD CONSTRAINT `NormaDocumento_associacaoId_fkey` FOREIGN KEY (`associacaoId`) REFERENCES `Associacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Associado` ADD CONSTRAINT `Associado_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Documento` ADD CONSTRAINT `Documento_associadoId_fkey` FOREIGN KEY (`associadoId`) REFERENCES `Associado`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
