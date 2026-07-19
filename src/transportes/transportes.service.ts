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
      select: {
        id: true,
        associacaoId: true,
        poltronas: true,
        horarioIda: true,
        horarioVolta: true,
        dias: true,
        pontoPartida: true,
        createdAt: true,
      },
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
      select: {
        id: true,
        associacaoId: true,
        poltronas: true,
        horarioIda: true,
        horarioVolta: true,
        dias: true,
        pontoPartida: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: number, deletedBy?: number) {
    await this.findOne(id);
    return this.prisma.transporte.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
      select: { id: true, deletedAt: true },
    });
  }

  async findPoltronasOcupadas(id: number, dias?: string) {
    const where: any = {
      transporteId: id,
      status: 'ATIVO',
      deletedAt: null,
      poltrona: { not: null },
    };

    const associados = await this.prisma.associado.findMany({
      where,
      select: { poltrona: true, diasTransporte: true },
    });

    if (dias) {
      const diasArray = dias.split(',').map((d) => d.trim()).filter(Boolean);
      return associados
        .filter((a) => {
          if (!a.diasTransporte) return false;
          const aDias = a.diasTransporte.split(',').map((d) => d.trim());
          return aDias.some((d) => diasArray.includes(d));
        })
        .map((a) => a.poltrona)
        .filter((p): p is number => p !== null);
    }

    return associados
      .map((a) => a.poltrona)
      .filter((p): p is number => p !== null);
  }
}
