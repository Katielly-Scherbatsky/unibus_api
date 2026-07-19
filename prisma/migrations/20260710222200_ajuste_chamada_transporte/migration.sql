-- CreateIndex
CREATE INDEX `Chamada_transporteId_idx` ON `Chamada`(`transporteId`);

-- CreateIndex
CREATE UNIQUE INDEX `Chamada_transporteId_data_periodo_key` ON `Chamada`(`transporteId`, `data`, `periodo`);

-- DropIndex
DROP INDEX `Chamada_transporteId_key` ON `Chamada`;
