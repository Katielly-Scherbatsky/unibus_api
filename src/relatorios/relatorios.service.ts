import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RelatoriosService {
  constructor(private prisma: PrismaService) {}

  private getMesesDoAno() {
    return [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
  }

  private anoAtual() {
    return new Date().getFullYear();
  }

  async obterDashboardMetrics(
    associacaoId?: number,
    associadoId?: number,
    isAssociado = false,
  ) {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mesAtual = agora.getMonth() + 1;

    const inicioMes = new Date(ano, agora.getMonth(), 1);
    const fimMes = new Date(ano, agora.getMonth() + 1, 0, 23, 59, 59);

    if (isAssociado && associadoId) {
      // --- DASHBOARD EXCLUSIVO DO ASSOCIADO ---
      const [
        boletosPagosCount,
        boletosPendentesCount,
        totalPagoSum,
        totalEmAbertoSum,
        proximoBoleto,
        viagensMesCount,
        viagensAnoCount,
        solicPendentesCount,
        solicAprovadasCount,
        solicRecusadasCount,
        avisosNaoLidosCount,
        advertenciasCount,
      ] = await Promise.all([
        this.prisma.boleto.count({
          where: { associadoId, status: 'PAGO', deletedAt: null },
        }),
        this.prisma.boleto.count({
          where: { associadoId, status: 'PENDENTE', deletedAt: null },
        }),
        this.prisma.boleto.aggregate({
          where: { associadoId, status: 'PAGO', deletedAt: null },
          _sum: { valor: true },
        }),
        this.prisma.boleto.aggregate({
          where: { associadoId, status: 'PENDENTE', deletedAt: null },
          _sum: { valor: true },
        }),
        this.prisma.boleto.findFirst({
          where: { associadoId, status: 'PENDENTE', deletedAt: null },
          orderBy: { dataVencimento: 'asc' },
          select: { id: true, valor: true, dataVencimento: true, status: true },
        }),
        this.prisma.presencaChamada.count({
          where: {
            associadoId,
            presente: true,
            chamada: {
              status: 'FINALIZADO',
              data: { gte: inicioMes, lte: fimMes },
              deletedAt: null,
            },
          },
        }),
        this.prisma.presencaChamada.count({
          where: {
            associadoId,
            presente: true,
            chamada: {
              status: 'FINALIZADO',
              data: {
                gte: new Date(ano, 0, 1),
                lte: new Date(ano, 11, 31, 23, 59, 59),
              },
              deletedAt: null,
            },
          },
        }),
        this.prisma.solicitacao.count({
          where: { associadoId, status: 'PENDENTE', deletedAt: null },
        }),
        this.prisma.solicitacao.count({
          where: { associadoId, status: 'APROVADO', deletedAt: null },
        }),
        this.prisma.solicitacao.count({
          where: { associadoId, status: 'RECUSADO', deletedAt: null },
        }),
        this.prisma.avisoUsuario.count({
          where: { associadoId, lido: false },
        }),
        this.prisma.advertencia.count({
          where: { associadoId, deletedAt: null },
        }),
      ]);

      const resumo = await this.resumoMensal(associacaoId, associadoId, ano);
      const chamadasVsPag = await this.chamadasVsPagamentos(
        associacaoId,
        associadoId,
        ano,
      );

      return {
        isAssociado: true,
        cards: {
          financeiro: {
            totalPago: totalPagoSum._sum.valor || 0,
            totalEmAberto: totalEmAbertoSum._sum.valor || 0,
            boletosPagos: boletosPagosCount,
            boletosPendentes: boletosPendentesCount,
            proximoVencimento: proximoBoleto
              ? {
                  valor: proximoBoleto.valor,
                  dataVencimento: proximoBoleto.dataVencimento,
                }
              : null,
          },
          embarques: {
            viagensMes: viagensMesCount,
            viagensAno: viagensAnoCount,
          },
          solicitacoes: {
            pendentes: solicPendentesCount,
            aprovadas: solicAprovadasCount,
            recusadas: solicRecusadasCount,
          },
          comunicacao: {
            avisosNaoLidos: avisosNaoLidosCount,
            advertencias: advertenciasCount,
          },
        },
        graficos: {
          chamadasVsPagamentos: chamadasVsPag,
        },
        tabelaResumo: resumo,
      };
    } else {
      // --- DASHBOARD GERAL ADMINISTRADOR ---
      const whereAssociado: any = { deletedAt: null };
      if (associacaoId) whereAssociado.associacaoId = associacaoId;

      const [
        associadosAtivosCount,
        associadosPendentesCount,
        arrecadadoMesSum,
        emAtrasoSum,
        boletosPagosCount,
        boletosPendentesCount,
        chamadasMesCount,
        solicPendentesCount,
        totalAvisosEnviados,
        totalAvisosLidos,
        totalAdvertenciasCount,
      ] = await Promise.all([
        this.prisma.associado.count({
          where: { ...whereAssociado, status: 'ATIVO' },
        }),
        this.prisma.associado.count({
          where: { ...whereAssociado, status: 'PENDENTE' },
        }),
        this.prisma.boleto.aggregate({
          where: {
            status: 'PAGO',
            deletedAt: null,
            dataVencimento: { gte: inicioMes, lte: fimMes },
            associado: whereAssociado,
          },
          _sum: { valor: true },
        }),
        this.prisma.boleto.aggregate({
          where: {
            status: 'PENDENTE',
            deletedAt: null,
            associado: whereAssociado,
          },
          _sum: { valor: true },
        }),
        this.prisma.boleto.count({
          where: { status: 'PAGO', deletedAt: null, associado: whereAssociado },
        }),
        this.prisma.boleto.count({
          where: {
            status: 'PENDENTE',
            deletedAt: null,
            associado: whereAssociado,
          },
        }),
        this.prisma.chamada.count({
          where: {
            status: 'FINALIZADO',
            deletedAt: null,
            data: { gte: inicioMes, lte: fimMes },
            transporte: associacaoId ? { associacaoId } : undefined,
          },
        }),
        this.prisma.solicitacao.count({
          where: {
            status: 'PENDENTE',
            deletedAt: null,
            associado: whereAssociado,
          },
        }),
        this.prisma.avisoUsuario.count({
          where: {
            aviso: { deletedAt: null },
            associado: whereAssociado,
          },
        }),
        this.prisma.avisoUsuario.count({
          where: {
            lido: true,
            aviso: { deletedAt: null },
            associado: whereAssociado,
          },
        }),
        this.prisma.advertencia.count({
          where: { deletedAt: null, associado: whereAssociado },
        }),
      ]);

      const totalBoletosCount = boletosPagosCount + boletosPendentesCount;
      const taxaInadimplencia =
        totalBoletosCount > 0
          ? Math.round((boletosPendentesCount / totalBoletosCount) * 100)
          : 0;

      const taxaLeituraAvisos =
        totalAvisosEnviados > 0
          ? Math.round((totalAvisosLidos / totalAvisosEnviados) * 100)
          : 0;

      const [resumo, chamadasVsPag, faculdades] = await Promise.all([
        this.resumoMensal(associacaoId, undefined, ano),
        this.chamadasVsPagamentos(associacaoId, undefined, ano),
        this.associadosPorFaculdade(associacaoId),
      ]);

      return {
        isAssociado: false,
        cards: {
          financeiro: {
            totalArrecadadoMes: arrecadadoMesSum._sum.valor || 0,
            valorEmAtraso: emAtrasoSum._sum.valor || 0,
            boletosPagos: boletosPagosCount,
            boletosPendentes: boletosPendentesCount,
            taxaInadimplencia,
          },
          operacao: {
            chamadasMes: chamadasMesCount,
          },
          associados: {
            ativos: associadosAtivosCount,
            pendentes: associadosPendentesCount,
          },
          solicitacoes: {
            pendentes: solicPendentesCount,
          },
          comunicacao: {
            taxaLeituraAvisos,
            totalAdvertencias: totalAdvertenciasCount,
          },
        },
        graficos: {
          chamadasVsPagamentos: chamadasVsPag,
          associadosPorFaculdade: faculdades,
        },
        tabelaResumo: resumo,
      };
    }
  }

  async resumoMensal(associacaoId?: number, associadoId?: number, anoFiltro?: number) {
    const ano = anoFiltro || this.anoAtual();
    const meses = this.getMesesDoAno();

    let boletosSql: string;
    let chamadasSql: string;

    if (associadoId) {
      boletosSql = `
        SELECT
          MONTH(dataVencimento) AS mes,
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'PAGO' THEN 1 ELSE 0 END) AS pagos,
          SUM(CASE WHEN status = 'PENDENTE' THEN 1 ELSE 0 END) AS pendentes
        FROM Boleto
        WHERE deletedAt IS NULL
          AND YEAR(dataVencimento) = ${Number(ano)}
          AND associadoId = ${Number(associadoId)}
        GROUP BY MONTH(dataVencimento)
        ORDER BY mes
      `;
      chamadasSql = `
        SELECT
          MONTH(c.data) AS mes,
          COUNT(*) AS total
        FROM PresencaChamada pc
        JOIN Chamada c ON pc.chamadaId = c.id
        WHERE c.deletedAt IS NULL
          AND c.status = 'FINALIZADO'
          AND YEAR(c.data) = ${Number(ano)}
          AND pc.associadoId = ${Number(associadoId)}
          AND pc.presente = 1
        GROUP BY MONTH(c.data)
        ORDER BY mes
      `;
    } else {
      const filtroBoleto = associacaoId
        ? `AND b.associadoId IN (SELECT id FROM Associado WHERE associacaoId = ${Number(associacaoId)})`
        : '';
      const filtroChamada = associacaoId
        ? `AND c.transporteId IN (SELECT id FROM Transporte WHERE associacaoId = ${Number(associacaoId)})`
        : '';

      boletosSql = `
        SELECT
          MONTH(dataVencimento) AS mes,
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'PAGO' THEN 1 ELSE 0 END) AS pagos,
          SUM(CASE WHEN status = 'PENDENTE' THEN 1 ELSE 0 END) AS pendentes
        FROM Boleto b
        WHERE deletedAt IS NULL
          AND YEAR(dataVencimento) = ${Number(ano)}
          ${filtroBoleto}
        GROUP BY MONTH(dataVencimento)
        ORDER BY mes
      `;
      chamadasSql = `
        SELECT
          MONTH(data) AS mes,
          COUNT(*) AS total
        FROM Chamada c
        WHERE deletedAt IS NULL
          AND status = 'FINALIZADO'
          AND YEAR(data) = ${Number(ano)}
          ${filtroChamada}
        GROUP BY MONTH(data)
        ORDER BY mes
      `;
    }

    const [boletosRows, chamadasRows] = await Promise.all([
      this.prisma.$queryRawUnsafe<
        { mes: number; total: bigint; pagos: bigint; pendentes: bigint }[]
      >(boletosSql),
      this.prisma.$queryRawUnsafe<{ mes: number; total: bigint }[]>(
        chamadasSql,
      ),
    ]);

    const mapBoleto = new Map(boletosRows.map((r) => [Number(r.mes), r]));
    const mapChamada = new Map(chamadasRows.map((r) => [Number(r.mes), r]));

    return meses.map((mes, index) => {
      const mesNum = index + 1;
      const boleto = mapBoleto.get(mesNum);
      const totalBoletos = Number(boleto?.total || 0);
      const pagos = Number(boleto?.pagos || 0);
      const pendentes = Number(boleto?.pendentes || 0);
      const chamadasRealizadas = Number(mapChamada.get(mesNum)?.total || 0);
      const inadimplencia =
        totalBoletos > 0
          ? `${Math.round((pendentes / totalBoletos) * 100)}%`
          : '0%';

      return {
        mes,
        totalBoletos,
        boletosPagos: pagos,
        boletosPendentes: pendentes,
        chamadasRealizadas,
        pagamentosEfetuados: pagos,
        inadimplencia,
      };
    });
  }

  async chamadasVsPagamentos(associacaoId?: number, associadoId?: number, anoFiltro?: number) {
    const ano = anoFiltro || this.anoAtual();
    const meses = this.getMesesDoAno();

    let chamadasSql: string;
    let pagamentosSql: string;

    if (associadoId) {
      chamadasSql = `
        SELECT MONTH(c.data) AS mes, COUNT(*) AS total
        FROM PresencaChamada pc
        JOIN Chamada c ON pc.chamadaId = c.id
        WHERE c.deletedAt IS NULL
          AND c.status = 'FINALIZADO'
          AND YEAR(c.data) = ${Number(ano)}
          AND pc.associadoId = ${Number(associadoId)}
          AND pc.presente = 1
        GROUP BY MONTH(c.data)
        ORDER BY mes
      `;
      pagamentosSql = `
        SELECT MONTH(dataVencimento) AS mes, COUNT(*) AS total
        FROM Boleto
        WHERE deletedAt IS NULL
          AND status = 'PAGO'
          AND YEAR(dataVencimento) = ${Number(ano)}
          AND associadoId = ${Number(associadoId)}
        GROUP BY MONTH(dataVencimento)
        ORDER BY mes
      `;
    } else {
      const filtroBoleto = associacaoId
        ? `AND b.associadoId IN (SELECT id FROM Associado WHERE associacaoId = ${Number(associacaoId)})`
        : '';
      const filtroChamada = associacaoId
        ? `AND c.transporteId IN (SELECT id FROM Transporte WHERE associacaoId = ${Number(associacaoId)})`
        : '';

      chamadasSql = `
        SELECT MONTH(data) AS mes, COUNT(*) AS total
        FROM Chamada c
        WHERE deletedAt IS NULL
          AND status = 'FINALIZADO'
          AND YEAR(data) = ${Number(ano)}
          ${filtroChamada}
        GROUP BY MONTH(data)
        ORDER BY mes
      `;
      pagamentosSql = `
        SELECT MONTH(dataVencimento) AS mes, COUNT(*) AS total
        FROM Boleto b
        WHERE deletedAt IS NULL
          AND status = 'PAGO'
          AND YEAR(dataVencimento) = ${Number(ano)}
          ${filtroBoleto}
        GROUP BY MONTH(dataVencimento)
        ORDER BY mes
      `;
    }

    const [chamadasRows, pagamentosRows] = await Promise.all([
      this.prisma.$queryRawUnsafe<{ mes: number; total: bigint }[]>(
        chamadasSql,
      ),
      this.prisma.$queryRawUnsafe<{ mes: number; total: bigint }[]>(
        pagamentosSql,
      ),
    ]);

    const mapChamada = new Map(chamadasRows.map((r) => [Number(r.mes), r]));
    const mapPagamento = new Map(pagamentosRows.map((r) => [Number(r.mes), r]));

    const dados = meses.map((mes, index) => ({
      mes,
      chamadas: Number(mapChamada.get(index + 1)?.total || 0),
      pagamentos: Number(mapPagamento.get(index + 1)?.total || 0),
    }));

    return {
      labels: dados.map((d) => d.mes),
      chamadas: dados.map((d) => d.chamadas),
      pagamentos: dados.map((d) => d.pagamentos),
      dados,
    };
  }

  async associadosPorFaculdade(associacaoId?: number, associadoId?: number) {
    const where: any = { deletedAt: null };
    if (associacaoId) where.associacaoId = associacaoId;

    const agrupamento = await this.prisma.associado.groupBy({
      by: ['faculdade'],
      where,
      _count: { id: true },
    });

    const dados = agrupamento.map((item) => ({
      faculdade: item.faculdade || 'Não informada',
      quantidade: item._count.id,
    }));

    return {
      labels: dados.map((d) => d.faculdade),
      valores: dados.map((d) => d.quantidade),
      dados,
    };
  }
}
