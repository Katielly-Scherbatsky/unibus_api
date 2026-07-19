import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentosService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    associacaoId: number,
    associadoId?: number,
    page = 1,
    limit = 20,
  ) {
    const where: any = {};
    if (associacaoId) where.associado = { associacaoId };
    if (associadoId) where.associadoId = associadoId;

    const todos = Number(limit) === -1;
    const take = todos
      ? undefined
      : Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = todos
      ? undefined
      : (Math.max(Number(page) || 1, 1) - 1) * (take || 0);

    const [data, total] = await Promise.all([
      this.prisma.documento.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.documento.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit: todos ? -1 : take,
      totalPages: todos ? 1 : Math.ceil(total / (take || 1)),
    };
  }

  async createMany(
    files: Express.Multer.File[],
    associadoId: number,
    titulo?: string,
  ) {
    if (!files || files.length === 0) return [];
    const tituloBase = titulo?.trim();
    await this.prisma.documento.createMany({
      data: files.map((file, index) => ({
        nome: tituloBase && index === 0 ? tituloBase : file.originalname,
        url: `/public/uploads/documentos/${file.filename}`,
        tipo: file.mimetype,
        associadoId,
      })),
      skipDuplicates: true,
    });
    return this.prisma.documento.findMany({
      where: { associadoId },
      orderBy: { createdAt: 'desc' },
      take: files.length,
    });
  }

  async remove(id: number, associacaoId: number) {
    try {
      const doc = await this.prisma.documento.delete({
        where: {
          id,
          associado: { associacaoId },
        },
      });

      const filePath = path.join(
        process.cwd(),
        doc.url.replace('/public/', 'public/'),
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return { message: 'Documento removido com sucesso' };
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException('Documento não encontrado');
      }
      throw error;
    }
  }
}
