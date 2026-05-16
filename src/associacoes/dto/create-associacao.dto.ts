import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateAssociacaoDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsString()
  @IsNotEmpty()
  sigla!: string;

  @IsString()
  @IsNotEmpty()
  cnpj!: string;

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
  @IsNotEmpty()
  estado!: string;
}
