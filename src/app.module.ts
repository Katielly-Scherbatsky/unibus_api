import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AssociadosModule } from './associados/associados.module';
import { AssociacoesModule } from './associacoes/associacoes.module';
import { TransportesModule } from './transportes/transportes.module';
import { BoletosModule } from './boletos/boletos.module';
import { ChamadasModule } from './chamadas/chamadas.module';
import { SolicitacoesModule } from './solicitacoes/solicitacoes.module';
import { AdvertenciasModule } from './advertencias/advertencias.module';
import { AvisosModule } from './avisos/avisos.module';
import { DocumentosModule } from './documentos/documentos.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RelatoriosModule } from './relatorios/relatorios.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    AssociadosModule,
    AssociacoesModule,
    TransportesModule,
    BoletosModule,
    ChamadasModule,
    SolicitacoesModule,
    AdvertenciasModule,
    AvisosModule,
    DocumentosModule,
    DashboardModule,
    RelatoriosModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
