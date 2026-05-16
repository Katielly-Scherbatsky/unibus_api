import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RelatoriosService {
  constructor(private prisma: PrismaService) {}

  async resumoMensal() {
    const associados = await this.prisma.associado.findMany({
      where: { deletedAt: null },
      include: { boletos: { where: { deletedAt: null } } },
    });

    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];

    const resumo = meses.map((mes) => {
      const chamadasRealizadas = 0;
      const pagamentosEfetuados = associados.reduce((sum, a) => {
        return sum + a.boletos.filter((b) => b.status === 'PAGO').length;
      }, 0);
      const inadimplencia = '0%';
      return { mes, chamadasRealizadas, pagamentosEfetuados, inadimplencia };
    });

    return resumo;
  }

  async chamadasVsPagamentos() {
    const chamadas = await this.prisma.chamada.count({ where: { deletedAt: null } });
    const pagamentos = await this.prisma.boleto.count({ where: { status: 'PAGO', deletedAt: null } });
    return { chamadas, pagamentos };
  }

  async associadosPorFaculdade() {
    return this.prisma.associado.groupBy({
      by: ['faculdade'],
      where: { deletedAt: null },
      _count: { id: true },
    });
  }
}
