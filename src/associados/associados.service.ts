import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssociadoDto } from './dto/create-associado.dto';
import { UpdateAssociadoDto } from './dto/update-associado.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AssociadosService {
  constructor(private prisma: PrismaService) {}

  async create(
    dto: CreateAssociadoDto,
    associacaoId: number,
    createdBy?: number,
    files?: Express.Multer.File[],
  ) {
    const senha = dto.senha
      ? await bcrypt.hash(dto.senha, 10)
      : await bcrypt.hash(dto.cpf, 10);

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
          primeiroAcesso: true,
          rua: dto.rua,
          bairro: dto.bairro,
          numero: dto.numero,
          cep: dto.cep,
          cidade: dto.cidade,
          estado: dto.estado ?? null,
          faculdade: dto.faculdade,
          curso: dto.curso,
          periodo: dto.periodo,
          matricula: dto.matricula,
          diasTransporte: Array.isArray(dto.diasTransporte)
            ? dto.diasTransporte.join(',')
            : dto.diasTransporte,
          adminId: createdBy,
          createdBy,
        },
        select: {
          id: true,
          nome: true,
          cpf: true,
          telefone: true,
          status: true,
          transporteId: true,
          poltrona: true,
          faculdade: true,
          curso: true,
          periodo: true,
          matricula: true,
          diasTransporte: true,
          createdAt: true,
        },
      });

      if (files && files.length > 0) {
        await tx.documento.createMany({
          data: files.map((file) => ({
            nome: file.originalname,
            url: file.path,
            tipo: 'DOCUMENTO_PESSOAL',
            associadoId: associado.id,
          })),
        });
      }

      return { ...associado, email: usuario.email };
    });
  }

  private buildOrderBy(sortBy?: string, sortOrder?: string): any {
    const order =
      sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'desc';
    const mapeamento: Record<string, any> = {
      nome: { nome: order },
      faculdade: { faculdade: order },
      atendidoPor: { atendidoPor: order },
      status: { status: order },
    };
    return (sortBy && mapeamento[sortBy]) || { createdAt: 'desc' };
  }

  async findAtivos(associacaoId?: number) {
    const where: any = { status: 'ATIVO', usuario: { tipo: 'ASSOCIADO' } };
    if (associacaoId) where.associacaoId = associacaoId;
    const associados = await this.prisma.associado.findMany({
      where,
      select: {
        id: true,
        nome: true,
        faculdade: true,
        status: true,
        associacaoId: true,
        usuarioId: true,
        poltrona: true,
        createdBy: true,
        diasTransporte: true,
        usuario: { select: { email: true, tipo: true } },
      },
      orderBy: { nome: 'asc' },
    });

    return associados.map((a) => ({
      ...a,
      email: a.usuario?.email,
      usuarioTipo: a.usuario?.tipo,
      diasTransporte: a.diasTransporte ? a.diasTransporte.split(',') : [],
      usuario: undefined,
    }));
  }

  async findAll(
    associacaoId?: number,
    status?: string,
    faculdade?: string,
    page = 1,
    limit = 20,
    sortBy?: string,
    sortOrder?: string,
    busca?: string,
  ) {
    const where: any = {};
    if (associacaoId) where.associacaoId = associacaoId;
    if (status) where.status = status;
    if (faculdade) where.faculdade = faculdade;
    where.usuario = { tipo: 'ASSOCIADO' };
    if (busca) {
      where.OR = [
        { nome: { contains: busca } },
        { cpf: { contains: busca } },
        { usuario: { email: { contains: busca } } },
      ];
    }

    const todos = Number(limit) === -1;
    const take = todos
      ? undefined
      : Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = todos
      ? undefined
      : (Math.max(Number(page) || 1, 1) - 1) * (take || 0);

    const [associados, total] = await Promise.all([
      this.prisma.associado.findMany({
        where,
        select: {
          id: true,
          nome: true,
          faculdade: true,
          status: true,
          associacaoId: true,
          usuarioId: true,
          poltrona: true,
          createdBy: true,
          diasTransporte: true,
          atendidoPor: true,
          usuario: { select: { email: true, tipo: true } },
        },
        orderBy: this.buildOrderBy(sortBy, sortOrder),
        take,
        skip,
      }),
      this.prisma.associado.count({ where }),
    ]);

    const data = associados.map((a) => ({
      ...a,
      email: a.usuario?.email,
      usuarioTipo: a.usuario?.tipo,
      diasTransporte: a.diasTransporte ? a.diasTransporte.split(',') : [],
      usuario: undefined,
    }));

    return {
      data,
      total,
      page,
      limit: todos ? -1 : take,
      totalPages: todos ? 1 : Math.ceil(total / (take || 1)),
    };
  }

  async listarFaculdades(associacaoId?: number) {
    const where: any = { deletedAt: null };
    if (associacaoId) where.associacaoId = associacaoId;
    const result = await this.prisma.associado.findMany({
      where,
      distinct: ['faculdade'],
      select: { faculdade: true },
    });
    return result.map((r) => r.faculdade).filter(Boolean);
  }

  async listarCursos(associacaoId?: number) {
    const where: any = { deletedAt: null };
    if (associacaoId) where.associacaoId = associacaoId;
    const result = await this.prisma.associado.findMany({
      where,
      distinct: ['curso'],
      select: { curso: true },
    });
    return result.map((r) => r.curso).filter(Boolean);
  }

  async findOne(id: number, associacaoId?: number) {
    const where: any = { id, deletedAt: null };
    if (associacaoId) where.associacaoId = associacaoId;
    const associado = await this.prisma.associado.findFirst({
      where,
      include: {
        usuario: { select: { email: true } },
        documentos: true,
      },
    });
    if (!associado) throw new NotFoundException('Associado não encontrado');
    return {
      ...associado,
      email: associado.usuario?.email,
      usuario: undefined,
      diasTransporte: associado.diasTransporte
        ? associado.diasTransporte.split(',')
        : [],
    };
  }

  async update(id: number, dto: UpdateAssociadoDto, updatedBy?: number) {
    const associado = await this.prisma.associado.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        usuarioId: true,
        usuario: { select: { tipo: true } },
      },
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
      estado: dto.estado,
      faculdade: dto.faculdade,
      curso: dto.curso,
      periodo: dto.periodo,
      matricula: dto.matricula,
      diasTransporte: Array.isArray(dto.diasTransporte)
        ? dto.diasTransporte.join(',')
        : dto.diasTransporte,
      updatedBy,
      updatedAt: new Date(),
    };

    Object.keys(data).forEach(
      (key) => data[key] === undefined && delete data[key],
    );

    const updated = await this.prisma.associado.update({
      where: { id },
      data,
      select: {
        id: true,
        nome: true,
        cpf: true,
        telefone: true,
        status: true,
        transporteId: true,
        poltrona: true,
        faculdade: true,
        curso: true,
        periodo: true,
        matricula: true,
        diasTransporte: true,
        updatedAt: true,
      },
    });

    if (dto.email) {
      await this.prisma.usuario.update({
        where: { id: associado.usuarioId },
        data: { email: dto.email },
      });
    }

    return updated;
  }

  async atualizarStatus(
    id: number,
    status: string,
    updatedBy?: number,
    atendidoPor?: string,
  ) {
    const associado = await this.prisma.associado.findFirst({
      where: { id },
    });
    if (!associado) throw new NotFoundException('Associado não encontrado');

    const data: any = { status, updatedBy, updatedAt: new Date() };
    if (associado.status === 'PENDENTE' && updatedBy) {
      data.adminId = updatedBy;
    }
    if (atendidoPor !== undefined && status === 'ATIVO') {
      data.atendidoPor = atendidoPor;
    }

    return this.prisma.associado.update({
      where: { id },
      data,
    });
  }

  async aprovar(id: number, updatedBy?: number, atendidoPor?: string) {
    const associado = await this.prisma.associado.findFirst({
      where: { id },
    });
    if (!associado) throw new NotFoundException('Associado não encontrado');

    const data: any = {
      status: 'ATIVO',
      adminId: updatedBy ?? associado.adminId,
      updatedBy,
      updatedAt: new Date(),
    };
    if (atendidoPor !== undefined) data.atendidoPor = atendidoPor;

    return this.prisma.associado.update({
      where: { id },
      data,
    });
  }

  async reassociar(id: number, updatedBy?: number, atendidoPor?: string) {
    const associado = await this.prisma.associado.findFirst({
      where: { id },
    });
    if (!associado) throw new NotFoundException('Associado não encontrado');

    const data: any = {
      status: 'ATIVO',
      deletedAt: null,
      deletedBy: null,
      adminId: updatedBy ?? associado.adminId,
      updatedBy,
      updatedAt: new Date(),
    };
    if (atendidoPor !== undefined) data.atendidoPor = atendidoPor;

    return this.prisma.associado.update({
      where: { id },
      data,
    });
  }

  async remove(id: number, deletedBy?: number) {
    const associado = await this.prisma.associado.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        usuarioId: true,
        usuario: { select: { tipo: true } },
      },
    });
    if (!associado) throw new NotFoundException('Associado não encontrado');
    if (associado.usuario?.tipo === 'ADMIN') {
      throw new BadRequestException(
        'Ação negada: Não é possível desassociar o administrador do sistema.',
      );
    }

    return this.prisma.associado.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy, status: 'DESASSOCIADO' },
      select: { id: true, status: true, deletedAt: true },
    });
  }
}
