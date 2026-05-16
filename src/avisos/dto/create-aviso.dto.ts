import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAvisoDto {
  @IsNumber()
  @IsNotEmpty()
  associadoId!: number;

  @IsString()
  @IsNotEmpty()
  data!: string;

  @IsString()
  @IsNotEmpty()
  tipo!: string;

  @IsString()
  @IsNotEmpty()
  motivo!: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsNotEmpty()
  descricao!: string;

  @IsString()
  @IsOptional()
  feitoPor?: string;
}
