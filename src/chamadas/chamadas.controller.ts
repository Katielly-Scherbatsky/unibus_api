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
import { ChamadasService } from './chamadas.service';
import { CreateChamadaDto } from './dto/create-chamada.dto';
import { UpdateChamadaDto } from './dto/update-chamada.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('chamadas')
export class ChamadasController {
  constructor(private readonly service: ChamadasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateChamadaDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.usuarioId);
  }

  @Get()
  findAll(@Query('status') status?: string) {
    return this.service.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateChamadaDto,
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
