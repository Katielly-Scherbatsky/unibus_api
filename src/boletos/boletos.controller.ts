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
import { BoletosService } from './boletos.service';
import { CreateBoletoDto } from './dto/create-boleto.dto';
import { CreateBoletoLoteDto } from './dto/create-boleto-lote.dto';
import { UpdateBoletoDto } from './dto/update-boleto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('boletos')
export class BoletosController {
  constructor(private readonly service: BoletosService) {}

  private normalizarSortBy(sortBy?: string): string | undefined {
    if (!sortBy) return undefined;
    if (sortBy === 'statusVisual') return 'status';
    return sortBy;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('ADMIN')
  create(@Body() dto: CreateBoletoDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.usuarioId);
  }

  @Post('lote')
  @HttpCode(HttpStatus.CREATED)
  @Roles('ADMIN')
  createLote(@Body() dto: CreateBoletoLoteDto, @CurrentUser() user: any) {
    return this.service.createLote(dto, user.usuarioId);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('dataEmissao') dataEmissao?: string,
    @Query('dataVencimento') dataVencimento?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.service.findAll(
      user.associacaoId,
      status,
      dataEmissao,
      dataVencimento,
      page ? +page : undefined,
      limit ? +limit : undefined,
      this.normalizarSortBy(sortBy),
      sortOrder,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.findOne(id, user.associacaoId);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBoletoDto,
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
