import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AutoCadastroAssociadoDto } from './dto/auto-cadastro-associado.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrarAdminDto } from './dto/registrar-admin.dto';
import { RegisterDto } from './dto/register.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService, private mailService: MailService) {}

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
        primeiroAcesso: associado?.primeiroAcesso ?? false,
        status: associado?.status ?? null,
        nome: associado?.nome ?? usuario.email,
      }
    };
  }

  async validarUsuario(email: string, senha: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email }
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
    if (nums.length !== 11) throw new BadRequestException('CPF deve ter 11 dígitos');
    if (/^(\d)\1{10}$/.test(nums)) throw new BadRequestException('CPF inválido');
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(nums.charAt(i)) * (10 - i);
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(nums.charAt(9))) throw new BadRequestException('CPF inválido');
    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(nums.charAt(i)) * (11 - i);
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(nums.charAt(10))) throw new BadRequestException('CPF inválido');
  }

  private validarCnpj(cnpj: string) {
    const nums = cnpj.replace(/\D/g, '');
    if (nums.length !== 14) throw new BadRequestException('CNPJ deve ter 14 dígitos');
    if (/^(\d)\1{13}$/.test(nums)) throw new BadRequestException('CNPJ inválido');
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
    if (calc(12) !== parseInt(nums.charAt(12)) || calc(13) !== parseInt(nums.charAt(13))) {
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

    const emailExiste = await this.prisma.usuario.findUnique({ where: { email: usuario.email } });
    if (emailExiste) throw new BadRequestException('E-mail já cadastrado');

    const cpfExiste = await this.prisma.associado.findFirst({ where: { cpf: associado.cpf } });
    if (cpfExiste) throw new BadRequestException('CPF já cadastrado');

    const cnpjExiste = await this.prisma.associacao.findFirst({ where: { cnpj: associacao.cnpj } });
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
          estado: associacao.estado
        }
      });

      const user = await tx.usuario.create({
        data: {
          email: usuario.email,
          senha: senhaHash,
          tipo: 'ADMIN',
          associacaoId: assoc.id
        }
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
          faculdade: associado.faculdade ?? 'N/A',
          curso: associado.curso ?? 'N/A',
          periodo: associado.periodo ?? 'N/A',
          matricula: associado.matricula ?? 'N/A',
          status: 'ATIVO',
          primeiroAcesso: false,
        }
      });

      const transp = await tx.transporte.create({
        data: {
          associacaoId: assoc.id,
          poltronas: transporte.poltronas,
          horarioIda: transporte.horarioIda,
          horarioVolta: transporte.horarioVolta,
          dias: transporte.dias,
          pontoPartida: transporte.pontoPartida
        }
      });

      delete (user as any).senha;

      return {
        user,
        assoc,
        transp,
        associado: associadoCriado
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
      include: { associado: true },
    });
    if (!usuario) return null;
    const { senha, associado, ...rest } = usuario;
    return {
      ...rest,
      ...associado,
    };
  }

  async esqueciSenha(email: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });

    if (usuario) {
      const token = this.jwtService.sign(
        { sub: usuario.id, type: 'password-reset' },
        { expiresIn: '1h' }
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
        `
      );
    }

    return { message: 'Se o e-mail estiver cadastrado, você receberá um link de recuperação em instantes.' };
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
      throw new BadRequestException('Primeiro acesso já realizado. Utilize o login normal.');
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await this.prisma.$transaction([
      this.prisma.usuario.update({
        where: { id: usuario.id },
        data: { senha: senhaHash },
      }),
      this.prisma.associado.update({
        where: { id: usuario.associado.id },
        data: { primeiroAcesso: false },
      }),
    ]);

    return this.realizarLogin(usuario);
  }

  async autoCadastroAssociado(dto: AutoCadastroAssociadoDto) {
    this.validarEmail(dto.email);
    this.validarCpf(dto.cpf);

    const emailExiste = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (emailExiste) throw new BadRequestException('E-mail já cadastrado');

    const cpfExiste = await this.prisma.associado.findFirst({ where: { cpf: dto.cpf } });
    if (cpfExiste) throw new BadRequestException('CPF já cadastrado');

    const associacaoExiste = await this.prisma.associacao.findUnique({ where: { id: dto.associacaoId } });
    if (!associacaoExiste) throw new BadRequestException('Associação não encontrada');

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
          status: 'PENDENTE',
          rua: dto.rua,
          bairro: dto.bairro,
          numero: dto.numero,
          cep: dto.cep,
          cidade: dto.cidade,
          faculdade: dto.faculdade,
          curso: dto.curso,
          periodo: dto.periodo,
          matricula: dto.matricula,
          primeiroAcesso: false,
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
