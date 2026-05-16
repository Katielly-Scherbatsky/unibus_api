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
import { TransportesService } from './transportes.service';
import { CreateTransporteDto } from './dto/create-transporte.dto';
import { UpdateTransporteDto } from './dto/update-transporte.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('transportes')
export class TransportesController {
  constructor(private readonly service: TransportesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateTransporteDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.usuarioId);
  }

  @Get()
  findAll(@Query('associacaoId') associacaoId?: string) {
    return this.service.findAll(associacaoId ? Number(associacaoId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransporteDto,
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
