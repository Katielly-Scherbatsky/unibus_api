import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'segredo_super_secreto',
    });
  }

  async validate(payload: any) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        tipo: true,
        associacaoId: true,
        associado: { select: { id: true, nome: true } },
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return {
      usuarioId: usuario.id,
      email: usuario.email,
      nome: usuario.associado?.nome ?? usuario.email,
      tipo: usuario.tipo,
      associacaoId: usuario.associacaoId,
      associadoId: usuario.associado?.id,
    };
  }
}
