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
import { AssociadosService } from './associados.service';
import { CreateAssociadoDto } from './dto/create-associado.dto';
import { UpdateAssociadoDto } from './dto/update-associado.dto';
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
    @Query('status') status?: string,
    @Query('faculdade') faculdade?: string,
  ) {
    return this.service.findAll(undefined, status, faculdade);
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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.remove(id, user.usuarioId);
  }
}
