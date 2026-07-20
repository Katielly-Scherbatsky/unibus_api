import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DocumentosService } from './documentos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { documentoStorage } from '../config/multer.config';

@UseGuards(JwtAuthGuard)
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly service: DocumentosService) {}

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('associadoId') associadoId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const id = associadoId ? parseInt(associadoId, 10) : undefined;
    return this.service.findAll(
      user.associacaoId,
      id,
      page ? +page : undefined,
      limit ? +limit : undefined,
    );
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'files', maxCount: 10 },
      ],
      { storage: documentoStorage },
    ),
  )
  upload(
    @UploadedFiles()
    uploaded: {
      file?: Express.Multer.File[];
      files?: Express.Multer.File[];
    },
    @Body('associadoId') associadoIdRaw?: any,
    @Body('titulo') titulo?: string,
    @CurrentUser() user?: any,
  ) {
    const parsedId = associadoIdRaw ? parseInt(String(associadoIdRaw), 10) : undefined;
    const associadoId = parsedId || user?.associadoId;
    const files = [...(uploaded?.file || []), ...(uploaded?.files || [])];
    return this.service.createMany(files, associadoId, titulo);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.remove(id, user.associacaoId);
  }
}
