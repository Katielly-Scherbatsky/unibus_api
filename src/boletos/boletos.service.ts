import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoletoDto } from './dto/create-boleto.dto';
import { CreateBoletoLoteDto } from './dto/create-boleto-lote.dto';
import { UpdateBoletoDto } from './dto/update-boleto.dto';

@Injectable()
export class BoletosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBoletoDto, createdBy?: number) {
    return this.prisma.boleto.create({
      data: {
        associadoId: dto.associadoId,
        dataVencimento: new Date(dto.dataVencimento),
        valor: dto.valor,
        status: dto.status,
        createdBy,
      },
    });
  }

  async createLote(dto: CreateBoletoLoteDto, createdBy?: number) {
    return this.prisma.$transaction(
      dto.associadosIds.map((associadoId) =>
        this.prisma.boleto.create({
          data: {
            associadoId,
            dataVencimento: new Date(dto.dataVencimento),
            valor: dto.valor,
            status: 'PENDENTE',
            createdBy,
          },
        })
      )
    );
  }

  async findAll(status?: string) {
    const where: any = { deletedAt: null };
    if (status) where.status = status;
    return this.prisma.boleto.findMany({
      where,
      include: { associado: { select: { nome: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const boleto = await this.prisma.boleto.findFirst({
      where: { id, deletedAt: null },
      include: { associado: { select: { nome: true } } },
    });
    if (!boleto) throw new NotFoundException('Boleto não encontrado');
    return boleto;
  }

  async update(id: number, dto: UpdateBoletoDto, updatedBy?: number) {
    await this.findOne(id);
    const data: any = {
      associadoId: dto.associadoId,
      periodo: dto.periodo,
      valor: dto.valor,
      status: dto.status,
      updatedBy,
      updatedAt: new Date(),
    };
    if (dto.dataVencimento) data.dataVencimento = new Date(dto.dataVencimento);
    Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);
    return this.prisma.boleto.update({ where: { id }, data });
  }

  async remove(id: number, deletedBy?: number) {
    await this.findOne(id);
    return this.prisma.boleto.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  }
}
