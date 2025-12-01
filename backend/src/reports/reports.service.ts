import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkRecordsService } from '../work-records/work-records.service';
import { WorkReportInput } from '../work-records/dto/work-report.input';
import { generateWorkReportPDF } from './utils/pdf-generation.util';
import { PrismaService } from '../prisma/prisma.service';
import { WorkListReportResponse } from './entities/work-list-report.entity';
import { ProjectStatisticsResponse } from './entities/project-statistics.entity';
import { ProjectStatisticsInput } from './dto/project-statistics.input';
import { getWorkListReportHTML } from './templates/work-list-report.template';
import { generatePDFFromHTML } from './utils/pdf-generation.util';
import { constructTableName } from '../work-records/utils/normalize-table-name';

@Injectable()
export class ReportsService {
  constructor(
    private readonly workRecordsService: WorkRecordsService,
    private readonly prisma: PrismaService,
  ) { }

  async getWorkReportPDF(input: WorkReportInput): Promise<string> {
    const {
      employeeId,
      month,
      year,
      signatureImage,
      isLegalReport,
      legalReportTime,
    } = input;

    // Fetch employee name
    const employee = await this.prisma.zamestnanci.findUnique({
      where: { ID: BigInt(employeeId) },
      select: {
        TitulPred: true,
        Meno: true,
        Priezvisko: true,
        TitulZa: true,
        TypZamestnanca: true,
      },
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

    let reportData;

    if (isLegalReport) {
      reportData = await this._generateLegalReportData(
        month,
        year,
        legalReportTime || '08:00', // Provide a default value if undefined
        employee.TypZamestnanca,
      );
    } else {
      const rawData = await this.workRecordsService.getWorkReportData(input);
      reportData = this._consolidateWorkReportData(rawData);
    }

    const pdfBuffer = await generateWorkReportPDF(
      reportData,
      employeeName,
      month,
      year,
      signatureImage,
    );
    return pdfBuffer.toString('base64');
  }

  async getWorkListReport(
    input: WorkReportInput,
  ): Promise<WorkListReportResponse> {
    return this.workRecordsService.getWorkListReport(input);
  }

  async getWorkListReportPDF(input: WorkReportInput): Promise<string> {
    const { employeeId, month, year, signatureImage } = input;

    // Fetch employee name
    const employee = await this.prisma.zamestnanci.findUnique({
      where: { ID: BigInt(employeeId) },
      select: {
        TitulPred: true,
        Meno: true,
        Priezvisko: true,
        TitulZa: true,
      },
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

    const reportData = await this.workRecordsService.getWorkListReport(input);

    const htmlContent = getWorkListReportHTML(
      reportData,
      employeeName,
      month,
      year,
      signatureImage,
    );

    const pdfBuffer = await generatePDFFromHTML(htmlContent);
    return pdfBuffer.toString('base64');
  }

  async getProjectStatistics(
    input: ProjectStatisticsInput,
  ): Promise<ProjectStatisticsResponse> {
    const { employeeId, fromDate, toDate } = input;

    const employee = await this.prisma.zamestnanci.findUnique({
      where: { ID: BigInt(employeeId) },
      select: {
        Meno: true,
        Priezvisko: true,
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    const tableName = constructTableName(employee.Meno, employee.Priezvisko);
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    // Aggregate hours by project and hour type
    const result: any[] = await this.prisma.$queryRawUnsafe(
      `
      SELECT
        p."Number" as "ProjectNumber",
        p."Name" as "ProjectName",
        SUM(CASE WHEN ht."HourType" = 'Produktívne' THEN EXTRACT(EPOCH FROM (wr."EndTime" - wr."StartTime")) / 3600 ELSE 0 END) as "ProductiveHours",
        SUM(CASE WHEN ht."HourType" = 'Neproduktívne' THEN EXTRACT(EPOCH FROM (wr."EndTime" - wr."StartTime")) / 3600 ELSE 0 END) as "NonProductiveHours",
        SUM(CASE WHEN ht."HourType" = 'ProduktívneOutSKCZ' THEN EXTRACT(EPOCH FROM (wr."EndTime" - wr."StartTime")) / 3600 ELSE 0 END) as "ProductiveZHours",
        SUM(CASE WHEN ht."HourType" = 'NeproduktívneZ' THEN EXTRACT(EPOCH FROM (wr."EndTime" - wr."StartTime")) / 3600 ELSE 0 END) as "NonProductiveZHours"
      FROM "${tableName}" wr
      LEFT JOIN "Projects" p ON wr."ProjectID" = p."ID"
      LEFT JOIN "HourType" ht ON wr."HourTypeID" = ht."ID"
      WHERE wr."StartDate" BETWEEN $1 AND $2
        AND wr."ProjectID" IS NOT NULL
        AND wr."StartTime" IS NOT NULL
        AND wr."EndTime" IS NOT NULL
        AND wr."EndTime" > wr."StartTime"
      GROUP BY p."Number", p."Name"
      ORDER BY p."Number" ASC
      `,
      startDate,
      endDate,
    );

    const items = result.map((row) => ({
      projectNumber: row.ProjectNumber || '',
      projectName: row.ProjectName || '',
      productiveHours: parseFloat(row.ProductiveHours) || 0,
      nonProductiveHours: parseFloat(row.NonProductiveHours) || 0,
      productiveZHours: parseFloat(row.ProductiveZHours) || 0,
      nonProductiveZHours: parseFloat(row.NonProductiveZHours) || 0,
    }));

    return { items };
  }



  private async _generateLegalReportData(
    month: number,
    year: number,
    legalReportTime: string,
    employeeType: string,
  ): Promise<any> {
    const employeeTypeData = await this.prisma.zamestnanecTyp.findUnique({
      where: { Typ: employeeType },
    });
    const workHoursPerDay = employeeTypeData?.FondPracovnehoCasu || 8;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const holidays = await this.prisma.holidays.findMany({
      where: {
        Den: {
          gte: startDate,
          lt: endDate,
        },
      },
    });
    const holidayDates = new Set(
      holidays.map((h) => h.Den.toISOString().split('T')[0]),
    );
    const slovakDays = [
      'Nedeľa',
      'Pondelok',
      'Utorok',
      'Streda',
      'Štvrtok',
      'Piatok',
      'Sobota',
    ];

    const dailyRecords = [];
    let totalWorkDays = 0;

    for (
      let day = new Date(startDate);
      day < endDate;
      day.setDate(day.getDate() + 1)
    ) {
      const dayOfWeek = day.getDay(); // 0 for Sunday, 6 for Saturday
      const isWeekday = dayOfWeek > 0 && dayOfWeek < 6;
      const isHoliday = holidayDates.has(day.toISOString().split('T')[0]);

      if (isWeekday && !isHoliday) {
        totalWorkDays++;
        const [startH, startM] = legalReportTime.split(':').map(Number);
        const totalMinutes = startH * 60 + startM + workHoursPerDay * 60;
        const endH = Math.floor(totalMinutes / 60) % 24;
        const endM = totalMinutes % 60;
        const endTime = `${String(endH).padStart(2, '0')}:${String(
          endM,
        ).padStart(2, '0')}`;

        dailyRecords.push({
          date: day.toLocaleDateString('sk-SK'),
          dayOfWeek: slovakDays[dayOfWeek],
          startTime: legalReportTime,
          endTime: endTime,
          hours: workHoursPerDay,
          absenceReason: 'Práca',
        });
      }
    }

    const totalHours = totalWorkDays * workHoursPerDay;

    const activitySummary =
      totalHours > 0
        ? [{ activityType: 'Práca', hours: totalHours }]
        : [];

    return {
      totalWorkDays,
      totalHours,
      weekendWorkHours: 0,
      holidayWorkHours: 0,
      dailyRecords,
      absenceSummary: [],
      activitySummary,
    };
  }

  private _consolidateWorkReportData(data: any) {
    if (!data || !data.dailyRecords) {
      return data;
    }

    const consolidatedMap = new Map<string, any>();

    for (const record of data.dailyRecords) {
      // Case 1: It's a genuine absence record (e.g., dovolenka, PN)
      if (record.absenceReason && !record.startTime) {
        const key = `${record.date}-${record.absenceReason}`;
        if (!consolidatedMap.has(key)) {
          // It's a full-day absence, assume 8 hours
          consolidatedMap.set(key, { ...record, hours: 8 });
        }
        continue;
      }

      // Case 2: It's a work record that needs to be consolidated
      if (record.startTime) {
        const key = `${record.date}-${record.absenceReason || 'work'}`;
        const existing = consolidatedMap.get(key);

        if (!existing) {
          consolidatedMap.set(key, { ...record });
        } else {
          if (record.startTime < existing.startTime) {
            existing.startTime = record.startTime;
          }
          existing.hours = (existing.hours || 0) + (record.hours || 0);
          if (record.endTime > existing.endTime) {
            existing.endTime = record.endTime;
          }
        }
        continue;
      }

      // Case 3: It's an empty day (like a weekend with no work), so just ignore it.
    }

    const consolidatedRecords = Array.from(consolidatedMap.values());

    // Recalculate endTime based on startTime and total hours, and filter out days with zero hours
    const finalRecords = consolidatedRecords
      .map((record) => {
        if (record.startTime && record.hours > 0) {
          const [startH, startM] = record.startTime.split(':').map(Number);
          const totalMinutes = startH * 60 + startM + record.hours * 60;
          const endH = Math.floor(totalMinutes / 60) % 24;
          const endM = totalMinutes % 60;
          record.endTime = `${String(endH).padStart(2, '0')}:${String(
            endM,
          ).padStart(2, '0')}`;
        }
        return record;
      })
      .filter((record) => (record.hours || 0) > 0) // Ensure only records with time are included
      .sort((a, b) => {
        const dateA = new Date(
          a.date.split('.').reverse().join('-'),
        ).getTime();
        const dateB = new Date(
          b.date.split('.').reverse().join('-'),
        ).getTime();
        return dateA - dateB;
      });

    return { ...data, dailyRecords: finalRecords };
  }
}
