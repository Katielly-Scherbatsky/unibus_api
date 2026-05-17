import { IsString, IsIn, IsNotEmpty } from 'class-validator';

export class UpdateAssociadoStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['PENDENTE', 'ATIVO', 'DESASSOCIADO', 'RECUSADO'])
  status!: string;
}
