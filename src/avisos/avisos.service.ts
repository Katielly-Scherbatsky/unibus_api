import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvisoDto } from './dto/create-aviso.dto';
import { UpdateAvisoDto } from './dto/update-aviso.dto';

@Injectable()
export class AvisosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAvisoDto, createdBy?: number, feitoPor?: string) {
    const associadosAtivos = await this.prisma.associado.findMany({
      where: { status: 'ATIVO', deletedAt: null },
      select: { id: true },
    });

    if (associadosAtivos.length === 0) {
      throw new BadRequestException(
        'Não há associados ativos para receber o aviso.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const aviso = await tx.aviso.create({
        data: {
          data: new Date(dto.data),
          tipo: dto.tipo,
          motivo: dto.motivo,
          status: dto.status ?? 'PENDENTE',
          descricao: dto.descricao,
          feitoPor: feitoPor ?? dto.feitoPor,
          createdBy,
        },
      });

      await tx.avisoUsuario.createMany({
        data: associadosAtivos.map((associado) => ({
          avisoId: aviso.id,
          associadoId: associado.id,
          lido: false,
        })),
        skipDuplicates: true,
      });

      return aviso;
    });
  }

  async findAll(tipo?: string, status?: string, busca?: string) {
    const where: any = { deletedAt: null };
    if (tipo) where.tipo = tipo;
    if (status) where.status = status;
    if (busca) {
      where.OR = [
        { motivo: { contains: busca } },
        { descricao: { contains: busca } },
      ];
    }

    const avisos = await this.prisma.aviso.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        avisoUsuarios: {
          select: { lido: true },
        },
      },
    });

    return avisos.map((aviso) => {
      const total = aviso.avisoUsuarios.length;
      const lidos = aviso.avisoUsuarios.filter((u) => u.lido).length;
      const percentual = total > 0 ? Math.round((lidos / total) * 100) : 0;
      return {
        ...aviso,
        avisoUsuarios: undefined,
        totalAssociados: total,
        totalLidos: lidos,
        percentualLido: percentual,
      };
    });
  }

  async findOne(id: number) {
    const aviso = await this.prisma.aviso.findFirst({
      where: { id, deletedAt: null },
      include: {
        avisoUsuarios: {
          include: {
            associado: { select: { id: true, nome: true } },
          },
          orderBy: { associado: { nome: 'asc' } },
        },
      },
    });
    if (!aviso) throw new NotFoundException('Aviso não encontrado');

    const total = aviso.avisoUsuarios.length;
    const lidos = aviso.avisoUsuarios.filter((u) => u.lido).length;
    const percentual = total > 0 ? Math.round((lidos / total) * 100) : 0;

    return {
      ...aviso,
      totalAssociados: total,
      totalLidos: lidos,
      percentualLido: percentual,
    };
  }

  async update(
    id: number,
    dto: UpdateAvisoDto,
    updatedBy?: number,
    feitoPor?: string,
  ) {
    await this.findOne(id);
    const data: any = {
      tipo: dto.tipo,
      motivo: dto.motivo,
      status: dto.status,
      descricao: dto.descricao,
      feitoPor: feitoPor ?? dto.feitoPor,
      updatedBy,
      updatedAt: new Date(),
    };
    if (dto.data) data.data = new Date(dto.data);
    Object.keys(data).forEach(
      (key) => data[key] === undefined && delete data[key],
    );
    return this.prisma.aviso.update({
      where: { id },
      data,
    });
  }

  async remove(id: number, deletedBy?: number) {
    try {
      return await this.prisma.aviso.update({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date(), deletedBy },
      });
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException('Aviso não encontrado');
      }
      throw error;
    }
  }

  async marcarLido(id: number, associadoId: number) {
    const avisoUsuario = await this.prisma.avisoUsuario.findUnique({
      where: { avisoId_associadoId: { avisoId: id, associadoId } },
    });
    if (!avisoUsuario)
      throw new NotFoundException('Aviso não encontrado para este associado');

    return this.prisma.avisoUsuario.update({
      where: { avisoId_associadoId: { avisoId: id, associadoId } },
      data: { lido: true, dataLeitura: new Date() },
    });
  }
}
