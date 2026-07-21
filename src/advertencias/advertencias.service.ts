import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TipoAdvertencia } from '@prisma/client';
import { CreateAdvertenciaDto } from './dto/create-advertencia.dto';
import { UpdateAdvertenciaDto } from './dto/update-advertencia.dto';

@Injectable()
export class AdvertenciasService {
  constructor(private prisma: PrismaService) {}

  private parseAssociadoId(value: number | string | undefined): number {
    const parsed = Number(value);
    if (!value || isNaN(parsed)) {
      throw new BadRequestException('associadoId deve ser um número válido');
    }
    return parsed;
  }

  async create(
    dto: CreateAdvertenciaDto,
    createdBy?: number,
    feitoPor?: string,
  ) {
    const associadoId = this.parseAssociadoId(dto.associadoId);
    return this.prisma.advertencia.create({
      data: {
        associadoId,
        data: new Date(dto.data),
        tipo: dto.tipo as TipoAdvertencia,
        motivo: dto.motivo,
        status: dto.status ?? 'PENDENTE',
        descricao: dto.descricao,
        feitoPor: feitoPor ?? dto.feitoPor,
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
        feitoPor: true,
        createdAt: true,
      },
    });
  }

  async findAll(tipo?: string, status?: string, search?: string, associadoId?: number) {
    const where: any = { deletedAt: null };
    if (associadoId) where.associadoId = associadoId;
    if (tipo) where.tipo = tipo;
    if (status) where.status = status;
    if (search?.trim()) {
      const termo = search.trim();
      where.OR = [
        { motivo: { contains: termo } },
        { descricao: { contains: termo } },
        { associado: { nome: { contains: termo } } },
      ];
    }
    return this.prisma.advertencia.findMany({
      where,
      select: {
        id: true,
        associadoId: true,
        data: true,
        tipo: true,
        motivo: true,
        status: true,
        descricao: true,
        feitoPor: true,
        associado: { select: { nome: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, associadoId?: number) {
    const where: any = { id, deletedAt: null };
    if (associadoId) where.associadoId = associadoId;
    const advertencia = await this.prisma.advertencia.findFirst({
      where,
      include: { associado: { select: { nome: true } } },
    });
    if (!advertencia) throw new NotFoundException('Advertência não encontrada');
    return advertencia;
  }

  async update(
    id: number,
    dto: UpdateAdvertenciaDto,
    updatedBy?: number,
    feitoPor?: string,
  ) {
    await this.findOne(id);
    const data: any = {};
    if (dto.associadoId !== undefined) {
      data.associadoId = this.parseAssociadoId(dto.associadoId);
    }
    if (dto.tipo !== undefined) data.tipo = dto.tipo as TipoAdvertencia;
    if (dto.motivo !== undefined) data.motivo = dto.motivo;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.descricao !== undefined) data.descricao = dto.descricao;
    if (dto.feitoPor !== undefined) data.feitoPor = feitoPor ?? dto.feitoPor;
    if (dto.data) data.data = new Date(dto.data);
    data.updatedBy = updatedBy;
    data.updatedAt = new Date();
    return this.prisma.advertencia.update({
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
        feitoPor: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: number, deletedBy?: number) {
    const advertencia = await this.findOne(id);
    if (advertencia.status !== 'PENDENTE') {
      throw new BadRequestException(
        'Apenas advertências com status PENDENTE podem ser excluídas.',
      );
    }
    try {
      return await this.prisma.advertencia.update({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date(), deletedBy },
      });
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException('Advertência não encontrada');
      }
      throw error;
    }
  }

  async marcarLido(id: number, associadoId?: number) {
    await this.findOne(id, associadoId);
    return this.prisma.advertencia.update({
      where: { id },
      data: {
        status: 'LIDO',
        updatedAt: new Date(),
      },
      select: {
        id: true,
        associadoId: true,
        data: true,
        tipo: true,
        motivo: true,
        status: true,
        descricao: true,
        feitoPor: true,
        updatedAt: true,
      },
    });
  }
}

