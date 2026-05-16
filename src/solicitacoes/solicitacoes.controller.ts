import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SolicitacoesService } from './solicitacoes.service';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';
import { UpdateSolicitacaoDto } from './dto/update-solicitacao.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('solicitacoes')
export class SolicitacoesController {
  constructor(private readonly service: SolicitacoesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateSolicitacaoDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.usuarioId);
  }

  @Get()
  findAll(
    @Query('tipo') tipo?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll(tipo, status);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSolicitacaoDto,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, dto, user.usuarioId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('acao') acao: 'APROVAR' | 'RECUSAR',
    @CurrentUser() user: any,
  ) {
    return this.service.updateStatus(id, acao, user.email, user.usuarioId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.remove(id, user.usuarioId);
  }
}
