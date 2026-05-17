import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChamadaDto } from './dto/create-chamada.dto';
import { UpdateChamadaDto } from './dto/update-chamada.dto';

@Injectable()
export class ChamadasService {
  constructor(private prisma: PrismaService) {}

  async verificarChamadaPorData(data: string) {
    const inicio = new Date(data)
    inicio.setHours(0, 0, 0, 0)
    const fim = new Date(data)
    fim.setHours(23, 59, 59, 999)

    const chamada = await this.prisma.chamada.findFirst({
      where: {
        data: { gte: inicio, lte: fim },
        deletedAt: null,
        periodo: 'Ida',
      },
    })

    return { existeIda: !!chamada }
  }

  private calcularStatusChamada(associados?: any[]) {
    if (!associados || associados.length === 0) return 'PENDENTE'
    const todosRevisados = associados.every(a => a.presente !== undefined && a.presente !== null)
    return todosRevisados ? 'FINALIZADO' : 'PENDENTE'
  }

  async create(dto: CreateChamadaDto, createdBy?: number) {
    const status = this.calcularStatusChamada(dto.associados)

    return this.prisma.$transaction(async (tx) => {
      const chamada = await tx.chamada.create({
        data: {
          transporteId: dto.transporteId ?? 1,
          data: new Date(dto.data),
          periodo: dto.periodo,
          status,
          createdBy,
        },
      });

      if (dto.associados && dto.associados.length > 0) {
        for (const p of dto.associados) {
          await tx.presencaChamada.create({
            data: {
              chamadaId: chamada.id,
              associadoId: p.associadoId,
              presente: p.presente,
              poltrona: parseInt(p.poltrona, 10) || 0,
              createdBy,
            },
          });
        }
      }

      return chamada;
    });
  }

  async findAll(status?: string) {
    const where: any = { deletedAt: null };
    if (status) where.status = status;
    return this.prisma.chamada.findMany({
      where,
      include: {
        presencas: {
          include: { associado: { select: { nome: true, faculdade: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const chamada = await this.prisma.chamada.findFirst({
      where: { id, deletedAt: null },
      include: {
        presencas: {
          include: { associado: { select: { nome: true, faculdade: true } } },
        },
      },
    });
    if (!chamada) throw new NotFoundException('Chamada não encontrada');
    return chamada;
  }

  async update(id: number, dto: UpdateChamadaDto, updatedBy?: number) {
    await this.findOne(id);
    const status = this.calcularStatusChamada(dto.associados)
    return this.prisma.$transaction(async (tx) => {
      const data: any = {
        transporteId: dto.transporteId ?? undefined,
        periodo: dto.periodo,
        status,
        updatedBy,
        updatedAt: new Date(),
      };
      if (dto.data) data.data = new Date(dto.data);
      Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);

      const chamada = await tx.chamada.update({ where: { id }, data });

      if (dto.associados && dto.associados.length > 0) {
        for (const p of dto.associados) {
          const existing = await tx.presencaChamada.findFirst({
            where: { chamadaId: id, associadoId: p.associadoId },
          });
          if (existing) {
            await tx.presencaChamada.update({
              where: { id: existing.id },
              data: {
                presente: p.presente,
                poltrona: parseInt(p.poltrona, 10) || 0,
                updatedBy,
                updatedAt: new Date(),
              },
            });
          } else {
            await tx.presencaChamada.create({
              data: {
                chamadaId: id,
                associadoId: p.associadoId,
                presente: p.presente,
                poltrona: parseInt(p.poltrona, 10) || 0,
                createdBy: updatedBy,
              },
            });
          }
        }
      }

      return chamada;
    });
  }

  async remove(id: number, deletedBy?: number) {
    await this.findOne(id);
    return this.prisma.chamada.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  }
}
