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
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('solicitacoes')
export class SolicitacoesController {
  constructor(private readonly service: SolicitacoesService) {}

  private normalizarSortBy(sortBy?: string): string | undefined {
    if (!sortBy) return undefined;
    if (sortBy === 'statusVisual') return 'status';
    return sortBy;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateSolicitacaoDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.usuarioId);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('tipo') tipo?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('busca') busca?: string,
  ) {
    const isAssociado = user.tipo === 'ASSOCIADO';
    return this.service.findAll(
      user.associacaoId,
      tipo,
      status,
      page ? +page : undefined,
      limit ? +limit : undefined,
      this.normalizarSortBy(sortBy),
      sortOrder,
      busca,
      isAssociado ? user.associadoId : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const isAssociado = user.tipo === 'ASSOCIADO';
    return this.service.findOne(id, user.associacaoId, isAssociado ? user.associadoId : undefined);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSolicitacaoDto,
    @CurrentUser() user: any,
  ) {
    const isAssociado = user.tipo === 'ASSOCIADO';
    return this.service.update(id, dto, user.usuarioId, isAssociado ? user.associadoId : undefined);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('acao') acao: 'APROVAR' | 'RECUSAR',
    @CurrentUser() user: any,
  ) {
    return this.service.updateStatus(id, acao, user.nome, user.usuarioId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.remove(id, user.usuarioId);
  }
}
