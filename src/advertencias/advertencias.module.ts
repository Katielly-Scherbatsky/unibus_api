import { Module } from '@nestjs/common';
import { AdvertenciasService } from './advertencias.service';
import { AdvertenciasController } from './advertencias.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdvertenciasController],
  providers: [AdvertenciasService],
  exports: [AdvertenciasService],
})
export class AdvertenciasModule {}
