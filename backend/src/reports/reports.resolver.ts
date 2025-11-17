import { Resolver, Query, Args } from '@nestjs/graphql';
import { ReportsService } from './reports.service';
import { WorkReportInput } from '../work-records/dto/work-report.input';

@Resolver()
export class ReportsResolver {
  constructor(private readonly reportsService: ReportsService) {}

  @Query(() => String, { name: 'getWorkReportPDF' })
  async getWorkReportPDF(
    @Args('input') input: WorkReportInput,
  ): Promise<string> {
    return this.reportsService.getWorkReportPDF(input);
  }
}
