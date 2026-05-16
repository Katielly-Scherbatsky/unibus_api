import { Module } from '@nestjs/common';
import { SolicitacoesService } from './solicitacoes.service';
import { SolicitacoesController } from './solicitacoes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SolicitacoesController],
  providers: [SolicitacoesService],
  exports: [SolicitacoesService],
})
export class SolicitacoesModule {}
