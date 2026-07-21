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
