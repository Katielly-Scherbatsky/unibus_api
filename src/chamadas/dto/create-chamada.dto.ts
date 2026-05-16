import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
  @IsNotEmpty()
  transporteId!: number;

  @IsString()
  @IsNotEmpty()
  data!: string;

  @IsString()
  @IsNotEmpty()
  periodo!: string;

  @IsString()
  @IsNotEmpty()
  ida!: string;

  @IsString()
  @IsNotEmpty()
  status!: string;

  associados?: PresencaDto[];
}
