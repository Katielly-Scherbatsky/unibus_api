const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const ano = 2026;
  const associacaoId = 9;

  const filtroBoleto = `AND b.associadoId IN (SELECT id FROM Associado WHERE associacaoId = ${associacaoId})`;
  const filtroChamada = `AND c.transporteId IN (SELECT id FROM Transporte WHERE associacaoId = ${associacaoId})`;

  const boletosRows = await prisma.$queryRawUnsafe(`
    SELECT
      MONTH(dataVencimento) AS mes,
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'PAGO' THEN 1 ELSE 0 END) AS pagos,
      SUM(CASE WHEN status = 'PENDENTE' THEN 1 ELSE 0 END) AS pendentes
    FROM Boleto b
    WHERE deletedAt IS NULL
      AND YEAR(dataVencimento) = ${ano}
      ${filtroBoleto}
    GROUP BY MONTH(dataVencimento)
    ORDER BY mes
  `);

  const chamadasRows = await prisma.$queryRawUnsafe(`
    SELECT MONTH(data) AS mes, COUNT(*) AS total
    FROM Chamada c
    WHERE deletedAt IS NULL
      AND status = 'FINALIZADO'
      AND YEAR(data) = ${ano}
      ${filtroChamada}
    GROUP BY MONTH(data)
    ORDER BY mes
  `);

  const boletosSemFiltro = await prisma.$queryRawUnsafe(`
    SELECT MONTH(dataVencimento) AS mes, COUNT(*) AS total
    FROM Boleto b
    WHERE deletedAt IS NULL
      AND YEAR(dataVencimento) = ${ano}
    GROUP BY MONTH(dataVencimento)
    ORDER BY mes
  `);

  const chamadasSemFiltro = await prisma.$queryRawUnsafe(`
    SELECT MONTH(data) AS mes, COUNT(*) AS total
    FROM Chamada c
    WHERE deletedAt IS NULL
      AND status = 'FINALIZADO'
      AND YEAR(data) = ${ano}
    GROUP BY MONTH(data)
    ORDER BY mes
  `);

  const datasBoleto = await prisma.$queryRawUnsafe(`
    SELECT id, dataVencimento, YEAR(dataVencimento) as ano, MONTH(dataVencimento) as mes, status
    FROM Boleto
    WHERE deletedAt IS NULL
    LIMIT 10
  `);

  const datasChamada = await prisma.$queryRawUnsafe(`
    SELECT id, data, YEAR(data) as ano, MONTH(data) as mes, status
    FROM Chamada
    WHERE deletedAt IS NULL AND status = 'FINALIZADO'
    LIMIT 10
  `);

  console.log({
    boletosRows,
    chamadasRows,
    boletosSemFiltro,
    chamadasSemFiltro,
    datasBoleto,
    datasChamada,
  });
}

main().finally(() => prisma.$disconnect());
