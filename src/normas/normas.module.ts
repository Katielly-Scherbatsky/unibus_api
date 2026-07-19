import { Module } from '@nestjs/common';
import { NormasService } from './normas.service';
import { NormasController } from './normas.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NormasController],
  providers: [NormasService],
  exports: [NormasService],
})
export class NormasModule {}
