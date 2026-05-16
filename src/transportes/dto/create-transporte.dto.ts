import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTransporteDto {
  @IsNumber()
  @IsNotEmpty()
  associacaoId!: number;

  @IsNumber()
  @IsNotEmpty()
  poltronas!: number;

  @IsString()
  @IsNotEmpty()
  horarioIda!: string;

  @IsString()
  @IsNotEmpty()
  horarioVolta!: string;

  @IsString()
  @IsNotEmpty()
  dias!: string;

  @IsString()
  @IsNotEmpty()
  pontoPartida!: string;
}
