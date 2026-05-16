import { PartialType } from '@nestjs/mapped-types';
import { CreateAssociacaoDto } from './create-associacao.dto';

export class UpdateAssociacaoDto extends PartialType(CreateAssociacaoDto) {}
