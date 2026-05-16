import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransporteDto } from './dto/create-transporte.dto';
import { UpdateTransporteDto } from './dto/update-transporte.dto';

@Injectable()
export class TransportesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTransporteDto, createdBy?: number) {
    return this.prisma.transporte.create({
      data: { ...dto, createdBy },
    });
  }

  async findAll(associacaoId?: number) {
    const where: any = { deletedAt: null };
    if (associacaoId) where.associacaoId = associacaoId;
    return this.prisma.transporte.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const transporte = await this.prisma.transporte.findFirst({
      where: { id, deletedAt: null },
    });
    if (!transporte) throw new NotFoundException('Transporte não encontrado');
    return transporte;
  }

  async update(id: number, dto: UpdateTransporteDto, updatedBy?: number) {
    await this.findOne(id);
    return this.prisma.transporte.update({
      where: { id },
      data: { ...dto, updatedBy, updatedAt: new Date() },
    });
  }

  async remove(id: number, deletedBy?: number) {
    await this.findOne(id);
    return this.prisma.transporte.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  }
}
