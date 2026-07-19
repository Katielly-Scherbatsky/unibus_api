import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class ValidarCodigoRecuperacaoDto {
  @IsEmail({}, { message: 'E-mail inválido' })
  @IsNotEmpty({ message: 'E-mail é obrigatório' })
  email: string;

  @IsNotEmpty({ message: 'Código é obrigatório' })
  @Length(6, 6, { message: 'O código deve ter 6 dígitos' })
  codigo: string;
}
