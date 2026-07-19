import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { NormasService } from './normas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { documentoStorage } from '../config/multer.config';

@UseGuards(JwtAuthGuard)
@Controller('normas')
export class NormasController {
  constructor(private readonly service: NormasService) {}

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('categoria') categoria?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll(
      user.associacaoId,
      categoria,
      page ? +page : undefined,
      limit ? +limit : undefined,
    );
  }

  @Post()
  @Roles('ADMIN')
  @UseInterceptors(FilesInterceptor('files', 10, { storage: documentoStorage }))
  upload(
    @CurrentUser() user: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('categoria') categoria?: string,
    @Body('nome') nome?: string,
  ) {
    return this.service.createMany(
      files,
      user.associacaoId,
      categoria || 'DOCUMENTO',
      nome,
    );
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id, user.associacaoId);
  }
}
