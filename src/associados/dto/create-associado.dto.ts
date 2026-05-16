import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAssociadoDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsString()
  @IsNotEmpty()
  cpf!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  telefone!: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsNotEmpty()
  rua!: string;

  @IsString()
  @IsNotEmpty()
  bairro!: string;

  @IsString()
  @IsNotEmpty()
  numero!: string;

  @IsString()
  @IsNotEmpty()
  cep!: string;

  @IsString()
  @IsNotEmpty()
  cidade!: string;

  @IsString()
  @IsOptional()
  estado?: string;

  @IsString()
  @IsNotEmpty()
  faculdade!: string;

  @IsString()
  @IsNotEmpty()
  curso!: string;

  @IsString()
  @IsNotEmpty()
  periodo!: string;

  @IsString()
  @IsNotEmpty()
  matricula!: string;

  @IsString()
  @IsOptional()
  diasTransporte?: string;

  @IsString()
  @IsOptional()
  poltrona?: string;

  @IsString()
  @IsOptional()
  senha?: string;
}
