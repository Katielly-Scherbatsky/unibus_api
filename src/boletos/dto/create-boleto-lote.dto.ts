import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateBoletoLoteDto {
  @IsArray()
  @IsNumber({}, { each: true })
  associadosIds!: number[];

  @IsString()
  @IsNotEmpty()
  dataVencimento!: string;

  @IsNumber()
  @IsNotEmpty()
  valor!: number;
}
