import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { AssociadosService } from './associados/associados.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly associadosService: AssociadosService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('faculdades')
  async listarFaculdades(@Query('associacaoId') associacaoId?: string) {
    return this.associadosService.listarFaculdades(
      associacaoId ? Number(associacaoId) : undefined,
    );
  }

  @Get('cursos')
  async listarCursos(@Query('associacaoId') associacaoId?: string) {
    return this.associadosService.listarCursos(
      associacaoId ? Number(associacaoId) : undefined,
    );
  }
}
