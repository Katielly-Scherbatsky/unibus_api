import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async stats() {
    const [
      membrosTotais,
      chamadasPendentes,
      boletosPendentes,
      solicitacoesPendentes,
      advertenciasPendentes,
      cadastrosPendentes,
    ] = await Promise.all([
      this.prisma.associado.count({ where: { deletedAt: null } }),
      this.prisma.chamada.count({ where: { status: 'PENDENTE', deletedAt: null } }),
      this.prisma.boleto.count({ where: { status: 'PENDENTE', deletedAt: null } }),
      this.prisma.solicitacao.count({ where: { status: 'PENDENTE', deletedAt: null } }),
      this.prisma.advertencia.count({ where: { status: 'PENDENTE', deletedAt: null } }),
      this.prisma.associado.count({ where: { status: 'PENDENTE', deletedAt: null } }),
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

  async resumoMensal() {
    const chamadas = await this.prisma.chamada.groupBy({
      by: ['createdAt'],
      where: { deletedAt: null },
      _count: { id: true },
    });

    const boletos = await this.prisma.boleto.groupBy({
      by: ['createdAt'],
      where: { deletedAt: null, status: 'PAGO' },
      _count: { id: true },
    });

    return { chamadas, pagamentos: boletos };
  }

  async distribuicaoFaculdades() {
    return this.prisma.associado.groupBy({
      by: ['faculdade'],
      where: { deletedAt: null },
      _count: { id: true },
    });
  }
}
