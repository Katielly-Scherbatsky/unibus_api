import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssociacaoDto } from './dto/create-associacao.dto';
import { UpdateAssociacaoDto } from './dto/update-associacao.dto';

@Injectable()
export class AssociacoesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAssociacaoDto, createdBy?: number) {
    return this.prisma.associacao.create({
      data: { ...dto, createdBy },
    });
  }

  async findAll() {
    return this.prisma.associacao.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const associacao = await this.prisma.associacao.findFirst({
      where: { id, deletedAt: null },
    });
    if (!associacao) throw new NotFoundException('Associação não encontrada');
    return associacao;
  }

  async update(id: number, dto: UpdateAssociacaoDto, updatedBy?: number) {
    await this.findOne(id);
    return this.prisma.associacao.update({
      where: { id },
      data: { ...dto, updatedBy, updatedAt: new Date() },
    });
  }

  async remove(id: number, deletedBy?: number) {
    await this.findOne(id);
    return this.prisma.associacao.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  }
}
