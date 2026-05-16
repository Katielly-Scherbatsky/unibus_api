/*
  Warnings:

  - You are about to drop the column `descricao` on the `transporte` table. All the data in the column will be lost.
  - Added the required column `pontoPartida` to the `Transporte` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `transporte` DROP COLUMN `descricao`,
    ADD COLUMN `pontoPartida` VARCHAR(191) NOT NULL;
