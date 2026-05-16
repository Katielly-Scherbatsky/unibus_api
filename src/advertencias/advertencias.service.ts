import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdvertenciaDto } from './dto/create-advertencia.dto';
import { UpdateAdvertenciaDto } from './dto/update-advertencia.dto';

@Injectable()
export class AdvertenciasService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAdvertenciaDto, createdBy?: number) {
    return this.prisma.advertencia.create({
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
    return this.prisma.advertencia.findMany({
      where,
      include: { associado: { select: { nome: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const advertencia = await this.prisma.advertencia.findFirst({
      where: { id, deletedAt: null },
      include: { associado: { select: { nome: true } } },
    });
    if (!advertencia) throw new NotFoundException('Advertência não encontrada');
    return advertencia;
  }

  async update(id: number, dto: UpdateAdvertenciaDto, updatedBy?: number) {
    await this.findOne(id);
    const data: any = {
      associadoId: dto.associadoId,
      tipo: dto.tipo,
      motivo: dto.motivo,
      status: dto.status,
      descricao: dto.descricao,
      feitoPor: dto.feitoPor,
      updatedBy,
      updatedAt: new Date(),
    };
    if (dto.data) data.data = new Date(dto.data);
    Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);
    return this.prisma.advertencia.update({ where: { id }, data });
  }

  async remove(id: number, deletedBy?: number) {
    await this.findOne(id);
    return this.prisma.advertencia.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  }
}
