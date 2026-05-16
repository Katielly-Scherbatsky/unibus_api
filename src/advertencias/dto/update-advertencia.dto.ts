import { PartialType } from '@nestjs/mapped-types';
import { CreateAdvertenciaDto } from './create-advertencia.dto';

export class UpdateAdvertenciaDto extends PartialType(CreateAdvertenciaDto) {}
