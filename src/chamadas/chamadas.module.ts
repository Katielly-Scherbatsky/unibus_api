import { Module } from '@nestjs/common';
import { ChamadasService } from './chamadas.service';
import { ChamadasController } from './chamadas.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ChamadasController],
  providers: [ChamadasService],
  exports: [ChamadasService],
})
export class ChamadasModule {}
