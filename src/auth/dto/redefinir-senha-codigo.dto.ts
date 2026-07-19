import { IsEmail, IsNotEmpty, Length, MinLength } from 'class-validator';

export class RedefinirSenhaCodigoDto {
  @IsEmail({}, { message: 'E-mail inválido' })
  @IsNotEmpty({ message: 'E-mail é obrigatório' })
  email: string;

  @IsNotEmpty({ message: 'Código é obrigatório' })
  @Length(6, 6, { message: 'O código deve ter 6 dígitos' })
  codigo: string;

  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  novaSenha: string;
}
