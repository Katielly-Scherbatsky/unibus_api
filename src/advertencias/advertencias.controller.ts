import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AdvertenciasService } from './advertencias.service';
import { CreateAdvertenciaDto } from './dto/create-advertencia.dto';
import { UpdateAdvertenciaDto } from './dto/update-advertencia.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('advertencias')
export class AdvertenciasController {
  constructor(private readonly service: AdvertenciasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('ADMIN')
  async create(@Body() dto: CreateAdvertenciaDto, @CurrentUser() user: any) {
    try {
      return await this.service.create(dto, user.usuarioId, user.nome);
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Erro ao criar advertência.',
      );
    }
  }

  @Get()
  findAll(
    @Query('tipo') tipo?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(tipo, status, search);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdvertenciaDto,
    @CurrentUser() user: any,
  ) {
    try {
      return await this.service.update(id, dto, user.usuarioId, user.nome);
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Erro ao atualizar advertência.',
      );
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.remove(id, user.usuarioId);
  }
}
