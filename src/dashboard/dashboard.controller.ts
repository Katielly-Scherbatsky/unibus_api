import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('stats')
  stats() {
    return this.service.stats();
  }

  @Get('resumo-mensal')
  resumoMensal() {
    return this.service.resumoMensal();
  }

  @Get('distribuicao-faculdades')
  distribuicaoFaculdades() {
    return this.service.distribuicaoFaculdades();
  }
}
