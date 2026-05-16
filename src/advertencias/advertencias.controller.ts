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
} from '@nestjs/common';
import { AdvertenciasService } from './advertencias.service';
import { CreateAdvertenciaDto } from './dto/create-advertencia.dto';
import { UpdateAdvertenciaDto } from './dto/update-advertencia.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('advertencias')
export class AdvertenciasController {
  constructor(private readonly service: AdvertenciasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateAdvertenciaDto, @CurrentUser() user: any) {
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
    @Body() dto: UpdateAdvertenciaDto,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, dto, user.usuarioId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.remove(id, user.usuarioId);
  }
}
