import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateBoletoDto {
  @IsNumber()
  @IsNotEmpty()
  associadoId!: number;

  @IsString()
  @IsNotEmpty()
  dataVencimento!: string;

  @IsString()
  @IsNotEmpty()
  periodo!: string;

  @IsNumber()
  @IsNotEmpty()
  valor!: number;

  @IsString()
  @IsNotEmpty()
  status!: string;
}
