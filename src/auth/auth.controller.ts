import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
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
}
