import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async stats(associacaoId: number) {
    const baseAssociado = {
      deletedAt: null,
      associacaoId,
      usuario: { tipo: 'ASSOCIADO' },
    };
    const baseAssociadoPendente = {
      deletedAt: null,
      associacaoId,
      status: 'PENDENTE',
    };

    const [
      membrosTotais,
      chamadasPendentes,
      boletosPendentes,
      solicitacoesPendentes,
      advertenciasPendentes,
      cadastrosPendentes,
    ] = await Promise.all([
      this.prisma.associado.count({ where: baseAssociado }),
      this.prisma.chamada.count({
        where: {
          status: 'PENDENTE',
          deletedAt: null,
          transporte: { associacaoId },
        },
      }),
      this.prisma.boleto.count({
        where: {
          status: 'PENDENTE',
          deletedAt: null,
          associado: { associacaoId },
        },
      }),
      this.prisma.solicitacao.count({
        where: {
          status: 'PENDENTE',
          deletedAt: null,
          associado: { associacaoId },
        },
      }),
      this.prisma.advertencia.count({
        where: {
          status: 'PENDENTE',
          deletedAt: null,
          associado: { associacaoId },
        },
      }),
      this.prisma.associado.count({ where: baseAssociadoPendente }),
    ]);

    return {
      membrosTotais,
      chamadasPendentes,
      boletosPendentes,
      solicitacoesPendentes,
      advertenciasPendentes,
      cadastrosPendentes,
    };
  }

  async resumoMensal(associacaoId?: number) {
    const whereClause = associacaoId
      ? `AND c.transporteId IN (SELECT id FROM Transporte WHERE associacaoId = ${associacaoId})`
      : '';

    const chamadas = await this.prisma.$queryRawUnsafe<
      { mes: number; total: bigint }[]
    >(`
      SELECT MONTH(data) AS mes, COUNT(*) AS total
      FROM Chamada
      WHERE deletedAt IS NULL
        AND status = 'FINALIZADO'
        ${whereClause}
      GROUP BY MONTH(data)
      ORDER BY mes
    `);

    const whereBoleto = associacaoId
      ? `AND b.associadoId IN (SELECT id FROM Associado WHERE associacaoId = ${associacaoId})`
      : '';

    const boletos = await this.prisma.$queryRawUnsafe<
      { mes: number; total: bigint }[]
    >(`
      SELECT MONTH(dataVencimento) AS mes, COUNT(*) AS total
      FROM Boleto b
      WHERE deletedAt IS NULL
        AND status = 'PAGO'
        ${whereBoleto}
      GROUP BY MONTH(dataVencimento)
      ORDER BY mes
    `);

    return { chamadas, pagamentos: boletos };
  }

  async distribuicaoFaculdades(associacaoId?: number) {
    const where: any = { deletedAt: null };
    if (associacaoId) where.associacaoId = associacaoId;
    return this.prisma.associado.groupBy({
      by: ['faculdade'],
      where,
      _count: { id: true },
    });
  }
}
