import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateBoletoDto {
  @IsNumber()
  @IsNotEmpty()
  associadoId!: number;

  @IsString()
  @IsNotEmpty()
  dataVencimento!: string;

  @IsNumber()
  @IsNotEmpty()
  valor!: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['PAGO', 'PENDENTE'])
  status!: string;
}
