import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AvisosService } from './avisos.service';
import { CreateAvisoDto } from './dto/create-aviso.dto';
import { UpdateAvisoDto } from './dto/update-aviso.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('avisos')
export class AvisosController {
  constructor(private readonly service: AvisosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('ADMIN')
  create(@Body() dto: CreateAvisoDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.usuarioId, user.nome);
  }

  @Get()
  findAll(
    @Query('tipo') tipo?: string,
    @Query('status') status?: string,
    @Query('busca') busca?: string,
  ) {
    return this.service.findAll(tipo, status, busca);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAvisoDto,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, dto, user.usuarioId, user.nome);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.remove(id, user.usuarioId);
  }

  @Patch(':id/lido')
  marcarLido(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.marcarLido(id, user.associadoId);
  }
}
