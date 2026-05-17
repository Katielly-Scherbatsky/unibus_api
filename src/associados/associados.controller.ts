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
import { AssociadosService } from './associados.service';
import { CreateAssociadoDto } from './dto/create-associado.dto';
import { UpdateAssociadoDto } from './dto/update-associado.dto';
import { UpdateAssociadoStatusDto } from './dto/update-associado-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('associados')
export class AssociadosController {
  constructor(private readonly service: AssociadosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateAssociadoDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.associacaoId, user.usuarioId);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('faculdade') faculdade?: string,
  ) {
    return this.service.findAll(user.associacaoId, status, faculdade);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssociadoDto,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, dto, user.usuarioId);
  }

  @Patch(':id/status')
  atualizarStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssociadoStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.service.atualizarStatus(id, dto.status, user.usuarioId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.remove(id, user.usuarioId);
  }
}
