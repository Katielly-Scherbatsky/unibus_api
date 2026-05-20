import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvisoDto } from './dto/create-aviso.dto';
import { UpdateAvisoDto } from './dto/update-aviso.dto';

@Injectable()
export class AvisosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAvisoDto, createdBy?: number) {
    return this.prisma.aviso.create({
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
    return this.prisma.aviso.findMany({
      where,
      select: {
        id: true,
        associadoId: true,
        data: true,
        tipo: true,
        motivo: true,
        status: true,
        descricao: true,
        associado: { select: { nome: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const aviso = await this.prisma.aviso.findFirst({
      where: { id, deletedAt: null },
      include: { associado: { select: { nome: true } } },
    });
    if (!aviso) throw new NotFoundException('Aviso não encontrado');
    return aviso;
  }

  async update(id: number, dto: UpdateAvisoDto, updatedBy?: number) {
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
    return this.prisma.aviso.update({ where: { id }, data });
  }

  async remove(id: number, deletedBy?: number) {
    await this.findOne(id);
    return this.prisma.aviso.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  }
}
