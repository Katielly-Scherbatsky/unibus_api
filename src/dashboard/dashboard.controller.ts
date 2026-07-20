import { Controller, Get, UseGuards, ForbiddenException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly service: DashboardService,
    private readonly prisma: PrismaService,
  ) {}

  private async isUserPendente(usuarioId: number) {
    const associado = await this.prisma.associado.findFirst({
      where: { usuarioId, deletedAt: null },
      select: { status: true },
    });
    return associado?.status === 'PENDENTE';
  }

  @Get('stats')
  async stats(@CurrentUser() user: any) {
    const isPendente = await this.isUserPendente(user.usuarioId);
    if (isPendente) {
      return {
        status: 'PENDENTE',
        membrosTotais: 0,
        chamadasPendentes: 0,
        boletosPendentes: 0,
        solicitacoesPendentes: 0,
        advertenciasPendentes: 0,
        cadastrosPendentes: 0,
      };
    }
    return this.service.stats(user.associacaoId);
  }

  @Get('resumo-mensal')
  async resumoMensal(@CurrentUser() user: any) {
    const isPendente = await this.isUserPendente(user.usuarioId);
    if (isPendente) {
      return { chamadas: [], pagamentos: [] };
    }
    return this.service.resumoMensal(user.associacaoId);
  }

  @Get('distribuicao-faculdades')
  async distribuicaoFaculdades(@CurrentUser() user: any) {
    const isPendente = await this.isUserPendente(user.usuarioId);
    if (isPendente) {
      return [];
    }
    return this.service.distribuicaoFaculdades(user.associacaoId);
  }
}
