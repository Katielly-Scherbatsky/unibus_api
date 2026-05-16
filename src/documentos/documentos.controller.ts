import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DocumentosService } from './documentos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly service: DocumentosService) {}

  @Get()
  findAll(@Query('tipo') tipo?: string): any {
    return this.service.findAll(tipo);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body('nome') nome: string,
    @Body('tipo') tipo: 'DOCUMENTO' | 'NORMA',
    @Body('url') url: string,
  ): any {
    return this.service.create(nome, tipo, url);
  }
}
