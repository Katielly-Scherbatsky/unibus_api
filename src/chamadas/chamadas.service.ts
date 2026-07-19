import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChamadaDto, PresencaDto } from './dto/create-chamada.dto';
import { UpdateChamadaDto } from './dto/update-chamada.dto';

@Injectable()
export class ChamadasService {
  constructor(private prisma: PrismaService) {}

  private async obterTransporteIdPorUsuario(
    usuarioId: number,
  ): Promise<number> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { associacaoId: true },
    });
    if (!usuario?.associacaoId) {
      throw new NotFoundException('Usuário não vinculado a uma associação');
    }

    const transporte = await this.prisma.transporte.findUnique({
      where: { associacaoId: usuario.associacaoId },
      select: { id: true },
    });
    if (!transporte) {
      throw new NotFoundException(
        'Transporte não encontrado para a associação',
      );
    }

    return transporte.id;
  }

  private intervaloDiaUTC(dataStr: string): { inicio: Date; fim: Date } {
    const limpa = dataStr.trim();
    return {
      inicio: new Date(`${limpa}T00:00:00.000Z`),
      fim: new Date(`${limpa}T23:59:59.999Z`),
    };
  }

  async verificarChamadaPorData(data: string, associacaoId?: number) {
    const { inicio, fim } = this.intervaloDiaUTC(data);

    const where: any = {
      data: { gte: inicio, lte: fim },
      deletedAt: null,
      sentidoViagem: 'IDA',
    };
    if (associacaoId) where.transporte = { associacaoId };

    const chamada = await this.prisma.chamada.findFirst({ where });

    return { existeIda: !!chamada };
  }

  private calcularStatusChamada(associados?: any[]) {
    if (!associados || associados.length === 0) return 'PENDENTE';
    const todosRevisados = associados.every(
      (a) => a.presente !== undefined && a.presente !== null,
    );
    return todosRevisados ? 'FINALIZADO' : 'PENDENTE';
  }

  private async filtrarAssociadosAtivos(associados: PresencaDto[] | undefined) {
    if (!associados || associados.length === 0) return [];
    const ids = [...new Set(associados.map((a) => a.associadoId))];
    const ativos = await this.prisma.associado.findMany({
      where: { id: { in: ids }, status: 'ATIVO' },
      select: { id: true, nome: true, faculdade: true },
    });
    const ativosMap = new Map(ativos.map((a) => [a.id, a]));
    return associados.filter((a) => ativosMap.has(a.associadoId));
  }

  async create(dto: CreateChamadaDto, createdBy?: number) {
    const transporteId = createdBy
      ? await this.obterTransporteIdPorUsuario(createdBy)
      : (dto.transporteId ?? 1);
    const dataUTC = new Date(`${dto.data}T00:00:00.000Z`);
    const associadosAtivos = await this.filtrarAssociadosAtivos(dto.associados);
    const status = this.calcularStatusChamada(associadosAtivos);

    return this.prisma.$transaction(async (tx) => {
      const chamada = await tx.chamada.upsert({
        where: {
          transporteId_data_periodo: {
            transporteId,
            data: dataUTC,
            periodo: dto.periodo,
          },
        },
        update: {
          sentidoViagem: dto.sentidoViagem,
          status,
          updatedBy: createdBy,
          updatedAt: new Date(),
        },
        create: {
          transporteId,
          data: dataUTC,
          periodo: dto.periodo,
          sentidoViagem: dto.sentidoViagem,
          status,
          createdBy,
        },
        select: {
          id: true,
          data: true,
          periodo: true,
          sentidoViagem: true,
          status: true,
          transporteId: true,
        },
      });

      if (associadosAtivos) {
        await tx.presencaChamada.deleteMany({
          where: { chamadaId: chamada.id },
        });

        if (associadosAtivos.length > 0) {
          await tx.presencaChamada.createMany({
            data: associadosAtivos.map((p) => ({
              chamadaId: chamada.id,
              associadoId: p.associadoId,
              presente: p.presente,
              poltrona: parseInt(String(p.poltrona), 10) || 0,
              createdBy,
            })),
            skipDuplicates: true,
          });
        }
      }

      return chamada;
    });
  }

  private buildOrderByAdmin(sortBy?: string, sortOrder?: string): any {
    const order =
      sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'desc';
    const mapeamento: Record<string, any> = {
      data: { data: order },
      status: { status: order },
      sentidoViagem: { sentidoViagem: order },
      createdAt: { createdAt: order },
    };
    return (sortBy && mapeamento[sortBy]) || { data: 'desc' };
  }

  private buildOrderByAssociado(sortBy?: string, sortOrder?: string): any {
    const order =
      sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'desc';
    const mapeamento: Record<string, any> = {
      data: { chamada: { data: order } },
      status: { chamada: { status: order } },
      poltrona: { poltrona: order },
      presenca: { presente: order },
      createdAt: { createdAt: order },
    };
    return (sortBy && mapeamento[sortBy]) || { chamada: { data: 'desc' } };
  }

  private async obterAssociadoIdPorUsuario(
    usuarioId: number,
  ): Promise<number | undefined> {
    const associado = await this.prisma.associado.findUnique({
      where: { usuarioId },
      select: { id: true },
    });
    return associado?.id;
  }

  private calcularPaginacao(page = 1, limit = 20) {
    const todos = Number(limit) === -1;
    const take = todos
      ? undefined
      : Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = todos
      ? undefined
      : (Math.max(Number(page) || 1, 1) - 1) * (take || 0);
    return { todos, take, skip };
  }

  async findAll(
    associacaoId?: number,
    usuarioId?: number,
    tipoUsuario?: string,
    status?: string,
    data?: string,
    presenca?: string,
    poltrona?: string,
    page = 1,
    limit = 20,
    sortBy?: string,
    sortOrder?: string,
    sentidoViagem?: string,
    periodo?: string,
  ) {
    if (tipoUsuario === 'ASSOCIADO' && usuarioId) {
      return this.findAllAssociado(
        associacaoId,
        usuarioId,
        status,
        data,
        presenca,
        poltrona,
        page,
        limit,
        sortBy,
        sortOrder,
        periodo,
      );
    }
    return this.findAllAdmin(
      associacaoId,
      status,
      data,
      sentidoViagem,
      page,
      limit,
      sortBy,
      sortOrder,
      periodo,
    );
  }

  private async findAllAdmin(
    associacaoId?: number,
    status?: string,
    data?: string,
    sentidoViagem?: string,
    page = 1,
    limit = 20,
    sortBy?: string,
    sortOrder?: string,
    periodo?: string,
  ) {
    const where: any = { deletedAt: null };
    if (associacaoId) where.transporte = { associacaoId };
    if (status) where.status = status;
    if (sentidoViagem) where.sentidoViagem = sentidoViagem;
    if (periodo) where.periodo = periodo;
    if (data) {
      const { inicio, fim } = this.intervaloDiaUTC(data);
      where.data = { gte: inicio, lte: fim };
    }

    const { todos, take, skip } = this.calcularPaginacao(page, limit);

    const [chamadas, total] = await Promise.all([
      this.prisma.chamada.findMany({
        where,
        include: {
          transporte: {
            select: {
              id: true,
              placa: true,
              identificacao: true,
              rota: true,
              pontoPartida: true,
              poltronas: true,
            },
          },
          presencas: {
            where: { deletedAt: null },
            select: { presente: true },
          },
        },
        orderBy: this.buildOrderByAdmin(sortBy, sortOrder),
        take,
        skip,
      }),
      this.prisma.chamada.count({ where }),
    ]);

    const dataMapeada = chamadas.map((chamada) => {
      const presencas = chamada.presencas || [];
      const totalPresentes = presencas.filter((p) => p.presente).length;
      const totalAusentes = presencas.filter((p) => !p.presente).length;
      return {
        ...chamada,
        presencas: undefined,
        totalPresentes,
        totalAusentes,
        totalEsperado: presencas.length,
        sentidoViagem: chamada.sentidoViagem,
      };
    });

    return {
      data: dataMapeada,
      total,
      page,
      limit: todos ? -1 : take,
      totalPages: todos ? 1 : Math.ceil(total / (take || 1)),
      modo: 'admin',
    };
  }

  private async findAllAssociado(
    associacaoId?: number,
    usuarioId?: number,
    status?: string,
    data?: string,
    presenca?: string,
    poltrona?: string,
    page = 1,
    limit = 20,
    sortBy?: string,
    sortOrder?: string,
    periodo?: string,
  ) {
    const associadoId = usuarioId
      ? await this.obterAssociadoIdPorUsuario(usuarioId)
      : undefined;

    const presencaBool =
      presenca === 'SIM' ? true : presenca === 'NÃO' ? false : undefined;
    const poltronaNum = poltrona ? parseInt(poltrona, 10) : undefined;

    const where: any = { deletedAt: null };
    if (associadoId) where.associadoId = associadoId;

    const chamadaWhere: any = { deletedAt: null };
    if (associacaoId) chamadaWhere.transporte = { associacaoId };
    if (status) chamadaWhere.status = status;
    if (periodo) chamadaWhere.periodo = periodo;
    if (data) {
      const { inicio, fim } = this.intervaloDiaUTC(data);
      chamadaWhere.data = { gte: inicio, lte: fim };
    }
    where.chamada = chamadaWhere;

    if (presencaBool !== undefined) where.presente = presencaBool;
    if (poltronaNum !== undefined) where.poltrona = poltronaNum;

    const { todos, take, skip } = this.calcularPaginacao(page, limit);

    const [presencas, total] = await Promise.all([
      this.prisma.presencaChamada.findMany({
        where,
        include: {
          chamada: {
            include: {
              transporte: {
                select: {
                  id: true,
                  placa: true,
                  identificacao: true,
                  rota: true,
                  pontoPartida: true,
                },
              },
            },
          },
        },
        orderBy: this.buildOrderByAssociado(sortBy, sortOrder),
        take,
        skip,
      }),
      this.prisma.presencaChamada.count({ where }),
    ]);

    const dataMapeada = presencas.map((presenca) => ({
      id: presenca.id,
      chamadaId: presenca.chamadaId,
      associadoId: presenca.associadoId,
      data: presenca.chamada.data,
      periodo: presenca.chamada.periodo,
      sentidoViagem: presenca.chamada.sentidoViagem,
      status: presenca.chamada.status,
      poltrona: String(presenca.poltrona || '').padStart(2, '0'),
      presente: presenca.presente,
      transporte: presenca.chamada.transporte,
    }));

    return {
      data: dataMapeada,
      total,
      page,
      limit: todos ? -1 : take,
      totalPages: todos ? 1 : Math.ceil(total / (take || 1)),
      modo: 'associado',
    };
  }

  async findOne(id: number, associacaoId?: number) {
    const where: any = { id, deletedAt: null };
    if (associacaoId) where.transporte = { associacaoId };
    const chamada = await this.prisma.chamada.findFirst({
      where,
      include: {
        presencas: {
          where: { deletedAt: null },
          include: { associado: { select: { nome: true, faculdade: true } } },
        },
      },
    });
    if (!chamada) throw new NotFoundException('Chamada não encontrada');
    return chamada;
  }

  async update(
    id: number,
    dto: UpdateChamadaDto,
    updatedBy?: number,
    associacaoId?: number,
  ) {
    const associadosAtivos = await this.filtrarAssociadosAtivos(dto.associados);
    const [_, status] = await Promise.all([
      this.findOne(id, associacaoId),
      this.calcularStatusChamada(associadosAtivos),
    ]);

    const transporteId = updatedBy
      ? await this.obterTransporteIdPorUsuario(updatedBy)
      : (dto.transporteId ?? undefined);

    return this.prisma.$transaction(async (tx) => {
      const data: any = {
        transporteId,
        periodo: dto.periodo,
        sentidoViagem: dto.sentidoViagem,
        status,
        updatedBy,
        updatedAt: new Date(),
      };
      if (dto.data) data.data = new Date(`${dto.data}T00:00:00.000Z`);
      Object.keys(data).forEach(
        (key) => data[key] === undefined && delete data[key],
      );

      const chamada = await tx.chamada.update({
        where: { id },
        data,
        select: {
          id: true,
          data: true,
          periodo: true,
          sentidoViagem: true,
          status: true,
          transporteId: true,
        },
      });

      if (associadosAtivos) {
        await tx.presencaChamada.deleteMany({
          where: { chamadaId: id },
        });

        if (associadosAtivos.length > 0) {
          await tx.presencaChamada.createMany({
            data: associadosAtivos.map((p) => ({
              chamadaId: id,
              associadoId: p.associadoId,
              presente: p.presente,
              poltrona: parseInt(String(p.poltrona), 10) || 0,
              createdBy: updatedBy,
            })),
            skipDuplicates: true,
          });
        }
      }

      return chamada;
    });
  }

  async remove(id: number, deletedBy?: number) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.presencaChamada.updateMany({
          where: { chamadaId: id, deletedAt: null },
          data: { deletedAt: new Date(), deletedBy },
        });
        return tx.chamada.update({
          where: { id, deletedAt: null },
          data: { deletedAt: new Date(), deletedBy },
        });
      });
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException('Chamada não encontrada');
      }
      throw error;
    }
  }
}
