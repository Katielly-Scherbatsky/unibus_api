-- CreateTable
CREATE TABLE `AvisoUsuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `avisoId` INTEGER NOT NULL,
    `associadoId` INTEGER NOT NULL,
    `lido` BOOLEAN NOT NULL DEFAULT false,
    `dataLeitura` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AvisoUsuario_avisoId_associadoId_key`(`avisoId`, `associadoId`),
    INDEX `AvisoUsuario_avisoId_idx`(`avisoId`),
    INDEX `AvisoUsuario_associadoId_idx`(`associadoId`),
    INDEX `AvisoUsuario_lido_idx`(`lido`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- DropForeignKey
ALTER TABLE `Aviso` DROP FOREIGN KEY `Aviso_associadoId_fkey`;

-- DropIndex
DROP INDEX `Aviso_associadoId_key` ON `Aviso`;

-- AlterTable
ALTER TABLE `Aviso` DROP COLUMN `associadoId`;
