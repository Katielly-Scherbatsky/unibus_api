import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';
import { UpdateSolicitacaoDto } from './dto/update-solicitacao.dto';

@Injectable()
export class SolicitacoesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSolicitacaoDto, createdBy?: number) {
    return this.prisma.solicitacao.create({
      data: {
        associadoId: dto.associadoId,
        data: new Date(dto.data),
        tipo: dto.tipo,
        motivo: dto.motivo,
        status: dto.status ?? 'PENDENTE',
        descricao: dto.descricao,
        createdBy,
      },
      select: {
        id: true,
        associadoId: true,
        data: true,
        tipo: true,
        motivo: true,
        status: true,
        descricao: true,
        atendidoPor: true,
        createdAt: true,
      },
    });
  }

  private buildOrderBy(sortBy?: string, sortOrder?: string): any {
    const order =
      sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'desc';
    const mapeamento: Record<string, any> = {
      descricao: { descricao: order },
      tipo: { tipo: order },
      atendidoPor: { atendidoPor: order },
      status: { status: order },
    };
    return (sortBy && mapeamento[sortBy]) || { createdAt: 'desc' };
  }

  async findAll(
    associacaoId?: number,
    tipo?: string,
    status?: string,
    page = 1,
    limit = 20,
    sortBy?: string,
    sortOrder?: string,
    busca?: string,
    associadoId?: number,
  ) {
    const where: any = { deletedAt: null };
    if (associadoId) {
      where.associadoId = associadoId;
    } else if (associacaoId) {
      where.associado = { associacaoId };
    }
    if (tipo) where.tipo = tipo;
    if (status) where.status = status;
    if (busca) {
      where.OR = [
        { motivo: { contains: busca } },
        { descricao: { contains: busca } },
        { associado: { nome: { contains: busca } } },
      ];
    }

    const todos = Number(limit) === -1;
    const take = todos
      ? undefined
      : Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = todos
      ? undefined
      : (Math.max(Number(page) || 1, 1) - 1) * (take || 0);

    const [data, total] = await Promise.all([
      this.prisma.solicitacao.findMany({
        where,
        include: { associado: { select: { nome: true } } },
        orderBy: this.buildOrderBy(sortBy, sortOrder),
        take,
        skip,
      }),
      this.prisma.solicitacao.count({ where }),
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
    const solicitacao = await this.prisma.solicitacao.findFirst({
      where,
      include: { associado: { select: { nome: true } } },
    });
    if (!solicitacao) throw new NotFoundException('Solicitação não encontrada');
    return solicitacao;
  }

  async update(
    id: number,
    dto: UpdateSolicitacaoDto,
    updatedBy?: number,
    associadoId?: number,
  ) {
    const solicitacao = await this.findOne(id, undefined, associadoId);

    const statusUpper = String(solicitacao.status || '').toUpperCase().trim();
    if (statusUpper !== 'PENDENTE') {
      throw new BadRequestException(
        'Solicitações aprovadas ou recusadas não podem ser alteradas.',
      );
    }

    const data: any = {
      tipo: dto.tipo,
      motivo: dto.motivo,
      descricao: dto.descricao,
      updatedBy,
      updatedAt: new Date(),
    };
    if (dto.data) data.data = new Date(dto.data);
    Object.keys(data).forEach(
      (key) => data[key] === undefined && delete data[key],
    );
    return this.prisma.solicitacao.update({
      where: { id },
      data,
      select: {
        id: true,
        associadoId: true,
        data: true,
        tipo: true,
        motivo: true,
        status: true,
        descricao: true,
        atendidoPor: true,
        updatedAt: true,
      },
    });
  }

  async updateStatus(
    id: number,
    acao: 'APROVAR' | 'RECUSAR',
    atendidoPor?: string,
    updatedBy?: number,
  ) {
    await this.findOne(id);
    const data: any = {
      status: acao === 'APROVAR' ? 'APROVADO' : 'RECUSADO',
      updatedBy,
      updatedAt: new Date(),
    };
    if (atendidoPor !== undefined) data.atendidoPor = atendidoPor;
    return this.prisma.solicitacao.update({
      where: { id },
      data,
      select: { id: true, status: true, atendidoPor: true, updatedAt: true },
    });
  }

  async remove(id: number, deletedBy?: number) {
    try {
      return await this.prisma.solicitacao.update({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date(), deletedBy },
      });
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException('Solicitação não encontrada');
      }
      throw error;
    }
  }
}
