import { Module } from '@nestjs/common';
import { TransportesService } from './transportes.service';
import { TransportesController } from './transportes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TransportesController],
  providers: [TransportesService],
  exports: [TransportesService],
})
export class TransportesModule {}
