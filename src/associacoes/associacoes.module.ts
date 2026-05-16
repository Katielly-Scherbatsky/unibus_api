import { Module } from '@nestjs/common';
import { AssociacoesService } from './associacoes.service';
import { AssociacoesController } from './associacoes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AssociacoesController],
  providers: [AssociacoesService],
  exports: [AssociacoesService],
})
export class AssociacoesModule {}
