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

  private async checkAcesso(usuarioId: number) {
    const associado = await this.prisma.associado.findFirst({
      where: { usuarioId, deletedAt: null },
      select: { status: true },
    });
    if (associado && associado.status === 'PENDENTE') {
      throw new ForbiddenException(
        'Associados com cadastro pendente não possuem permissão para visualizar o Dashboard.',
      );
    }
  }

  @Get('stats')
  async stats(@CurrentUser() user: any) {
    await this.checkAcesso(user.usuarioId);
    return this.service.stats(user.associacaoId);
  }

  @Get('resumo-mensal')
  async resumoMensal(@CurrentUser() user: any) {
    await this.checkAcesso(user.usuarioId);
    return this.service.resumoMensal(user.associacaoId);
  }

  @Get('distribuicao-faculdades')
  async distribuicaoFaculdades(@CurrentUser() user: any) {
    await this.checkAcesso(user.usuarioId);
    return this.service.distribuicaoFaculdades(user.associacaoId);
  }
}
