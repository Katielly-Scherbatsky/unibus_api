import { Injectable, NotFoundException } from '@nestjs/common';
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
    });
  }

  async findAll(tipo?: string, status?: string) {
    const where: any = { deletedAt: null };
    if (tipo) where.tipo = tipo;
    if (status) where.status = status;
    return this.prisma.solicitacao.findMany({
      where,
      include: { associado: { select: { nome: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const solicitacao = await this.prisma.solicitacao.findFirst({
      where: { id, deletedAt: null },
      include: { associado: { select: { nome: true } } },
    });
    if (!solicitacao) throw new NotFoundException('Solicitação não encontrada');
    return solicitacao;
  }

  async update(id: number, dto: UpdateSolicitacaoDto, updatedBy?: number) {
    await this.findOne(id);
    const data: any = {
      associadoId: dto.associadoId,
      tipo: dto.tipo,
      motivo: dto.motivo,
      status: dto.status,
      descricao: dto.descricao,
      updatedBy,
      updatedAt: new Date(),
    };
    if (dto.data) data.data = new Date(dto.data);
    Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);
    return this.prisma.solicitacao.update({ where: { id }, data });
  }

  async updateStatus(id: number, acao: 'APROVAR' | 'RECUSAR', atendidoPor?: string, updatedBy?: number) {
    await this.findOne(id);
    return this.prisma.solicitacao.update({
      where: { id },
      data: {
        status: acao === 'APROVAR' ? 'APROVADO' : 'RECUSADO',
        updatedBy,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: number, deletedBy?: number) {
    await this.findOne(id);
    return this.prisma.solicitacao.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  }
}
