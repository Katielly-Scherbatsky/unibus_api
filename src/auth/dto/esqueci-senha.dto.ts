import { IsEmail, IsNotEmpty } from 'class-validator';

export class EsqueciSenhaDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
