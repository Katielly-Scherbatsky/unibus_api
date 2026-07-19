import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsNumber,
  ValidateNested,
  MinLength,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class UsuarioDto {
  @IsEmail({}, { message: 'O email deve ser um email válido' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  senha!: string;
}

class AdminDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  nome!: string;

  @IsString()
  @IsNotEmpty({ message: 'O CPF é obrigatório' })
  cpf!: string;

  @IsString()
  @IsNotEmpty({ message: 'O telefone é obrigatório' })
  telefone!: string;

  @IsString()
  @IsNotEmpty({ message: 'A rua é obrigatória' })
  rua!: string;

  @IsString()
  @IsNotEmpty({ message: 'O bairro é obrigatório' })
  bairro!: string;

  @IsString()
  @IsNotEmpty({ message: 'O número é obrigatório' })
  numero!: string;

  @IsString()
  @IsNotEmpty({ message: 'O CEP é obrigatório' })
  cep!: string;

  @IsString()
  @IsNotEmpty({ message: 'A cidade é obrigatória' })
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
}

class AssociacaoDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome da associação é obrigatório' })
  nome!: string;

  @IsString()
  @IsNotEmpty({ message: 'A sigla da associação é obrigatória' })
  sigla!: string;

  @IsString()
  @IsNotEmpty({ message: 'O CNPJ é obrigatório' })
  cnpj!: string;

  @IsEmail({}, { message: 'O email da associação deve ser válido' })
  @IsNotEmpty({ message: 'O email da associação é obrigatório' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'O telefone é obrigatório' })
  telefone!: string;

  @IsString()
  @IsNotEmpty({ message: 'A rua é obrigatória' })
  rua!: string;

  @IsString()
  @IsNotEmpty({ message: 'O bairro é obrigatório' })
  bairro!: string;

  @IsString()
  @IsNotEmpty({ message: 'O número é obrigatório' })
  numero!: string;

  @IsString()
  @IsNotEmpty({ message: 'O CEP é obrigatório' })
  cep!: string;

  @IsString()
  @IsNotEmpty({ message: 'A cidade é obrigatória' })
  cidade!: string;

  @IsString()
  @IsNotEmpty({ message: 'O estado é obrigatório' })
  estado!: string;
}

class TransporteDto {
  @IsNumber({}, { message: 'A quantidade de poltronas deve ser um número' })
  @IsNotEmpty({ message: 'A quantidade de poltronas é obrigatória' })
  poltronas!: number;

  @IsString()
  @IsNotEmpty({ message: 'O horário de ida é obrigatório' })
  horarioIda!: string;

  @IsString()
  @IsNotEmpty({ message: 'O horário de volta é obrigatório' })
  horarioVolta!: string;

  @IsString()
  @IsNotEmpty({ message: 'Os dias da semana são obrigatórios' })
  dias!: string;

  @IsString()
  @IsNotEmpty({ message: 'O ponto de partida é obrigatório' })
  pontoPartida!: string;
}

export class RegistrarAdminDto {
  @ValidateNested()
  @Type(() => UsuarioDto)
  @IsNotEmpty({ message: 'Os dados do usuário são obrigatórios' })
  usuario!: UsuarioDto;

  @ValidateNested()
  @Type(() => AdminDto)
  @IsNotEmpty({ message: 'Os dados do administrador são obrigatórios' })
  associado!: AdminDto;

  @ValidateNested()
  @Type(() => AssociacaoDto)
  @IsNotEmpty({ message: 'Os dados da associação são obrigatórios' })
  associacao!: AssociacaoDto;

  @ValidateNested()
  @Type(() => TransporteDto)
  @IsNotEmpty({ message: 'Os dados do transporte são obrigatórios' })
  transporte!: TransporteDto;
}
