import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsNumberString,
  MinLength,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
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
  @MinLength(6)
  @IsNotEmpty()
  senha!: string;

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
  @IsOptional()
  faculdade?: string;

  @IsString()
  @IsOptional()
  curso?: string;

  @IsString()
  @IsOptional()
  periodo?: string;

  @IsString()
  @IsOptional()
  matricula?: string;

  @IsString()
  @IsNotEmpty()
  nomeAssociacao!: string;

  @IsString()
  @IsNotEmpty()
  sigla!: string;

  @IsString()
  @IsNotEmpty()
  cnpj!: string;

  @IsEmail()
  @IsNotEmpty()
  emailInstitucional!: string;

  @IsString()
  @IsNotEmpty()
  telefoneAssociacao!: string;

  @IsString()
  @IsNotEmpty()
  ruaAssociacao!: string;

  @IsString()
  @IsNotEmpty()
  bairroAssociacao!: string;

  @IsString()
  @IsNotEmpty()
  numeroAssociacao!: string;

  @IsString()
  @IsNotEmpty()
  cepAssociacao!: string;

  @IsString()
  @IsNotEmpty()
  cidadeAssociacao!: string;

  @IsString()
  @IsNotEmpty()
  estadoAssociacao!: string;

  @IsNumberString()
  @IsNotEmpty()
  quantidadePoltronas!: string;

  @IsString()
  @IsNotEmpty()
  diasTransporte!: string;

  @IsString()
  @IsNotEmpty()
  horarioSaida!: string;

  @IsString()
  @IsNotEmpty()
  horarioRetorno!: string;

  @IsString()
  @IsNotEmpty()
  pontoPartida!: string;
}
