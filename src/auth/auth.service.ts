import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { AutoCadastroAssociadoDto } from './dto/auto-cadastro-associado.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrarAdminDto } from './dto/registrar-admin.dto';
import { RegisterDto } from './dto/register.dto';
import { MailService } from '../mail/mail.service';
import { RedefinirSenhaCodigoDto } from './dto/redefinir-senha-codigo.dto';
import { AtualizarPerfilDto } from './dto/atualizar-perfil.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async buscarAssociadoPorUsuarioId(usuarioId: number) {
    return this.prisma.associado.findUnique({
      where: { usuarioId },
    });
  }

  async realizarLogin(usuario: any) {
    const payload = { email: usuario.email, id: usuario.id };

    const associado = await this.prisma.associado.findUnique({
      where: { usuarioId: usuario.id },
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: usuario.id,
        email: usuario.email,
        tipo: usuario.tipo,
        associacaoId: usuario.associacaoId,
        associadoId: associado?.id ?? null,
        primeiroAcesso: associado?.primeiroAcesso ?? false,
        status: associado?.status ?? null,
        nome: associado?.nome ?? usuario.email,
        avatarUrl: usuario.avatarUrl ?? null,
      },
    };
  }

  async validarUsuario(email: string, senha: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) return null;

    const isMatch = await bcrypt.compare(senha, usuario.senha);

    if (!isMatch) return null;

    return usuario;
  }

  private validarEmail(email: string) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) throw new BadRequestException('E-mail inválido');
  }

  private validarCpf(cpf: string) {
    const nums = cpf.replace(/\D/g, '');
    if (nums.length !== 11)
      throw new BadRequestException('CPF deve ter 11 dígitos');
    if (/^(\d)\1{10}$/.test(nums))
      throw new BadRequestException('CPF inválido');
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(nums.charAt(i)) * (10 - i);
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(nums.charAt(9)))
      throw new BadRequestException('CPF inválido');
    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(nums.charAt(i)) * (11 - i);
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(nums.charAt(10)))
      throw new BadRequestException('CPF inválido');
  }

  private validarCnpj(cnpj: string) {
    const nums = cnpj.replace(/\D/g, '');
    if (nums.length !== 14)
      throw new BadRequestException('CNPJ deve ter 14 dígitos');
    if (/^(\d)\1{13}$/.test(nums))
      throw new BadRequestException('CNPJ inválido');
    const calc = (x: number) => {
      const n = nums.substring(0, x);
      let y = x - 7;
      let s = 0;
      for (let i = x; i >= 1; i--) {
        s += parseInt(n.charAt(x - i)) * y--;
        if (y < 2) y = 9;
      }
      const r = 11 - (s % 11);
      return r > 9 ? 0 : r;
    };
    if (
      calc(12) !== parseInt(nums.charAt(12)) ||
      calc(13) !== parseInt(nums.charAt(13))
    ) {
      throw new BadRequestException('CNPJ inválido');
    }
  }

  private validarHorario(horario: string) {
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(horario)) {
      throw new BadRequestException('Horário inválido. Use o formato HH:mm');
    }
  }

  async registrarAdmin(data: RegistrarAdminDto) {
    const { usuario, associado: adminData, associacao, transporte } = data;
    const associado = adminData;

    this.validarEmail(usuario.email);
    this.validarCpf(associado.cpf);
    this.validarCnpj(associacao.cnpj);
    this.validarHorario(transporte.horarioIda);
    this.validarHorario(transporte.horarioVolta);

    const [emailExiste, cpfExiste, cnpjExiste] = await Promise.all([
      this.prisma.usuario.findUnique({ where: { email: usuario.email } }),
      this.prisma.associado.findFirst({ where: { cpf: associado.cpf } }),
      this.prisma.associacao.findFirst({ where: { cnpj: associacao.cnpj } }),
    ]);
    if (emailExiste) throw new BadRequestException('E-mail já cadastrado');
    if (cpfExiste) throw new BadRequestException('CPF já cadastrado');
    if (cnpjExiste) throw new BadRequestException('CNPJ já cadastrado');

    const senhaHash = await bcrypt.hash(usuario.senha, 10);

    return this.prisma.$transaction(async (tx) => {
      const assoc = await tx.associacao.create({
        data: {
          nome: associacao.nome,
          sigla: associacao.sigla,
          cnpj: associacao.cnpj,
          email: associacao.email,
          telefone: associacao.telefone,
          rua: associacao.rua,
          bairro: associacao.bairro,
          numero: associacao.numero,
          cep: associacao.cep,
          cidade: associacao.cidade,
          estado: associacao.estado,
        },
      });

      const user = await tx.usuario.create({
        data: {
          email: usuario.email,
          senha: senhaHash,
          tipo: 'ADMIN',
          associacaoId: assoc.id,
        },
      });

      const associadoCriado = await tx.associado.create({
        data: {
          usuarioId: user.id,
          associacaoId: assoc.id,
          nome: associado.nome,
          cpf: associado.cpf,
          telefone: associado.telefone,
          rua: associado.rua,
          bairro: associado.bairro,
          numero: associado.numero,
          cep: associado.cep,
          cidade: associado.cidade,
          estado: associado.estado ?? null,
          faculdade: associado.faculdade ?? 'N/A',
          curso: associado.curso ?? 'N/A',
          periodo: associado.periodo ?? 'N/A',
          matricula: associado.matricula ?? 'N/A',
          status: 'ATIVO',
          primeiroAcesso: false,
        },
        select: {
          id: true,
          nome: true,
          cpf: true,
          status: true,
          associacaoId: true,
        },
      });

      const transp = await tx.transporte.create({
        data: {
          associacaoId: assoc.id,
          poltronas: transporte.poltronas,
          horarioIda: transporte.horarioIda,
          horarioVolta: transporte.horarioVolta,
          dias: transporte.dias,
          pontoPartida: transporte.pontoPartida,
        },
        select: {
          id: true,
          associacaoId: true,
          poltronas: true,
          pontoPartida: true,
        },
      });

      delete (user as any).senha;

      return {
        user: {
          id: user.id,
          email: user.email,
          tipo: user.tipo,
          associacaoId: user.associacaoId,
        },
        assoc: { id: assoc.id, nome: assoc.nome },
        transp,
        associado: associadoCriado,
      };
    });
  }

  async registerFromFrontend(dto: RegisterDto) {
    const internalDto: RegistrarAdminDto = {
      usuario: {
        email: dto.email,
        senha: dto.senha,
      },
      associado: {
        nome: dto.nome,
        cpf: dto.cpf,
        telefone: dto.telefone,
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
      },
      associacao: {
        nome: dto.nomeAssociacao,
        sigla: dto.sigla,
        cnpj: dto.cnpj,
        email: dto.emailInstitucional,
        telefone: dto.telefoneAssociacao,
        rua: dto.ruaAssociacao,
        bairro: dto.bairroAssociacao,
        numero: dto.numeroAssociacao,
        cep: dto.cepAssociacao,
        cidade: dto.cidadeAssociacao,
        estado: dto.estadoAssociacao,
      },
      transporte: {
        poltronas: parseInt(dto.quantidadePoltronas, 10) || 0,
        horarioIda: dto.horarioSaida,
        horarioVolta: dto.horarioRetorno,
        dias: dto.diasTransporte,
        pontoPartida: dto.pontoPartida,
      },
    };

    return this.registrarAdmin(internalDto);
  }

  async me(usuarioId: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        email: true,
        tipo: true,
        associacaoId: true,
        avatarUrl: true,
        associado: true,
      },
    });
    if (!usuario) return null;
    return {
      id: usuario.id,
      email: usuario.email,
      tipo: usuario.tipo,
      associacaoId: usuario.associacaoId,
      avatarUrl: usuario.avatarUrl,
      associadoId: usuario.associado?.id ?? null,
      ...usuario.associado,
    };
  }

  async atualizarMe(usuarioId: number, dto: AtualizarPerfilDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { associado: true },
    });
    if (!usuario) throw new BadRequestException('Usuário não encontrado');

    if (dto.email && dto.email !== usuario.email) {
      this.validarEmail(dto.email);
      const emailExiste = await this.prisma.usuario.findUnique({
        where: { email: dto.email },
      });
      if (emailExiste) throw new BadRequestException('E-mail já cadastrado');
      await this.prisma.usuario.update({
        where: { id: usuarioId },
        data: { email: dto.email },
      });
    }

    if (usuario.associado) {
      const data: any = {
        nome: dto.nome,
        cpf: dto.cpf,
        telefone: dto.telefone,
        dataNascimento: dto.dataNascimento,
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
      };
      Object.keys(data).forEach(
        (key) => data[key] === undefined && delete data[key],
      );

      if (Object.keys(data).length > 0) {
        await this.prisma.associado.update({
          where: { id: usuario.associado.id },
          data,
        });
      }
    }

    return this.me(usuarioId);
  }

  async atualizarAvatar(usuarioId: number, file: Express.Multer.File) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });
    if (!usuario) {
      throw new BadRequestException('Usuário não encontrado');
    }

    if (usuario.avatarUrl) {
      const oldPath = path.join(
        process.cwd(),
        usuario.avatarUrl.replace('/public/', 'public/'),
      );
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const avatarUrl = `/public/uploads/avatars/${file.filename}`;
    await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { avatarUrl },
    });

    return { avatarUrl };
  }

  async esqueciSenha(email: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });

    if (usuario) {
      const token = this.jwtService.sign(
        { sub: usuario.id, type: 'password-reset' },
        { expiresIn: '1h' },
      );

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const link = `${frontendUrl}/redefinir-senha?token=${token}`;

      await this.mailService.sendMail(
        email,
        'Recuperação de Senha - UniBus',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #033d3d;">Recuperação de Senha</h2>
            <p>Olá, ${usuario.email}!</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no UniBus.</p>
            <p>Clique no botão abaixo para criar uma nova senha. O link expira em 1 hora.</p>
            <a href="${link}" style="display: inline-block; background: #033d3d; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Redefinir Senha</a>
            <p>Se você não solicitou a redefinição, ignore este e-mail.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="font-size: 12px; color: #888;">UniBus - Gestão Inteligente do Transporte Acadêmico</p>
          </div>
        `,
      );
    }

    return {
      message:
        'Se o e-mail estiver cadastrado, você receberá um link de recuperação em instantes.',
    };
  }

  async redefinirSenha(token: string, novaSenha: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: 'segredo_super_secreto',
      });

      if (payload.type !== 'password-reset') {
        throw new UnauthorizedException('Token inválido.');
      }

      const usuario = await this.prisma.usuario.findUnique({
        where: { id: payload.sub },
      });

      if (!usuario) {
        throw new UnauthorizedException('Usuário não encontrado.');
      }

      const senhaHash = await bcrypt.hash(novaSenha, 10);
      await this.prisma.usuario.update({
        where: { id: usuario.id },
        data: { senha: senhaHash },
      });

      return { message: 'Senha redefinida com sucesso.' };
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
  }

  private gerarCodigoRecuperacao(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async solicitarRecuperacaoCodigo(email: string) {
    this.validarEmail(email);

    const usuario = await this.prisma.usuario.findUnique({ where: { email } });

    if (usuario) {
      const codigo = this.gerarCodigoRecuperacao();
      const expiraEm = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

      await this.prisma.passwordReset.create({
        data: {
          email,
          codigo,
          expiraEm,
        },
      });

      await this.mailService.sendMail(
        email,
        'Código de Recuperação de Senha - UniBus',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #033d3d;">Recuperação de Senha</h2>
            <p>Olá, ${usuario.email}!</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no UniBus.</p>
            <p>Utilize o código abaixo para prosseguir com a recuperação. Ele expira em 15 minutos.</p>
            <div style="background: #f4f4f4; padding: 16px; border-radius: 8px; text-align: center; margin: 16px 0;">
              <span style="font-size: 28px; font-weight: 700; color: #033d3d; letter-spacing: 4px;">${codigo}</span>
            </div>
            <p>Se você não solicitou a redefinição, ignore este e-mail.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="font-size: 12px; color: #888;">UniBus - Gestão Inteligente do Transporte Acadêmico</p>
          </div>
        `,
      );
    }

    return {
      message:
        'Se o e-mail estiver cadastrado, você receberá um código de recuperação em instantes.',
    };
  }

  async validarCodigoRecuperacao(email: string, codigo: string) {
    this.validarEmail(email);

    const registro = await this.prisma.passwordReset.findFirst({
      where: {
        email,
        codigo,
        usado: false,
        expiraEm: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!registro) {
      throw new BadRequestException('Código inválido ou expirado.');
    }

    return { valido: true, message: 'Código verificado com sucesso.' };
  }

  async redefinirSenhaPorCodigo(dto: RedefinirSenhaCodigoDto) {
    const { email, codigo, novaSenha } = dto;
    this.validarEmail(email);

    const registro = await this.prisma.passwordReset.findFirst({
      where: {
        email,
        codigo,
        usado: false,
        expiraEm: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!registro) {
      throw new BadRequestException('Código inválido ou expirado.');
    }

    const usuario = await this.prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      throw new BadRequestException('Usuário não encontrado.');
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await this.prisma.$transaction([
      this.prisma.usuario.update({
        where: { id: usuario.id },
        data: { senha: senhaHash },
      }),
      this.prisma.passwordReset.update({
        where: { id: registro.id },
        data: { usado: true },
      }),
    ]);

    return { message: 'Senha redefinida com sucesso.' };
  }

  async resetarSenha(email: string, novaSenha: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return { message: 'Se o email existir, a senha foi alterada.' };
    }
    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { senha: senhaHash },
    });
    return { message: 'Senha alterada com sucesso.' };
  }

  async primeiroAcesso(email: string, novaSenha: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      include: { associado: true },
    });

    if (!usuario) {
      throw new BadRequestException('E-mail não encontrado.');
    }

    if (usuario.tipo !== 'ASSOCIADO') {
      throw new BadRequestException('Este fluxo é exclusivo para associados.');
    }

    if (!usuario.associado || !usuario.associado.primeiroAcesso) {
      throw new BadRequestException(
        'Primeiro acesso já realizado. Utilize o login normal.',
      );
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await this.prisma.$transaction([
      this.prisma.usuario.update({
        where: { id: usuario.id },
        data: { senha: senhaHash },
      }),
      this.prisma.associado.update({
        where: { id: usuario.associado.id },
        data: { primeiroAcesso: false, status: 'ATIVO' },
      }),
    ]);

    return this.realizarLogin(usuario);
  }

  async autoCadastroAssociado(dto: AutoCadastroAssociadoDto) {
    this.validarEmail(dto.email);
    this.validarCpf(dto.cpf);

    const [emailExiste, cpfExiste, associacaoExiste] = await Promise.all([
      this.prisma.usuario.findUnique({ where: { email: dto.email } }),
      this.prisma.associado.findFirst({ where: { cpf: dto.cpf } }),
      this.prisma.associacao.findUnique({ where: { id: dto.associacaoId } }),
    ]);
    if (emailExiste) throw new BadRequestException('E-mail já cadastrado');
    if (cpfExiste) throw new BadRequestException('CPF já cadastrado');
    if (!associacaoExiste)
      throw new BadRequestException('Associação não encontrada');

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.usuario.create({
        data: {
          email: dto.email,
          senha: senhaHash,
          tipo: 'ASSOCIADO',
          associacaoId: dto.associacaoId,
        },
      });

      const associado = await tx.associado.create({
        data: {
          usuarioId: user.id,
          associacaoId: dto.associacaoId,
          nome: dto.nome,
          cpf: dto.cpf,
          telefone: dto.telefone,
          dataNascimento: dto.dataNascimento ?? null,
          status: 'PENDENTE',
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
          diasTransporte: dto.diasTransporte ?? null,
          transporteId: dto.transporteId ?? null,
          poltrona: dto.poltrona ?? null,
          primeiroAcesso: false,
        },
        select: {
          id: true,
          nome: true,
          cpf: true,
          status: true,
          associacaoId: true,
        },
      });

      delete (user as any).senha;

      const login = await this.realizarLogin(user);
      return {
        ...login,
        associado,
      };
    });
  }
}
