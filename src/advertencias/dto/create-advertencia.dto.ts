import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAdvertenciaDto {
  @IsNotEmpty()
  associadoId!: number | string;

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
