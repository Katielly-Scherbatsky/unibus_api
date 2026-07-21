import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async stats(associacaoId: number, associadoId?: number) {
    if (associadoId) {
      const baseAssociado = {
        deletedAt: null,
        status: 'ATIVO',
      };
      if (associacaoId) (baseAssociado as any).associacaoId = associacaoId;

      const [
        membrosTotais,
        chamadasPendentes,
        boletosPendentes,
        solicitacoesPendentes,
        advertenciasPendentes,
      ] = await Promise.all([
        this.prisma.associado.count({ where: baseAssociado }),
        this.prisma.presencaChamada.count({
          where: {
            associadoId,
            chamada: {
              status: 'PENDENTE',
              deletedAt: null,
            },
          },
        }),
        this.prisma.boleto.count({
          where: {
            associadoId,
            status: 'PENDENTE',
            deletedAt: null,
          },
        }),
        this.prisma.solicitacao.count({
          where: {
            associadoId,
            status: 'PENDENTE',
            deletedAt: null,
          },
        }),
        this.prisma.advertencia.count({
          where: {
            associadoId,
            status: 'PENDENTE',
            deletedAt: null,
          },
        }),
      ]);

      return {
        membrosTotais,
        chamadasPendentes,
        boletosPendentes,
        solicitacoesPendentes,
        advertenciasPendentes,
      };
    }

    const baseAssociado: any = {
      deletedAt: null,
      status: 'ATIVO',
    };
    if (associacaoId) baseAssociado.associacaoId = associacaoId;

    const baseAssociadoPendente: any = {
      deletedAt: null,
      status: 'PENDENTE',
    };
    if (associacaoId) baseAssociadoPendente.associacaoId = associacaoId;

    const baseChamada: any = {
      status: 'PENDENTE',
      deletedAt: null,
    };
    if (associacaoId) baseChamada.transporte = { associacaoId };

    const baseBoleto: any = {
      status: 'PENDENTE',
      deletedAt: null,
    };
    if (associacaoId) baseBoleto.associado = { associacaoId };

    const baseSolicitacao: any = {
      status: 'PENDENTE',
      deletedAt: null,
    };
    if (associacaoId) baseSolicitacao.associado = { associacaoId };

    const baseAdvertencia: any = {
      status: 'PENDENTE',
      deletedAt: null,
    };
    if (associacaoId) baseAdvertencia.associado = { associacaoId };

    const [
      membrosTotais,
      chamadasPendentes,
      boletosPendentes,
      solicitacoesPendentes,
      advertenciasPendentes,
      cadastrosPendentes,
    ] = await Promise.all([
      this.prisma.associado.count({ where: baseAssociado }),
      this.prisma.chamada.count({ where: baseChamada }),
      this.prisma.boleto.count({ where: baseBoleto }),
      this.prisma.solicitacao.count({ where: baseSolicitacao }),
      this.prisma.advertencia.count({ where: baseAdvertencia }),
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

    const query = `
      SELECT 
        MONTH(c.data) as mes,
        COUNT(DISTINCT c.id) as chamadas,
        (
          SELECT COUNT(*) 
          FROM Boleto b 
          WHERE b.deletedAt IS NULL 
            AND b.status = 'PAGO' 
            AND MONTH(b.dataVencimento) = MONTH(c.data)
            AND YEAR(b.dataVencimento) = YEAR(c.data)
            ${associacaoId ? `AND b.associadoId IN (SELECT id FROM Associado WHERE associacaoId = ${associacaoId})` : ''}
        ) as pagamentos
      FROM Chamada c
      WHERE c.deletedAt IS NULL 
        AND c.status = 'FINALIZADO'
        AND YEAR(c.data) = YEAR(CURRENT_DATE())
        ${whereClause}
      GROUP BY MONTH(c.data)
      ORDER BY mes ASC
    `;

    return this.prisma.$queryRawUnsafe(query);
  }

  async distribuicaoFaculdades(associacaoId?: number) {
    const where: any = {
      deletedAt: null,
      status: 'ATIVO',
    };
    if (associacaoId) where.associacaoId = associacaoId;

    return this.prisma.associado.groupBy({
      by: ['faculdade'],
      where,
      _count: {
        id: true,
      },
    });
  }
}
