const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const ano = new Date().getFullYear();

  const totalBoletos = await prisma.boleto.count({ where: { deletedAt: null } });
  const boletos2026 = await prisma.boleto.count({
    where: {
      deletedAt: null,
      dataVencimento: {
        gte: new Date(`${ano}-01-01T00:00:00.000Z`),
        lte: new Date(`${ano}-12-31T23:59:59.999Z`),
      },
    },
  });

  const totalChamadas = await prisma.chamada.count({ where: { deletedAt: null } });
  const chamadas2026 = await prisma.chamada.count({
    where: {
      deletedAt: null,
      status: 'FINALIZADO',
      data: {
        gte: new Date(`${ano}-01-01T00:00:00.000Z`),
        lte: new Date(`${ano}-12-31T23:59:59.999Z`),
      },
    },
  });

  const boletosPorAno = await prisma.$queryRawUnsafe(`
    SELECT YEAR(dataVencimento) as ano, COUNT(*) as total
    FROM Boleto
    WHERE deletedAt IS NULL
    GROUP BY YEAR(dataVencimento)
    ORDER BY ano
  `);

  const chamadasPorAno = await prisma.$queryRawUnsafe(`
    SELECT YEAR(data) as ano, COUNT(*) as total
    FROM Chamada
    WHERE deletedAt IS NULL AND status = 'FINALIZADO'
    GROUP BY YEAR(data)
    ORDER BY ano
  `);

  const boletosSample = await prisma.boleto.findMany({
    take: 5,
    select: { id: true, dataVencimento: true, status: true, createdAt: true, deletedAt: true },
    orderBy: { id: 'asc' },
  });

  const chamadasSample = await prisma.chamada.findMany({
    take: 5,
    select: { id: true, data: true, status: true, createdAt: true, deletedAt: true },
    orderBy: { id: 'asc' },
  });

  const associacaoId = 9;
  const boletosDaAssociacao = await prisma.boleto.count({
    where: { deletedAt: null, associado: { associacaoId } },
  });
  const chamadasDaAssociacao = await prisma.chamada.count({
    where: { deletedAt: null, transporte: { associacaoId } },
  });

  console.log({
    anoAtual: ano,
    totalBoletos,
    boletos2026,
    totalChamadas,
    chamadas2026,
    boletosPorAno,
    chamadasPorAno,
    boletosSample,
    chamadasSample,
    boletosDaAssociacao,
    chamadasDaAssociacao,
  });
}

main().finally(() => prisma.$disconnect());
