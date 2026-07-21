import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RelatoriosService } from './relatorios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly service: RelatoriosService) {}

  @Get('dashboard')
  dashboard(@CurrentUser() user: any) {
    const isAssociado = user.tipo === 'ASSOCIADO';
    return this.service.obterDashboardMetrics(
      user.associacaoId,
      isAssociado ? user.associadoId : undefined,
      isAssociado,
    );
  }

  @Get('resumo-mensal')
  resumoMensal(@CurrentUser() user: any, @Query('ano') ano?: string) {
    const isAssociado = user.tipo === 'ASSOCIADO';
    return this.service.resumoMensal(
      user.associacaoId,
      isAssociado ? user.associadoId : undefined,
      ano ? Number(ano) : undefined,
    );
  }

  @Get('resumo')
  resumoAlias(@CurrentUser() user: any, @Query('ano') ano?: string) {
    const isAssociado = user.tipo === 'ASSOCIADO';
    return this.service.resumoMensal(
      user.associacaoId,
      isAssociado ? user.associadoId : undefined,
      ano ? Number(ano) : undefined,
    );
  }

  @Get('chamadas-vs-pagamentos')
  chamadasVsPagamentos(@CurrentUser() user: any, @Query('ano') ano?: string) {
    const isAssociado = user.tipo === 'ASSOCIADO';
    return this.service.chamadasVsPagamentos(
      user.associacaoId,
      isAssociado ? user.associadoId : undefined,
      ano ? Number(ano) : undefined,
    );
  }

  @Get('chamadas')
  chamadasAlias(@CurrentUser() user: any, @Query('ano') ano?: string) {
    const isAssociado = user.tipo === 'ASSOCIADO';
    return this.service.chamadasVsPagamentos(
      user.associacaoId,
      isAssociado ? user.associadoId : undefined,
      ano ? Number(ano) : undefined,
    );
  }

  @Get('associados-por-faculdade')
  associadosPorFaculdade(@CurrentUser() user: any) {
    const isAssociado = user.tipo === 'ASSOCIADO';
    return this.service.associadosPorFaculdade(
      user.associacaoId,
      isAssociado ? user.associadoId : undefined,
    );
  }

  @Get('faculdades')
  faculdadesAlias(@CurrentUser() user: any) {
    const isAssociado = user.tipo === 'ASSOCIADO';
    return this.service.associadosPorFaculdade(
      user.associacaoId,
      isAssociado ? user.associadoId : undefined,
    );
  }
}
