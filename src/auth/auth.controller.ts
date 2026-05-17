import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { AutoCadastroAssociadoDto } from './dto/auto-cadastro-associado.dto'
import { EsqueciSenhaDto } from './dto/esqueci-senha.dto'
import { RedefinirSenhaDto } from './dto/redefinir-senha.dto'
import { JwtAuthGuard } from './jwt-auth.guard'
import { CurrentUser } from './current-user.decorator'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    const usuario = await this.authService.validarUsuario(
      body.email,
      body.senha
    )

    if (!usuario) {
      return { message: 'Credenciais inválidas' }
    }

    if (usuario.primeiroAcesso) {
      return { message: 'Primeiro acesso pendente. Por favor, acesse a tela de primeiro acesso para criar sua senha.', primeiroAcesso: true }
    }

    return this.authService.realizarLogin(usuario)
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterDto) {
    return this.authService.registerFromFrontend(body)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: any) {
    return this.authService.me(user.usuarioId)
  }

  @Post('esqueci-senha')
  async esqueciSenha(@Body() body: EsqueciSenhaDto) {
    return this.authService.esqueciSenha(body.email);
  }

  @Post('redefinir-senha')
  async redefinirSenha(@Body() body: RedefinirSenhaDto) {
    return this.authService.redefinirSenha(body.token, body.novaSenha);
  }

  // Endpoints legados (mantidos para compatibilidade)
  @Post('recover')
  async recover(@Body('email') email: string) {
    return { message: 'Se o email existir, um código de recuperação será enviado.', email };
  }

  @Post('recover/verify')
  async recoverVerify(@Body() body: { email: string; codigo: string }) {
    return { message: 'Código verificado com sucesso.', valido: true };
  }

  @Post('recover/reset')
  async recoverReset(@Body() body: { email: string; codigo: string; novaSenha: string }) {
    return this.authService.resetarSenha(body.email, body.novaSenha);
  }

  @Post('primeiro-acesso')
  async primeiroAcesso(@Body() body: { email: string; novaSenha: string }) {
    return this.authService.primeiroAcesso(body.email, body.novaSenha);
  }

  @Post('auto-cadastro-associado')
  @HttpCode(HttpStatus.CREATED)
  async autoCadastroAssociado(@Body() body: AutoCadastroAssociadoDto) {
    return this.authService.autoCadastroAssociado(body);
  }
}
