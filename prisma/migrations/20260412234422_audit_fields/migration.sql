/*
  Warnings:

  - Added the required column `updatedAt` to the `Advertencia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Associacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Associado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Aviso` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Boleto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Chamada` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PresencaChamada` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Solicitacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Transporte` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `advertencia` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `associacao` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `associado` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `aviso` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `boleto` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `chamada` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `presencachamada` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `solicitacao` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `transporte` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdBy` INTEGER NULL,
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `deletedBy` INTEGER NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `updatedBy` INTEGER NULL;
