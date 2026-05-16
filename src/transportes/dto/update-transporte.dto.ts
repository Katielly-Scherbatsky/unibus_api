import { PartialType } from '@nestjs/mapped-types';
import { CreateTransporteDto } from './create-transporte.dto';

export class UpdateTransporteDto extends PartialType(CreateTransporteDto) {}
