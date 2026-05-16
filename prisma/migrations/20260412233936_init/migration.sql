-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Associacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `sigla` VARCHAR(191) NOT NULL,
    `cnpj` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `rua` VARCHAR(191) NOT NULL,
    `bairro` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `cep` VARCHAR(191) NOT NULL,
    `cidade` VARCHAR(191) NOT NULL,
    `estado` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Associado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `associacaoId` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `faculdade` VARCHAR(191) NOT NULL,
    `curso` VARCHAR(191) NOT NULL,
    `periodo` VARCHAR(191) NOT NULL,
    `matricula` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `rua` VARCHAR(191) NOT NULL,
    `bairro` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `cep` VARCHAR(191) NOT NULL,
    `cidade` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Associado_usuarioId_key`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transporte` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `associacaoId` INTEGER NOT NULL,
    `poltronas` INTEGER NOT NULL,
    `horarioIda` VARCHAR(191) NOT NULL,
    `horarioVolta` VARCHAR(191) NOT NULL,
    `dias` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Transporte_associacaoId_key`(`associacaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chamada` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transporteId` INTEGER NOT NULL,
    `data` DATETIME(3) NOT NULL,
    `periodo` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Chamada_transporteId_key`(`transporteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PresencaChamada` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chamadaId` INTEGER NOT NULL,
    `associadoId` INTEGER NOT NULL,
    `presente` BOOLEAN NOT NULL,
    `poltrona` INTEGER NOT NULL,

    UNIQUE INDEX `PresencaChamada_chamadaId_key`(`chamadaId`),
    UNIQUE INDEX `PresencaChamada_associadoId_key`(`associadoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Solicitacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `associadoId` INTEGER NOT NULL,
    `data` DATETIME(3) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `motivo` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Solicitacao_associadoId_key`(`associadoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Boleto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `associadoId` INTEGER NOT NULL,
    `dataVencimento` DATETIME(3) NOT NULL,
    `valor` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Boleto_associadoId_key`(`associadoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Advertencia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `associadoId` INTEGER NOT NULL,
    `data` DATETIME(3) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `motivo` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Advertencia_associadoId_key`(`associadoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Aviso` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `associadoId` INTEGER NOT NULL,
    `data` DATETIME(3) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `motivo` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Aviso_associadoId_key`(`associadoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Associado` ADD CONSTRAINT `Associado_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Associado` ADD CONSTRAINT `Associado_associacaoId_fkey` FOREIGN KEY (`associacaoId`) REFERENCES `Associacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transporte` ADD CONSTRAINT `Transporte_associacaoId_fkey` FOREIGN KEY (`associacaoId`) REFERENCES `Associacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chamada` ADD CONSTRAINT `Chamada_transporteId_fkey` FOREIGN KEY (`transporteId`) REFERENCES `Transporte`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PresencaChamada` ADD CONSTRAINT `PresencaChamada_chamadaId_fkey` FOREIGN KEY (`chamadaId`) REFERENCES `Chamada`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PresencaChamada` ADD CONSTRAINT `PresencaChamada_associadoId_fkey` FOREIGN KEY (`associadoId`) REFERENCES `Associado`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Solicitacao` ADD CONSTRAINT `Solicitacao_associadoId_fkey` FOREIGN KEY (`associadoId`) REFERENCES `Associado`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Boleto` ADD CONSTRAINT `Boleto_associadoId_fkey` FOREIGN KEY (`associadoId`) REFERENCES `Associado`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Advertencia` ADD CONSTRAINT `Advertencia_associadoId_fkey` FOREIGN KEY (`associadoId`) REFERENCES `Associado`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Aviso` ADD CONSTRAINT `Aviso_associadoId_fkey` FOREIGN KEY (`associadoId`) REFERENCES `Associado`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
