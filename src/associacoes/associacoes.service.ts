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
      include: { transportes: true },
    });
    if (!associacao) throw new NotFoundException('Associação não encontrada');

    const transporte = associacao.transportes?.[0] ?? null;

    return {
      nomeAssociacao: associacao.nome,
      sigla: associacao.sigla,
      cnpj: associacao.cnpj,
      emailInstitucional: associacao.email,
      telefoneAssociacao: associacao.telefone,
      ruaAssociacao: associacao.rua,
      bairroAssociacao: associacao.bairro,
      numeroAssociacao: associacao.numero,
      cepAssociacao: associacao.cep,
      cidadeAssociacao: associacao.cidade,
      estadoAssociacao: associacao.estado,
      quantidadePoltronas: transporte ? String(transporte.poltronas) : '',
      diasTransporte: transporte?.dias ?? '',
      horarioSaida: transporte?.horarioIda ?? '',
      horarioRetorno: transporte?.horarioVolta ?? '',
      pontoPartida: transporte?.pontoPartida ?? '',
    };
  }

  async update(id: number, dto: UpdateAssociacaoDto & Record<string, any>, updatedBy?: number) {
    await this.findOne(id);

    const associacaoData: any = {};
    if (dto.nomeAssociacao !== undefined) associacaoData.nome = dto.nomeAssociacao;
    if (dto.sigla !== undefined) associacaoData.sigla = dto.sigla;
    if (dto.cnpj !== undefined) associacaoData.cnpj = dto.cnpj;
    if (dto.emailInstitucional !== undefined) associacaoData.email = dto.emailInstitucional;
    if (dto.telefoneAssociacao !== undefined) associacaoData.telefone = dto.telefoneAssociacao;
    if (dto.ruaAssociacao !== undefined) associacaoData.rua = dto.ruaAssociacao;
    if (dto.bairroAssociacao !== undefined) associacaoData.bairro = dto.bairroAssociacao;
    if (dto.numeroAssociacao !== undefined) associacaoData.numero = dto.numeroAssociacao;
    if (dto.cepAssociacao !== undefined) associacaoData.cep = dto.cepAssociacao;
    if (dto.cidadeAssociacao !== undefined) associacaoData.cidade = dto.cidadeAssociacao;
    if (dto.estadoAssociacao !== undefined) associacaoData.estado = dto.estadoAssociacao;

    const temTransporte =
      dto.quantidadePoltronas !== undefined ||
      dto.diasTransporte !== undefined ||
      dto.horarioSaida !== undefined ||
      dto.horarioRetorno !== undefined ||
      dto.pontoPartida !== undefined;

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.associacao.update({
        where: { id },
        data: { ...associacaoData, updatedBy, updatedAt: new Date() },
      });

      if (temTransporte) {
        const existingTransporte = await tx.transporte.findFirst({
          where: { associacaoId: id },
        });

        const transporteData: any = {};
        if (dto.quantidadePoltronas !== undefined) {
          const parsed = parseInt(dto.quantidadePoltronas, 10);
          transporteData.poltronas = isNaN(parsed) ? 0 : parsed;
        }
        if (dto.diasTransporte !== undefined) transporteData.dias = dto.diasTransporte;
        if (dto.horarioSaida !== undefined) transporteData.horarioIda = dto.horarioSaida;
        if (dto.horarioRetorno !== undefined) transporteData.horarioVolta = dto.horarioRetorno;
        if (dto.pontoPartida !== undefined) transporteData.pontoPartida = dto.pontoPartida;

        if (existingTransporte) {
          await tx.transporte.update({
            where: { id: existingTransporte.id },
            data: { ...transporteData, updatedBy, updatedAt: new Date() },
          });
        } else {
          await tx.transporte.create({
            data: { ...transporteData, associacaoId: id, createdBy: updatedBy },
          });
        }
      }

      return updated;
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
