import { PartialType } from '@nestjs/mapped-types';
import { CreateAssociadoDto } from './create-associado.dto';

export class UpdateAssociadoDto extends PartialType(CreateAssociadoDto) {}
