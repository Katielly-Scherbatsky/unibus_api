import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PresencaDto {
  @IsNumber()
  @IsNotEmpty()
  associadoId!: number;

  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsString()
  @IsNotEmpty()
  poltrona!: string;

  @IsString()
  @IsNotEmpty()
  faculdade!: string;

  @IsBoolean()
  @IsNotEmpty()
  presente!: boolean;
}

export class CreateChamadaDto {
  @IsNumber()
  @IsOptional()
  transporteId?: number;

  @IsString()
  @IsNotEmpty()
  data!: string;

  @IsString()
  @IsNotEmpty()
  periodo!: string;

  @IsString()
  @IsNotEmpty()
  sentidoViagem!: string;

  @IsString()
  @IsOptional()
  status?: string;

  associados?: PresencaDto[];
}
