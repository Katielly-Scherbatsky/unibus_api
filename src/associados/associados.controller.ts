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
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AssociadosService } from './associados.service';
import { CreateAssociadoDto } from './dto/create-associado.dto';
import { UpdateAssociadoDto } from './dto/update-associado.dto';
import { UpdateAssociadoStatusDto } from './dto/update-associado-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { documentoStorage } from '../config/multer.config';

@UseGuards(JwtAuthGuard)
@Controller('associados')
export class AssociadosController {
  constructor(private readonly service: AssociadosService) {}

  private normalizarSortBy(sortBy?: string): string | undefined {
    if (!sortBy) return undefined;
    if (sortBy === 'statusVisual') return 'status';
    return sortBy;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('ADMIN')
  @UseInterceptors(FilesInterceptor('files', 10, { storage: documentoStorage }))
  create(
    @Body() dto: CreateAssociadoDto,
    @CurrentUser() user: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.service.create(dto, user.associacaoId, user.usuarioId, files);
  }

  @Get('ativos')
  findAtivos(@CurrentUser() user: any) {
    return this.service.findAtivos(user.associacaoId);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('faculdade') faculdade?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('busca') busca?: string,
  ) {
    return this.service.findAll(
      user.associacaoId,
      status,
      faculdade,
      page ? +page : undefined,
      limit ? +limit : undefined,
      this.normalizarSortBy(sortBy),
      sortOrder,
      busca,
    );
  }

  @Public()
  @Get('faculdades')
  listarFaculdades(
    @CurrentUser() user?: any,
    @Query('associacaoId') associacaoIdQuery?: string,
  ) {
    const assocId = user?.associacaoId || (associacaoIdQuery ? +associacaoIdQuery : undefined);
    return this.service.listarFaculdades(assocId);
  }

  @Public()
  @Get('cursos')
  listarCursos(
    @CurrentUser() user?: any,
    @Query('associacaoId') associacaoIdQuery?: string,
  ) {
    const assocId = user?.associacaoId || (associacaoIdQuery ? +associacaoIdQuery : undefined);
    return this.service.listarCursos(assocId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.findOne(id, user.associacaoId);
  }

  @Put(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssociadoDto,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, dto, user.usuarioId);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  atualizarStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssociadoStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.service.atualizarStatus(
      id,
      dto.status,
      user.usuarioId,
      user.nome,
    );
  }

  @Patch(':id/aprovar')
  @Roles('ADMIN')
  aprovar(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.aprovar(id, user.usuarioId, user.nome);
  }

  @Patch(':id/reassociar')
  @Roles('ADMIN')
  reassociar(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.reassociar(id, user.usuarioId, user.nome);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.remove(id, user.usuarioId);
  }
}
