import { Controller, Get, UseGuards } from '@nestjs/common';
import { RelatoriosService } from './relatorios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly service: RelatoriosService) {}

  @Get('resumo-mensal')
  resumoMensal() {
    return this.service.resumoMensal();
  }

  @Get('chamadas-vs-pagamentos')
  chamadasVsPagamentos() {
    return this.service.chamadasVsPagamentos();
  }

  @Get('associados-por-faculdade')
  associadosPorFaculdade() {
    return this.service.associadosPorFaculdade();
  }
}
