import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkRecordsService } from '../work-records/work-records.service';
import { WorkReportInput } from '../work-records/dto/work-report.input';
import { generateWorkReportPDF } from './utils/pdf-generation.util';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly workRecordsService: WorkRecordsService,
    private readonly prisma: PrismaService,
  ) {}

  async getWorkReportPDF(input: WorkReportInput): Promise<string> {
    const { employeeId, month, year } = input;

    // Fetch employee name
    const employee = await this.prisma.zamestnanci.findUnique({
      where: { ID: BigInt(employeeId) },
      select: { TitulPred: true, Meno: true, Priezvisko: true, TitulZa: true },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    const employeeName = [
      employee.TitulPred,
      employee.Meno,
      employee.Priezvisko,
      employee.TitulZa,
    ]
      .filter(Boolean)
      .join(' ');

    const data = await this.workRecordsService.getWorkReportData(input);
    const pdfBuffer = await generateWorkReportPDF(data, employeeName, month, year);
    return pdfBuffer.toString('base64');
  }
}
