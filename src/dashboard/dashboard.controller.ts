import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('stats')
  stats(@CurrentUser() user: any) {
    return this.service.stats(user.associacaoId);
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
