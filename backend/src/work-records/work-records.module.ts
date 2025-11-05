import { Module } from '@nestjs/common';
import { WorkRecordResolver } from './work-record.resolver';
import { WorkRecordsResolver } from './work-records.resolver';
import { WorkRecordsService } from './work-records.service';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * WorkRecordsModule
 *
 * This module provides GraphQL resolvers and services for work records functionality.
 * Includes both field resolvers (WorkRecordResolver) for computed fields and
 * query resolvers (WorkRecordsResolver) for data fetching.
 */
@Module({
  imports: [PrismaModule],
  providers: [WorkRecordResolver, WorkRecordsResolver, WorkRecordsService],
  exports: [WorkRecordsService],
})
export class WorkRecordsModule {}
