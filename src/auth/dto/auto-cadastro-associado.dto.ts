import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class AutoCadastroAssociadoDto {
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

  @IsInt()
  @IsOptional()
  transporteId?: number;

  @IsInt()
  @IsOptional()
  poltrona?: number;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  senha!: string;

  @IsInt()
  @IsNotEmpty()
  associacaoId!: number;
}
