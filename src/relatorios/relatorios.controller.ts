import { Controller, Get, UseGuards } from '@nestjs/common';
import { RelatoriosService } from './relatorios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly service: RelatoriosService) {}

  @Get('resumo-mensal')
  resumoMensal(@CurrentUser() user: any) {
    return this.service.resumoMensal(user.associacaoId);
  }

  @Get('chamadas-vs-pagamentos')
  chamadasVsPagamentos(@CurrentUser() user: any) {
    return this.service.chamadasVsPagamentos(user.associacaoId);
  }

  @Get('associados-por-faculdade')
  associadosPorFaculdade(@CurrentUser() user: any) {
    return this.service.associadosPorFaculdade(user.associacaoId);
  }
}
