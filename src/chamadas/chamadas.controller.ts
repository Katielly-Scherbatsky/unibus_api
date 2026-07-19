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
import { ChamadasService } from './chamadas.service';
import { CreateChamadaDto } from './dto/create-chamada.dto';
import { UpdateChamadaDto } from './dto/update-chamada.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('chamadas')
export class ChamadasController {
  constructor(private readonly service: ChamadasService) {}

  private normalizarSortBy(sortBy?: string): string | undefined {
    if (!sortBy) return undefined;
    if (sortBy === 'statusVisual') return 'status';
    return sortBy;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('ADMIN')
  create(@Body() dto: CreateChamadaDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.usuarioId);
  }

  @Get('verificar-data')
  verificarData(@Query('data') data: string, @CurrentUser() user: any) {
    return this.service.verificarChamadaPorData(data, user.associacaoId);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('data') data?: string,
    @Query('presenca') presenca?: string,
    @Query('poltrona') poltrona?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('sentidoViagem') sentidoViagem?: string,
    @Query('periodo') periodo?: string,
  ) {
    return this.service.findAll(
      user.associacaoId,
      user.usuarioId,
      user.tipo,
      status,
      data,
      presenca,
      poltrona,
      page ? +page : undefined,
      limit ? +limit : undefined,
      this.normalizarSortBy(sortBy),
      sortOrder,
      sentidoViagem,
      periodo,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.findOne(id, user.associacaoId);
  }

  @Put(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateChamadaDto,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, dto, user.usuarioId, user.associacaoId);
  }

  @Patch(':id/finalizar')
  @Roles('ADMIN')
  finalizar(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.service.finalizar(id, user.usuarioId, user.associacaoId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.remove(id, user.usuarioId);
  }
}
