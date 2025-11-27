import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkRecordsInput } from './dto/work-records.input';
import { CreateWorkRecordInput } from './dto/create-work-record.input';
import { UpdateWorkRecordInput } from './dto/update-work-record.input';
import { DeleteWorkRecordInput } from './dto/delete-work-record.input';
import { WorkReportInput } from './dto/work-report.input';
import { WorkRecordsResponse } from './entities/work-records-response.entity';
import { WorkRecord } from './entities/work-record.entity';
import { WorkRecordMutationResponse } from './entities/work-record-mutation-response.entity';
import { WorkReport } from './entities/work-report.entity';
import { WorkListReportResponse } from '../reports/entities/work-list-report.entity';
import { ProjectCatalogItem } from '../projects/entities/project-catalog-item.entity';
import { AbsenceType } from './entities/absence-type.entity';
import { ProductivityType } from './entities/productivity-type.entity';
import { WorkType } from './entities/work-type.entity';
import { constructTableName } from './utils/normalize-table-name';
import { calculateHours, isOvernightShift } from './utils/time-calculations';
import { calculateNextWorkday } from './utils/workday-calculator';


@Injectable()
export class WorkRecordsService {
  private readonly logger = new Logger(WorkRecordsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getWorkReportData(input: WorkReportInput): Promise<WorkReport> {
    const { employeeId, year, month } = input;

    const employee = await this.prisma.zamestnanci.findUnique({
      where: { ID: BigInt(employeeId) },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    const tableName = constructTableName(employee.Meno, employee.Priezvisko);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const result = await this.prisma.$queryRawUnsafe<any[]>(
      `
      WITH date_series AS (
        SELECT generate_series($1::date, $2::date, '1 day'::interval) AS date
      )
      SELECT
        ds.date,
        EXTRACT(ISODOW FROM ds.date) as day_of_week_iso,
        h."Den" as holiday_date,
        wr."StartTime"::text as start_time,
        wr."EndTime"::text as end_time,
        ct."Alias" as absence_reason,
        ct."ID" as cinnost_typ_id
      FROM date_series ds
      LEFT JOIN "${tableName}" wr ON ds.date = wr."StartDate"
      LEFT JOIN "CinnostTyp" ct ON wr."CinnostTypID" = ct."ID"
      LEFT JOIN "Holidays" h ON ds.date = h."Den"
      ORDER BY ds.date, start_time;
    `,
      startDate,
      endDate,
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

    const dailyRecords = result.map((r) => {
      const hours =
        r.start_time && r.end_time
          ? calculateHours(r.start_time, r.end_time)
          : undefined;
      const dayOfWeek = slovakDays[new Date(r.date).getDay()];
      return {
        date: new Date(r.date).toLocaleDateString('sk-SK'),
        dayOfWeek: dayOfWeek,
        startTime: r.start_time,
        endTime: r.end_time,
        hours,
        absenceReason: r.absence_reason,
      };
    });

    const workData = result.filter((r) => r.start_time && r.end_time);

    const totalHours = workData.reduce(
      (sum, r) => sum + calculateHours(r.start_time, r.end_time),
      0,
    );
    const totalWorkDays = new Set(
      workData.map((r) => new Date(r.date).toISOString().split('T')[0]),
    ).size;
    const weekendWorkHours = workData
      .filter((r) => [6, 7].includes(r.day_of_week_iso))
      .reduce((sum, r) => sum + calculateHours(r.start_time, r.end_time), 0);
    const holidayWorkHours = workData
      .filter((r) => r.holiday_date && r.start_time)
      .reduce((sum, r) => sum + calculateHours(r.start_time, r.end_time), 0);

    const absenceSummaryMap = result
      .filter((r) => !r.start_time && r.absence_reason)
      .reduce((acc, r) => {
        const reason = r.absence_reason;
        if (!acc[reason]) {
          acc[reason] = { days: 0, hours: 0 };
        }
        acc[reason].days += 1;
        acc[reason].hours += 8; // Assuming 8 hours for a full day absence
        return acc;
      }, {});

    const absenceSummary = Object.entries(absenceSummaryMap).map(
      ([category, data]: [string, any]) => ({
        category,
        days: data.days,
        hours: data.hours,
      }),
    );

    // Calculate activity summary (sum of hours by activity type)
    const activitySummaryMap = workData.reduce(
      (acc, r) => {
        const activityType = r.absence_reason || 'Neznámy';
        if (!acc[activityType]) {
          acc[activityType] = 0;
        }
        acc[activityType] += calculateHours(r.start_time, r.end_time);
        return acc;
      },
      {} as Record<string, number>,
    );

    const activitySummary = Object.entries(activitySummaryMap)
      .map(([activityType, hours]: [string, number]) => ({
        activityType,
        hours,
      }))
      .sort((a, b) => b.hours - a.hours); // Sort by hours descending

    return {
      totalWorkDays,
      totalHours,
      weekendWorkHours,
      holidayWorkHours,
      dailyRecords,
      absenceSummary,
      activitySummary,
    };
  }

  async getWorkListReport(
    input: WorkReportInput,
  ): Promise<WorkListReportResponse> {
    const { employeeId, year, month } = input;

    const employee = await this.prisma.zamestnanci.findUnique({
      where: { ID: BigInt(employeeId) },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    const tableName = constructTableName(employee.Meno, employee.Priezvisko);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month

    // We need to aggregate hours by project and hour type buckets
    // Buckets: Produktívne, Neproduktívne, ProduktívneOutSKCZ, NeproduktívneZ, Produktívne70
    const result: any[] = await this.prisma.$queryRawUnsafe(
      `
      SELECT
        p."Number" as "ProjectNumber",
        p."Name" as "ProjectName",
        m."Meno" as "ManagerFirstName",
        m."Priezvisko" as "ManagerLastName",
        m."TitulPred" as "ManagerTitleBefore",
        m."TitulZa" as "ManagerTitleAfter",
        SUM(CASE WHEN ht."HourType" = 'Produktívne' THEN EXTRACT(EPOCH FROM (wr."EndTime" - wr."StartTime")) / 3600 ELSE 0 END) as "ProductiveHours",
        SUM(CASE WHEN ht."HourType" = 'Neproduktívne' THEN EXTRACT(EPOCH FROM (wr."EndTime" - wr."StartTime")) / 3600 ELSE 0 END) as "NonProductiveHours",
        SUM(CASE WHEN ht."HourType" = 'ProduktívneOutSKCZ' THEN EXTRACT(EPOCH FROM (wr."EndTime" - wr."StartTime")) / 3600 ELSE 0 END) as "ProductiveOutSkCzHours",
        SUM(CASE WHEN ht."HourType" = 'NeproduktívneZ' THEN EXTRACT(EPOCH FROM (wr."EndTime" - wr."StartTime")) / 3600 ELSE 0 END) as "NonProductiveZHours",
        SUM(CASE WHEN ht."HourType" = 'Produktívne70' THEN EXTRACT(EPOCH FROM (wr."EndTime" - wr."StartTime")) / 3600 ELSE 0 END) as "Productive70Hours",
        SUM(wr."km") as "TravelKm"
      FROM "${tableName}" wr
      LEFT JOIN "Projects" p ON wr."ProjectID" = p."ID"
      LEFT JOIN "HourType" ht ON wr."HourTypeID" = ht."ID"
      LEFT JOIN "Zamestnanci" m ON p."Manager" = m."ID"
      WHERE wr."StartDate" BETWEEN $1 AND $2
        AND wr."ProjectID" IS NOT NULL
      GROUP BY p."Number", p."Name", m."Meno", m."Priezvisko", m."TitulPred", m."TitulZa"
      ORDER BY p."Number" ASC
      `,
      startDate,
      endDate,
    );

    const items = result.map((row) => {
      const managerName = [
        row.ManagerTitleBefore,
        row.ManagerFirstName,
        row.ManagerLastName,
        row.ManagerTitleAfter,
      ]
        .filter(Boolean)
        .join(' ');

      return {
        projectNumber: row.ProjectNumber || 'N/A',
        projectName: row.ProjectName || '',
        productiveHours: Number(row.ProductiveHours || 0),
        nonProductiveHours: Number(row.NonProductiveHours || 0),
        productiveOutSkCzHours: Number(row.ProductiveOutSkCzHours || 0),
        nonProductiveZHours: Number(row.NonProductiveZHours || 0),
        productive70Hours: Number(row.Productive70Hours || 0),
        travelKm: Number(row.TravelKm || 0),
        projectManagerName: managerName,
      };
    });

    return { items };
  }

  async getWorkRecords(input: WorkRecordsInput): Promise<WorkRecordsResponse> {
    const employee = await this.prisma.zamestnanci.findUnique({
      where: { ID: BigInt(input.employeeId) },
      select: { ID: true, Meno: true, Priezvisko: true, ZamknuteK: true },
    });

    if (!employee) {
      throw new NotFoundException(
        `Employee with ID ${input.employeeId} not found`,
      );
    }

    const tableName = constructTableName(employee.Meno, employee.Priezvisko);
    const fromDate = new Date(input.fromDate);
    const toDate = new Date(input.toDate);

    const records: any[] = await this.prisma.$queryRawUnsafe(
      `
      SELECT
        wr."ID", wr."StartDate", wr."CinnostTypID", wr."ProjectID", wr."HourTypeID",
        wr."HourTypesID", wr."StartTime"::TEXT as "StartTime", wr."EndTime"::TEXT as "EndTime",
        wr."Description", wr."km", wr."Lock", wr."DlhodobaSC",
        ct."Alias" as "CinnostTyp_Alias",
        p."Number" as "Projects_Number",
        ht."HourType" as "HourType_HourType",
        hts."HourType" as "HourTypes_HourType"
      FROM "${tableName}" wr
      INNER JOIN "CinnostTyp" ct ON wr."CinnostTypID" = ct."ID"
      LEFT JOIN "Projects" p ON wr."ProjectID" = p."ID"
      LEFT JOIN "HourType" ht ON wr."HourTypeID" = ht."ID"
      LEFT JOIN "HourTypes" hts ON wr."HourTypesID" = hts."ID"
      WHERE wr."StartDate" BETWEEN $1 AND $2
      ORDER BY wr."StartDate" ${input.sortOrder === 'ASC' ? 'ASC' : 'DESC'}, wr."ID" ${input.sortOrder === 'ASC' ? 'ASC' : 'DESC'}
      LIMIT $3 OFFSET $4
      `,
      fromDate,
      toDate,
      input.limit || 50,
      input.offset || 0,
    );

    const countResult: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::INTEGER as count FROM "${tableName}" wr WHERE wr."StartDate" BETWEEN $1 AND $2`,
      fromDate,
      toDate,
    );

    const totalCount = Number(countResult[0]?.count || 0);
    const hasMore = (input.offset || 0) + (input.limit || 50) < totalCount;

    const workRecords: WorkRecord[] = records.map((record: any) => {
      const isLocked =
        record.Lock === true ||
        (employee.ZamknuteK !== null &&
          new Date(record.StartDate) <= employee.ZamknuteK);
      return {
        id: record.ID.toString(),
        date: new Date(record.StartDate).toISOString(),
        absenceType: record.CinnostTyp_Alias,
        project: record.Projects_Number || null,
        productivityType: record.HourType_HourType || null,
        workType: record.HourTypes_HourType || null,
        startTime: record.StartTime,
        endTime: record.EndTime,
        hours: 0, // Computed by field resolver
        description: record.Description || null,
        km: record.km || 0,
        isTripFlag: record.DlhodobaSC,
        isLocked,
        isOvernightShift: false, // Computed by field resolver
      };
    });

    return { records: workRecords, totalCount, hasMore };
  }

  async createWorkRecord(
    input: CreateWorkRecordInput,
  ): Promise<WorkRecordMutationResponse> {
    const employee = await this.prisma.zamestnanci.findUnique({
      where: { ID: BigInt(input.employeeId) },
      select: { Meno: true, Priezvisko: true, ZamknuteK: true },
    });

    if (!employee) {
      throw new NotFoundException(
        `Employee with ID ${input.employeeId} not found`,
      );
    }

    const recordDate = new Date(input.date);
    if (employee.ZamknuteK && recordDate <= employee.ZamknuteK) {
      throw new ForbiddenException('Cannot create record for locked date');
    }

    const tableName = constructTableName(employee.Meno, employee.Priezvisko);
    const normalizeTime = (time: string): string =>
      time.length === 5 ? `${time}:00` : time;

    const startTime = normalizeTime(input.startTime);
    const endTime = normalizeTime(input.endTime);

    const insertResult: any[] = await this.prisma.$queryRawUnsafe(
      `
      INSERT INTO "${tableName}" ("CinnostTypID", "StartDate", "ProjectID", "HourTypeID", "HourTypesID", "StartTime", "EndTime", "Description", "km", "Lock", "DlhodobaSC")
      VALUES ($1, $2, $3, $4, $5, $6::time, $7::time, $8, $9, false, $10)
      RETURNING "ID"
      `,
      BigInt(input.absenceTypeId),
      recordDate,
      BigInt(input.projectId),
      BigInt(input.productivityTypeId),
      BigInt(input.workTypeId),
      startTime,
      endTime,
      input.description || null,
      input.km || 0,
      input.isTripFlag || false,
    );

    const createdId = insertResult[0].ID;

    const createdRecords: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT wr."ID", wr."StartDate", wr."StartTime"::TEXT, wr."EndTime"::TEXT, wr."Description", wr."km", wr."Lock", wr."DlhodobaSC",
                ct."Alias" as "CinnostTyp_Alias", p."Number" as "Projects_Number", ht."HourType" as "HourType_HourType", hts."HourType" as "HourTypes_HourType"
         FROM "${tableName}" wr
         INNER JOIN "CinnostTyp" ct ON wr."CinnostTypID" = ct."ID"
         LEFT JOIN "Projects" p ON wr."ProjectID" = p."ID"
         LEFT JOIN "HourType" ht ON wr."HourTypeID" = ht."ID"
         LEFT JOIN "HourTypes" hts ON wr."HourTypesID" = hts."ID"
         WHERE wr."ID" = $1`,
      createdId,
    );

    const record = createdRecords[0];
    const workRecord: WorkRecord = {
      id: record.ID.toString(),
      date: new Date(record.StartDate).toISOString(),
      absenceType: record.CinnostTyp_Alias,
      project: record.Projects_Number || null,
      productivityType: record.HourType_HourType || null,
      workType: record.HourTypes_HourType || null,
      startTime: record.StartTime,
      endTime: record.EndTime,
      hours: calculateHours(record.StartTime, record.EndTime),
      description: record.Description || null,
      km: record.km || 0,
      isTripFlag: record.DlhodobaSC,
      isLocked: false,
      isOvernightShift: isOvernightShift(record.StartTime, record.EndTime),
    };

    return {
      success: true,
      message: 'Work record created successfully',
      record: workRecord,
    };
  }

  async updateWorkRecord(
    input: UpdateWorkRecordInput,
  ): Promise<WorkRecordMutationResponse> {
    const employee = await this.prisma.zamestnanci.findUnique({
      where: { ID: BigInt(input.employeeId) },
      select: { Meno: true, Priezvisko: true, ZamknuteK: true },
    });

    if (!employee) {
      throw new NotFoundException(
        `Employee with ID ${input.employeeId} not found`,
      );
    }

    const tableName = constructTableName(employee.Meno, employee.Priezvisko);
    const existingRecords: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT * FROM "${tableName}" WHERE "ID" = $1`,
      BigInt(input.recordId),
    );

    if (!existingRecords.length) {
      throw new NotFoundException(
        `Work record with ID ${input.recordId} not found`,
      );
    }

    const existingRecord = existingRecords[0];
    if (
      existingRecord.Lock ||
      (employee.ZamknuteK &&
        new Date(existingRecord.StartDate) <= employee.ZamknuteK)
    ) {
      throw new ForbiddenException('Cannot edit locked record');
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    // Helper pre bežné polia
    const pushUpdate = (field: string, value: any) => {
      updateFields.push(`"${field}" = $${paramIndex++}`);
      updateValues.push(value);
    };

    if (input.date !== undefined) pushUpdate('StartDate', new Date(input.date));
    if (input.absenceTypeId !== undefined)
      pushUpdate('CinnostTypID', BigInt(input.absenceTypeId));
    if (input.projectId !== undefined)
      pushUpdate('ProjectID', BigInt(input.projectId));
    if (input.productivityTypeId !== undefined)
      pushUpdate('HourTypeID', BigInt(input.productivityTypeId));
    if (input.workTypeId !== undefined)
      pushUpdate('HourTypesID', BigInt(input.workTypeId));

    // --- OPRAVA ZAČÍNA TU ---
    // Pre časové polia musíme explicitne pridať ::time casting,
    // inak Postgres hlási chybu typu text vs time without time zone.
    
    if (input.startTime !== undefined) {
      updateFields.push(`"StartTime" = $${paramIndex++}::time`);
      updateValues.push(
        `${input.startTime.length === 5 ? input.startTime + ':00' : input.startTime}`,
      );
    }

    if (input.endTime !== undefined) {
      updateFields.push(`"EndTime" = $${paramIndex++}::time`);
      updateValues.push(
        `${input.endTime.length === 5 ? input.endTime + ':00' : input.endTime}`,
      );
    }
    // --- OPRAVA KONČÍ TU ---

    if (input.description !== undefined)
      pushUpdate('Description', input.description || null);
    if (input.km !== undefined) pushUpdate('km', input.km);
    if (input.isTripFlag !== undefined)
      pushUpdate('DlhodobaSC', input.isTripFlag);

    if (updateFields.length === 0) {
      throw new BadRequestException('No fields to update');
    }

    updateValues.push(BigInt(input.recordId));
    
    // Vykonanie UPDATE
    await this.prisma.$queryRawUnsafe(
      `UPDATE "${tableName}" SET ${updateFields.join(', ')} WHERE "ID" = $${paramIndex}`,
      ...updateValues,
    );

    // Načítanie aktualizovaného záznamu
    const updatedRecords: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT wr."ID", wr."StartDate", wr."StartTime"::TEXT, wr."EndTime"::TEXT, wr."Description", wr."km", wr."Lock", wr."DlhodobaSC",
              ct."Alias" as "CinnostTyp_Alias", p."Number" as "Projects_Number", ht."HourType" as "HourType_HourType", hts."HourType" as "HourTypes_HourType"
       FROM "${tableName}" wr
       INNER JOIN "CinnostTyp" ct ON wr."CinnostTypID" = ct."ID"
       LEFT JOIN "Projects" p ON wr."ProjectID" = p."ID"
       LEFT JOIN "HourType" ht ON wr."HourTypeID" = ht."ID"
       LEFT JOIN "HourTypes" hts ON wr."HourTypesID" = hts."ID"
       WHERE wr."ID" = $1`,
      BigInt(input.recordId),
    );

    const record = updatedRecords[0];
    const workRecord: WorkRecord = {
      id: record.ID.toString(),
      date: new Date(record.StartDate).toISOString(),
      absenceType: record.CinnostTyp_Alias,
      project: record.Projects_Number || null,
      productivityType: record.HourType_HourType || null,
      workType: record.HourTypes_HourType || null,
      startTime: record.StartTime,
      endTime: record.EndTime,
      hours: calculateHours(record.StartTime, record.EndTime),
      description: record.Description || null,
      km: record.km || 0,
      isTripFlag: record.DlhodobaSC,
      isLocked: false,
      isOvernightShift: isOvernightShift(record.StartTime, record.EndTime),
    };

    return {
      success: true,
      message: 'Work record updated successfully',
      record: workRecord,
    };
  }

  async deleteWorkRecord(
    input: DeleteWorkRecordInput,
  ): Promise<WorkRecordMutationResponse> {
    const employee = await this.prisma.zamestnanci.findUnique({
      where: { ID: BigInt(input.employeeId) },
      select: { Meno: true, Priezvisko: true, ZamknuteK: true },
    });

    if (!employee) {
      throw new NotFoundException(
        `Employee with ID ${input.employeeId} not found`,
      );
    }

    const tableName = constructTableName(employee.Meno, employee.Priezvisko);
    const existingRecords: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT * FROM "${tableName}" WHERE "ID" = $1`,
      BigInt(input.recordId),
    );

    if (!existingRecords.length) {
      throw new NotFoundException(
        `Work record with ID ${input.recordId} not found`,
      );
    }

    const existingRecord = existingRecords[0];
    if (
      existingRecord.Lock ||
      (employee.ZamknuteK &&
        new Date(existingRecord.StartDate) <= employee.ZamknuteK)
    ) {
      throw new ForbiddenException('Cannot delete locked record');
    }

    await this.prisma.$queryRawUnsafe(
      `DELETE FROM "${tableName}" WHERE "ID" = $1`,
      BigInt(input.recordId),
    );

    return { success: true, message: 'Work record deleted successfully' };
  }

  async getNextWorkday(employeeId: number): Promise<Date> {
    const employee = await this.prisma.zamestnanci.findUnique({
      where: { ID: BigInt(employeeId) },
      select: { Meno: true, Priezvisko: true },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    const tableName = constructTableName(employee.Meno, employee.Priezvisko);
    const lastRecords: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT "StartDate" FROM "${tableName}" ORDER BY "StartDate" DESC LIMIT 1`,
    );
    const lastRecordDate =
      lastRecords.length > 0 ? new Date(lastRecords[0].StartDate) : new Date();

    return calculateNextWorkday(lastRecordDate, this.prisma);
  }

  async getActiveProjects(): Promise<ProjectCatalogItem[]> {
    const projects = await this.prisma.projects.findMany({
      where: { AllowAssignWorkingHours: true },
      select: { ID: true, Number: true, Name: true },
      orderBy: { Number: 'asc' },
    });
    return projects.map((p: any) => ({
      id: p.ID.toString(),
      number: p.Number,
      name: p.Name || null,
    }));
  }

  async getAbsenceTypes(): Promise<AbsenceType[]> {
    const absenceTypes = await this.prisma.cinnostTyp.findMany({
      where: { Zmazane: false },
      select: { ID: true, Alias: true },
      orderBy: { Alias: 'asc' },
    });
    return absenceTypes.map((t: any) => ({
      id: t.ID.toString(),
      alias: t.Alias,
    }));
  }

  async getProductivityTypes(): Promise<ProductivityType[]> {
    const types = await this.prisma.hourType.findMany({
      select: { ID: true, HourType: true },
      orderBy: { HourType: 'asc' },
    });
    return types.map((t: any) => ({
      id: t.ID.toString(),
      hourType: t.HourType,
    }));
  }

  async getWorkTypes(): Promise<WorkType[]> {
    const types = await this.prisma.hourTypes.findMany({
      select: { ID: true, HourType: true },
      orderBy: { HourType: 'asc' },
    });
    return types.map((t: any) => ({
      id: t.ID.toString(),
      hourType: t.HourType,
    }));
  }

  async getWorkReportPDF(input: WorkReportInput): Promise<string> {
    const { employeeId, month, year } = input;

    // Logujeme, že sme dostali request (pre debugging)
    this.logger.log(
      `Generating PDF for Employee: ${employeeId}, Period: ${month}/${year}`,
    );

    // TODO: Tu budeš neskôr implementovať reálne generovanie PDF pomocou knižnice (napr. pdfmake)
    // Teraz vrátime validný "Dummy PDF" (Hello World) v Base64, aby frontend fungoval bez chýb.

    const dummyPdfBase64 =
      'JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXwKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBVIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSCiAgICA+PgogID4+CiAgL0NvbnRlbnRzIDUgMCBSCj4+CmVuZG9iagoKNCAwIG9iago8PAogIC9UeXBlIC9Gb250CiAgL1N1YnR5cGUgL1R5cGUxCiAgL0Jhc2VGb250IC9UaW1lcy1Sb21hbgo+PgplbmRvYmoKCjUgMCBvYmoKPDwgL0xlbmd0aCA0NCA+PgpzdHJlYW0KQlQKL0YxIDEyIFRmCjEwMCAxMDAgVGQKKEhlbGxvIFdvcmxkKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCgp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTAgMDAwMDAgbiAKMDAwMDAwMDA2MCAwMDAwMCBuIAowMDAwMDAwMTU3IDAwMDAwIG4gCjAwMDAwMDAyNTUgMDAwMDAgbiAKMDAwMDAwMDM1NCAwMDAwMCBuIAp0cmFpbGVyCjw8CiAgL1NpemUgNgogIC9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0NDkKJSVFT0YK';

    return dummyPdfBase64;
  }
}