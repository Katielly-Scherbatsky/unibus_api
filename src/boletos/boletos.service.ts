import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoletoDto } from './dto/create-boleto.dto';
import { CreateBoletoLoteDto } from './dto/create-boleto-lote.dto';
import { UpdateBoletoDto } from './dto/update-boleto.dto';

@Injectable()
export class BoletosService {
  constructor(private prisma: PrismaService) {}

  private zerarHorarioUTC(data: string | Date): Date {
    const d = new Date(data);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  private intervaloDiaUTC(dataStr: string): { inicio: Date; fim: Date } {
    const limpa = dataStr.trim();
    return {
      inicio: new Date(`${limpa}T00:00:00.000Z`),
      fim: new Date(`${limpa}T23:59:59.999Z`),
    };
  }

  async create(dto: CreateBoletoDto, createdBy?: number) {
    const associadoAtivo = await this.prisma.associado.findFirst({
      where: { id: dto.associadoId, status: 'ATIVO' },
      select: { id: true },
    });
    if (!associadoAtivo) {
      throw new BadRequestException(
        'Associado não encontrado ou não está ativo.',
      );
    }

    return this.prisma.boleto.create({
      data: {
        associadoId: dto.associadoId,
        dataVencimento: this.zerarHorarioUTC(dto.dataVencimento),
        valor: dto.valor,
        status: dto.status,
        createdBy,
      },
      select: {
        id: true,
        associadoId: true,
        dataVencimento: true,
        valor: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async createLote(dto: CreateBoletoLoteDto, createdBy?: number) {
    const associadosAtivos = await this.prisma.associado.findMany({
      where: {
        id: { in: dto.associadosIds },
        status: 'ATIVO',
      },
      select: { id: true },
    });

    if (associadosAtivos.length === 0) {
      throw new BadRequestException(
        'Nenhum associado ativo encontrado para gerar boletos.',
      );
    }

    return this.prisma.boleto.createMany({
      data: associadosAtivos.map((associado) => ({
        associadoId: associado.id,
        dataVencimento: this.zerarHorarioUTC(dto.dataVencimento),
        valor: dto.valor,
        status: 'PENDENTE',
        createdBy,
      })),
      skipDuplicates: true,
    });
  }

  private inicioDoDiaAtualUTC(): Date {
    const agora = new Date();
    return new Date(
      Date.UTC(
        agora.getFullYear(),
        agora.getMonth(),
        agora.getDate(),
        0,
        0,
        0,
        0,
      ),
    );
  }

  private aplicarFiltroStatus(where: any, status?: string) {
    if (!status) return;

    const statusUpper = status.toUpperCase();
    const hoje = this.inicioDoDiaAtualUTC();

    if (statusUpper === 'PAGO') {
      where.status = 'PAGO';
      return;
    }

    if (statusUpper === 'VENCIDO') {
      where.OR = [
        { status: 'VENCIDO' },
        { status: 'PENDENTE', dataVencimento: { lt: hoje } },
      ];
      return;
    }

    if (statusUpper === 'PENDENTE') {
      where.status = 'PENDENTE';
      where.dataVencimento = { gte: hoje };
      return;
    }

    where.status = status;
  }

  private buildOrderBy(sortBy?: string, sortOrder?: string): any {
    const order =
      sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'desc';
    const mapeamento: Record<string, any> = {
      createdAt: { createdAt: order },
      dataVencimento: { dataVencimento: order },
      valor: { valor: order },
      status: { status: order, dataVencimento: order },
      statusVisual: { status: order, dataVencimento: order },
      'associado.nome': { associado: { nome: order } },
    };
    return (sortBy && mapeamento[sortBy]) || { createdAt: 'desc' };
  }

  async findAll(
    associacaoId?: number,
    status?: string,
    dataEmissao?: string,
    dataVencimento?: string,
    page = 1,
    limit = 20,
    sortBy?: string,
    sortOrder?: string,
    associadoId?: number,
  ) {
    const where: any = { deletedAt: null };
    if (associadoId) {
      where.associadoId = associadoId;
    } else if (associacaoId) {
      where.associado = { associacaoId };
    }
    this.aplicarFiltroStatus(where, status);
    if (dataEmissao) {
      const { inicio, fim } = this.intervaloDiaUTC(dataEmissao);
      where.createdAt = { gte: inicio, lte: fim };
    }
    if (dataVencimento) {
      const { inicio, fim } = this.intervaloDiaUTC(dataVencimento);
      where.dataVencimento = { gte: inicio, lte: fim };
    }

    const todos = Number(limit) === -1;
    const take = todos
      ? undefined
      : Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = todos
      ? undefined
      : (Math.max(Number(page) || 1, 1) - 1) * (take || 0);

    const [data, total] = await Promise.all([
      this.prisma.boleto.findMany({
        where,
        select: {
          id: true,
          associadoId: true,
          dataVencimento: true,
          valor: true,
          status: true,
          createdAt: true,
          associado: { select: { nome: true } },
        },
        orderBy: this.buildOrderBy(sortBy, sortOrder),
        take,
        skip,
      }),
      this.prisma.boleto.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit: todos ? -1 : take,
      totalPages: todos ? 1 : Math.ceil(total / (take || 1)),
    };
  }

  async findOne(id: number, associacaoId?: number, associadoId?: number) {
    const where: any = { id, deletedAt: null };
    if (associadoId) {
      where.associadoId = associadoId;
    } else if (associacaoId) {
      where.associado = { associacaoId };
    }
    const boleto = await this.prisma.boleto.findFirst({
      where,
      include: { associado: { select: { nome: true } } },
    });
    if (!boleto) throw new NotFoundException('Boleto não encontrado');
    return boleto;
  }

  async update(id: number, dto: UpdateBoletoDto, updatedBy?: number) {
    await this.findOne(id);
    const data: any = {
      associadoId: dto.associadoId,
      valor: dto.valor,
      status: dto.status,
      updatedBy,
      updatedAt: new Date(),
    };
    if (dto.dataVencimento)
      data.dataVencimento = this.zerarHorarioUTC(dto.dataVencimento);
    Object.keys(data).forEach(
      (key) => data[key] === undefined && delete data[key],
    );
    return this.prisma.boleto.update({
      where: { id },
      data,
      select: {
        id: true,
        associadoId: true,
        dataVencimento: true,
        valor: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: number, deletedBy?: number) {
    const boleto = await this.prisma.boleto.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, status: true, dataVencimento: true },
    });

    if (!boleto) {
      throw new NotFoundException('Boleto não encontrado');
    }

    const hoje = this.inicioDoDiaAtualUTC();
    const statusUpper = boleto.status?.toUpperCase?.().trim();

    const bloqueado =
      statusUpper === 'PAGO' ||
      statusUpper === 'VENCIDO' ||
      (statusUpper === 'PENDENTE' &&
        boleto.dataVencimento &&
        boleto.dataVencimento < hoje);

    if (bloqueado) {
      throw new BadRequestException(
        'Não é possível excluir boletos pagos ou vencidos',
      );
    }

    return this.prisma.boleto.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date(), deletedBy },
    });
  }
}
