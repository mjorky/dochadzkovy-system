import { Resolver, Query, Args } from '@nestjs/graphql';
import { ReportsService } from './reports.service';
import { WorkReportInput } from '../work-records/dto/work-report.input';
import { WorkListReportResponse } from './entities/work-list-report.entity';

@Resolver()
export class ReportsResolver {
  constructor(private readonly reportsService: ReportsService) { }

  @Query(() => String, { name: 'getWorkReportPDF' })
  async getWorkReportPDF(
    @Args('input') input: WorkReportInput,
  ): Promise<string> {
    return this.reportsService.getWorkReportPDF(input);
  }

  @Query(() => WorkListReportResponse, { name: 'getWorkListReport' })
  async getWorkListReport(
    @Args('input') input: WorkReportInput,
  ): Promise<WorkListReportResponse> {
    return this.reportsService.getWorkListReport(input);
  }

  @Query(() => String, { name: 'getWorkListReportPDF' })
  async getWorkListReportPDF(
    @Args('input') input: WorkReportInput,
  ): Promise<string> {
    return this.reportsService.getWorkListReportPDF(input);
  }

}

