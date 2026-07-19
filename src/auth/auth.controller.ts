import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AutoCadastroAssociadoDto } from './dto/auto-cadastro-associado.dto';
import { AtualizarPerfilDto } from './dto/atualizar-perfil.dto';
import { EsqueciSenhaDto } from './dto/esqueci-senha.dto';
import { RedefinirSenhaDto } from './dto/redefinir-senha.dto';
import { SolicitarRecuperacaoDto } from './dto/solicitar-recuperacao.dto';
import { ValidarCodigoRecuperacaoDto } from './dto/validar-codigo-recuperacao.dto';
import { RedefinirSenhaCodigoDto } from './dto/redefinir-senha-codigo.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { avatarStorage } from '../config/multer.config';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() body: any) {
    const usuario = await this.authService.validarUsuario(
      body.email,
      body.senha,
    );

    if (!usuario) {
      return { message: 'Credenciais inválidas' };
    }

    // Verificação de primeiro acesso apenas para ASSOCIADO
    if (usuario.tipo === 'ASSOCIADO') {
      const associado = await this.authService.buscarAssociadoPorUsuarioId(
        usuario.id,
      );
      if (associado?.primeiroAcesso) {
        return {
          message: 'Acesse com o primeiro acesso para criar senha pro sistema.',
          primeiroAcesso: true,
        };
      }
    }

    return this.authService.realizarLogin(usuario);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterDto) {
    return this.authService.registerFromFrontend(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: any) {
    return this.authService.me(user.usuarioId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async atualizarMe(@CurrentUser() user: any, @Body() dto: AtualizarPerfilDto) {
    return this.authService.atualizarMe(user.usuarioId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar', { storage: avatarStorage }))
  async uploadAvatar(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.authService.atualizarAvatar(user.usuarioId, file);
  }

  @Public()
  @Post('esqueci-senha')
  async esqueciSenha(@Body() body: EsqueciSenhaDto) {
    return this.authService.esqueciSenha(body.email);
  }

  @Public()
  @Post('redefinir-senha')
  async redefinirSenha(@Body() body: RedefinirSenhaDto) {
    return this.authService.redefinirSenha(body.token, body.novaSenha);
  }

  @Public()
  @Post('recuperar-senha/solicitar')
  async solicitarRecuperacaoCodigo(@Body() body: SolicitarRecuperacaoDto) {
    return this.authService.solicitarRecuperacaoCodigo(body.email);
  }

  @Public()
  @Post('recuperar-senha/validar')
  async validarCodigoRecuperacao(@Body() body: ValidarCodigoRecuperacaoDto) {
    return this.authService.validarCodigoRecuperacao(body.email, body.codigo);
  }

  @Public()
  @Post('recuperar-senha/redefinir')
  async redefinirSenhaPorCodigo(@Body() body: RedefinirSenhaCodigoDto) {
    return this.authService.redefinirSenhaPorCodigo(body);
  }

  // Endpoints legados (mantidos para compatibilidade)
  @Public()
  @Post('recover')
  async recover(@Body('email') email: string) {
    return {
      message: 'Se o email existir, um código de recuperação será enviado.',
      email,
    };
  }

  @Public()
  @Post('recover/verify')
  async recoverVerify(@Body() body: { email: string; codigo: string }) {
    return { message: 'Código verificado com sucesso.', valido: true };
  }

  @Public()
  @Post('recover/reset')
  async recoverReset(
    @Body() body: { email: string; codigo: string; novaSenha: string },
  ) {
    return this.authService.resetarSenha(body.email, body.novaSenha);
  }

  @Public()
  @Post('primeiro-acesso')
  async primeiroAcesso(@Body() body: { email: string; novaSenha: string }) {
    return this.authService.primeiroAcesso(body.email, body.novaSenha);
  }

  @Public()
  @Post('auto-cadastro-associado')
  @HttpCode(HttpStatus.CREATED)
  async autoCadastroAssociado(@Body() body: AutoCadastroAssociadoDto) {
    return this.authService.autoCadastroAssociado(body);
  }
}
