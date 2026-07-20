import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

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
  dataNascimento?: string;

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

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  transporteId?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  poltrona?: number;

  @IsString()
  @IsOptional()
  senha?: string;
}
