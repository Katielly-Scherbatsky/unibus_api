import { IsEmail, IsOptional, IsString } from 'class-validator';

export class AtualizarPerfilDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  cpf?: string;

  @IsEmail({}, { message: 'E-mail inválido' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsString()
  @IsOptional()
  rua?: string;

  @IsString()
  @IsOptional()
  bairro?: string;

  @IsString()
  @IsOptional()
  numero?: string;

  @IsString()
  @IsOptional()
  cep?: string;

  @IsString()
  @IsOptional()
  cidade?: string;

  @IsString()
  @IsOptional()
  estado?: string;

  @IsString()
  @IsOptional()
  dataNascimento?: string;

  @IsString()
  @IsOptional()
  faculdade?: string;

  @IsString()
  @IsOptional()
  curso?: string;

  @IsString()
  @IsOptional()
  periodo?: string;

  @IsString()
  @IsOptional()
  matricula?: string;
}
