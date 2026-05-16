import { Module } from '@nestjs/common';
import { AssociadosService } from './associados.service';
import { AssociadosController } from './associados.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AssociadosController],
  providers: [AssociadosService],
  exports: [AssociadosService],
})
export class AssociadosModule {}
