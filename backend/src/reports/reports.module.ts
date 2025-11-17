import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsResolver } from './reports.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkRecordsModule } from '../work-records/work-records.module';

@Module({
  imports: [PrismaModule, WorkRecordsModule],
  providers: [ReportsService, ReportsResolver],
})
export class ReportsModule {}
