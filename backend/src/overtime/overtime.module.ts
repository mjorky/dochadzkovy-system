import { Module } from '@nestjs/common';
import { OvertimeService } from './overtime.service';
import { OvertimeResolver } from './overtime.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [OvertimeService, OvertimeResolver],
  exports: [OvertimeService],
})
export class OvertimeModule {}
