import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssociadoDto } from './dto/create-associado.dto';
import { UpdateAssociadoDto } from './dto/update-associado.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AssociadosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAssociadoDto, associacaoId: number, createdBy?: number) {
    const senha = dto.senha ? await bcrypt.hash(dto.senha, 10) : await bcrypt.hash(dto.cpf, 10);

    return this.prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          email: dto.email,
          senha,
          tipo: 'ASSOCIADO',
          associacaoId,
        },
      });

      const associado = await tx.associado.create({
        data: {
          usuarioId: usuario.id,
          associacaoId,
          transporteId: dto.transporteId ?? null,
          nome: dto.nome,
          cpf: dto.cpf,
          telefone: dto.telefone,
          status: 'ATIVO',
          poltrona: dto.poltrona ?? null,
          rua: dto.rua,
          bairro: dto.bairro,
          numero: dto.numero,
          cep: dto.cep,
          cidade: dto.cidade,
          faculdade: dto.faculdade,
          curso: dto.curso,
          periodo: dto.periodo,
          matricula: dto.matricula,
          createdBy,
        },
      });

      return { ...associado, email: usuario.email };
    });
  }

  async findAll(associacaoId?: number, status?: string, faculdade?: string) {
    const where: any = { deletedAt: null };
    if (associacaoId) where.associacaoId = associacaoId;
    if (status) where.status = status;
    if (faculdade) where.faculdade = faculdade;

    const associados = await this.prisma.associado.findMany({
      where,
      include: { usuario: { select: { email: true, tipo: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return associados.map((a) => ({
      ...a,
      email: a.usuario?.email,
      usuarioTipo: a.usuario?.tipo,
      usuario: undefined,
    }));
  }

  async findOne(id: number) {
    const associado = await this.prisma.associado.findFirst({
      where: { id, deletedAt: null },
      include: { usuario: { select: { email: true } } },
    });
    if (!associado) throw new NotFoundException('Associado não encontrado');
    return { ...associado, email: associado.usuario?.email, usuario: undefined };
  }

  async update(id: number, dto: UpdateAssociadoDto, updatedBy?: number) {
    const associado = await this.prisma.associado.findFirst({
      where: { id, deletedAt: null },
      include: { usuario: true },
    });
    if (!associado) throw new NotFoundException('Associado não encontrado');

    const data: any = {
      nome: dto.nome,
      cpf: dto.cpf,
      telefone: dto.telefone,
      status: dto.status,
      transporteId: dto.transporteId ?? null,
      poltrona: dto.poltrona ?? null,
      rua: dto.rua,
      bairro: dto.bairro,
      numero: dto.numero,
      cep: dto.cep,
      cidade: dto.cidade,
      faculdade: dto.faculdade,
      curso: dto.curso,
      periodo: dto.periodo,
      matricula: dto.matricula,
      updatedBy,
      updatedAt: new Date(),
    };

    Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);

    const updated = await this.prisma.associado.update({
      where: { id },
      data,
    });

    if (dto.email) {
      await this.prisma.usuario.update({
        where: { id: associado.usuarioId },
        data: { email: dto.email },
      });
    }

    return updated;
  }

  async remove(id: number, deletedBy?: number) {
    const associado = await this.prisma.associado.findFirst({
      where: { id, deletedAt: null },
      include: { usuario: true },
    });
    if (!associado) throw new NotFoundException('Associado não encontrado');
    if (associado.usuario?.tipo === 'ADMIN') {
      throw new BadRequestException('Ação negada: Não é possível desassociar o administrador do sistema.');
    }

    return this.prisma.associado.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy, status: 'DESASSOCIADO' },
    });
  }
}
