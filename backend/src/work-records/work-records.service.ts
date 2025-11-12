import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkRecordsInput } from './dto/work-records.input';
import { CreateWorkRecordInput } from './dto/create-work-record.input';
import { UpdateWorkRecordInput } from './dto/update-work-record.input';
import { DeleteWorkRecordInput } from './dto/delete-work-record.input';
import { WorkRecordsResponse } from './entities/work-records-response.entity';
import { WorkRecord } from './entities/work-record.entity';
import { WorkRecordMutationResponse } from './entities/work-record-mutation-response.entity';
import { ProjectCatalogItem } from '../projects/entities/project-catalog-item.entity';
import { AbsenceType } from './entities/absence-type.entity';
import { ProductivityType } from './entities/productivity-type.entity';
import { WorkType } from './entities/work-type.entity';
import { constructTableName } from './utils/normalize-table-name';
import { calculateHours, isOvernightShift } from './utils/time-calculations';
import { calculateNextWorkday } from './utils/workday-calculator';
// Ak potrebujete import pre Prisma typy (napr. Projects, CinnostTyp) pre Mapovanie, pridajte ho tu
// import { Projects, CinnostTyp, HourType, HourTypes } from '@prisma/client'; 

/**
 * Service for managing work records operations.
 *
 * This service handles fetching work records from per-employee tables,
 * including dynamic table name construction and proper handling of NULL
 * values in LEFT JOINed catalog tables.
 */
@Injectable()
export class WorkRecordsService {
  private readonly logger = new Logger(WorkRecordsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetch work records for a specific employee within a date range.
   *
   * @param input - Query parameters including employeeId, date range, and pagination
   * @returns WorkRecordsResponse with records, totalCount, and hasMore flag
   * @throws NotFoundException if employee not found
   * @throws Error if database query fails
   */
  async getWorkRecords(input: WorkRecordsInput): Promise<WorkRecordsResponse> {
    try {
      // Fetch employee to get name for dynamic table and ZamknuteK for lock status
      const employee = await this.prisma.zamestnanci.findUnique({
        where: { ID: BigInt(input.employeeId) },
        select: {
          ID: true,
          Meno: true,
          Priezvisko: true,
          ZamknuteK: true,
        },
      });

      if (!employee) {
        throw new NotFoundException(`Employee with ID ${input.employeeId} not found`);
      }

      // Construct dynamic table name: t_{FirstName}_{LastName}
      // Note: Uses normalized names (removes Slovak diacritics) to match actual table names
      const tableName = constructTableName(employee.Meno, employee.Priezvisko);
      this.logger.log(`Fetching work records from table: ${tableName}`);

      // Parse dates
      const fromDate = new Date(input.fromDate);
      const toDate = new Date(input.toDate);

      // Fetch work records with LEFT JOINs for catalog tables
      // OPRAVENÉ TS2347: Odstránené <any[]> z volania funkcie
      const records: any[] = await this.prisma.$queryRawUnsafe(
        `
        SELECT
          wr."ID",
          wr."StartDate",
          wr."CinnostTypID",
          wr."ProjectID",
          wr."HourTypeID",
          wr."HourTypesID",
          wr."StartTime"::TEXT as "StartTime",
          wr."EndTime"::TEXT as "EndTime",
          wr."Description",
          wr."km",
          wr."Lock",
          wr."DlhodobaSC",
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
        ORDER BY wr."StartDate" ${input.sortOrder || 'DESC'}
        LIMIT $3 OFFSET $4
        `,
        fromDate,
        toDate,
        input.limit || 50,
        input.offset || 0,
      );

      // Get total count for pagination
      // OPRAVENÉ TS2347: Odstránené <any[]> z volania funkcie
      const countResult: any[] = await this.prisma.$queryRawUnsafe(
        `
        SELECT COUNT(*)::INTEGER as count
        FROM "${tableName}" wr
        WHERE wr."StartDate" BETWEEN $1 AND $2
        `,
        fromDate,
        toDate,
      );

      const totalCount = Number(countResult[0]?.count || 0);

      // Calculate hasMore for infinite scroll
      const hasMore = (input.offset || 0) + (input.limit || 50) < totalCount;

      // Map database results to WorkRecord entities
      // OPRAVENÉ TS7006: Pridaný explicitný typ 'any' pre parameter 'record'
      const workRecords: WorkRecord[] = records.map((record: any) => {
        // Compute isLocked: Lock flag OR StartDate <= employee.ZamknuteK
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

      return {
        records: workRecords,
        totalCount,
        hasMore,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to fetch work records', error);
      throw new Error('Failed to fetch work records from database');
    }
  }

  /**
   * Create a new work record for a specific employee.
   *
   * @param input - Work record data including all required fields
   * @returns WorkRecordMutationResponse with success status and created record
   * @throws NotFoundException if employee not found
   * @throws ForbiddenException if date is locked
   * @throws BadRequestException if validation fails
   */
  async createWorkRecord(input: CreateWorkRecordInput): Promise<WorkRecordMutationResponse> {
    try {
      // Fetch employee to get name for dynamic table and ZamknuteK for lock validation
      const employee = await this.prisma.zamestnanci.findUnique({
        where: { ID: BigInt(input.employeeId) },
        select: {
          ID: true,
          Meno: true,
          Priezvisko: true,
          ZamknuteK: true,
        },
      });

      if (!employee) {
        throw new NotFoundException(`Employee with ID ${input.employeeId} not found`);
      }

      // Construct dynamic table name
      const tableName = constructTableName(employee.Meno, employee.Priezvisko);
      this.logger.log(`Creating work record in table: ${tableName}`);

      // Parse date
      const recordDate = new Date(input.date);

      // Validate date is not locked (date must be > ZamknuteK)
      if (employee.ZamknuteK !== null && recordDate <= employee.ZamknuteK) {
        throw new ForbiddenException('Cannot create record for locked date');
      }

      // Normalize time format (add :00 if HH:MM format)
      const normalizeTime = (time: string): string => {
        return time.length === 5 ? `${time}:00` : time;
      };

      const startTime = normalizeTime(input.startTime);
      const endTime = normalizeTime(input.endTime);

      // Validate time format - this is handled by DTO validation, but we double-check
      const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        throw new BadRequestException('Invalid time format');
      }

      // Insert into per-user table
      // OPRAVENÉ TS2347: Odstránené <any[]> z volania funkcie
      const insertResult: any[] = await this.prisma.$queryRawUnsafe(
        `
        INSERT INTO "${tableName}" (
          "CinnostTypID",
          "StartDate",
          "ProjectID",
          "HourTypeID",
          "HourTypesID",
          "StartTime",
          "EndTime",
          "Description",
          "km",
          "Lock",
          "DlhodobaSC"
        ) VALUES ($1, $2, $3, $4, $5, $6::time, $7::time, $8, $9, $10, $11)
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
        false, // Lock je vždy false pre nové záznamy
        input.isTripFlag || false,
      );

      const createdId = insertResult[0].ID;

      // Fetch the created record with JOINs to get catalog data
      // OPRAVENÉ TS2347: Odstránené <any[]> z volania funkcie
      const createdRecords: any[] = await this.prisma.$queryRawUnsafe(
        `
        SELECT
          wr."ID",
          wr."StartDate",
          wr."CinnostTypID",
          wr."ProjectID",
          wr."HourTypeID",
          wr."HourTypesID",
          wr."StartTime"::TEXT as "StartTime",
          wr."EndTime"::TEXT as "EndTime",
          wr."Description",
          wr."km",
          wr."Lock",
          wr."DlhodobaSC",
          ct."Alias" as "CinnostTyp_Alias",
          p."Number" as "Projects_Number",
          ht."HourType" as "HourType_HourType",
          hts."HourType" as "HourTypes_HourType"
        FROM "${tableName}" wr
        INNER JOIN "CinnostTyp" ct ON wr."CinnostTypID" = ct."ID"
        LEFT JOIN "Projects" p ON wr."ProjectID" = p."ID"
        LEFT JOIN "HourType" ht ON wr."HourTypeID" = ht."ID"
        LEFT JOIN "HourTypes" hts ON wr."HourTypesID" = hts."ID"
        WHERE wr."ID" = $1
        `,
        createdId,
      );

      const record = createdRecords[0];

      // Calculate hours
      const hours = calculateHours(record.StartTime, record.EndTime);
      const overnight = isOvernightShift(record.StartTime, record.EndTime);

      // Map to WorkRecord entity
      const workRecord: WorkRecord = {
        id: record.ID.toString(),
        date: new Date(record.StartDate).toISOString(),
        absenceType: record.CinnostTyp_Alias,
        project: record.Projects_Number || null,
        productivityType: record.HourType_HourType || null,
        workType: record.HourTypes_HourType || null,
        startTime: record.StartTime,
        endTime: record.EndTime,
        hours: hours,
        description: record.Description || null,
        km: record.km || 0,
        isTripFlag: record.DlhodobaSC,
        isLocked: false, // Nové záznamy nie sú nikdy zamknuté
        isOvernightShift: overnight,
      };

      return {
        success: true,
        message: 'Work record created successfully',
        record: workRecord,
      };
    } catch (error) {
      if (error instanceof NotFoundException ||
          error instanceof ForbiddenException ||
          error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Failed to create work record', error);
      throw new Error('Failed to create work record in database');
    }
  }

  /**
   * Update an existing work record.
   *
   * @param input - Work record data with recordId and optional field updates
   * @returns WorkRecordMutationResponse with success status and updated record
   * @throws NotFoundException if employee or record not found
   * @throws ForbiddenException if record is locked
   * @throws BadRequestException if validation fails
   */
  async updateWorkRecord(input: UpdateWorkRecordInput): Promise<WorkRecordMutationResponse> {
    try {
      // Fetch employee
      const employee = await this.prisma.zamestnanci.findUnique({
        where: { ID: BigInt(input.employeeId) },
        select: {
          ID: true,
          Meno: true,
          Priezvisko: true,
          ZamknuteK: true,
        },
      });

      if (!employee) {
        throw new NotFoundException(`Employee with ID ${input.employeeId} not found`);
      }

      const tableName = constructTableName(employee.Meno, employee.Priezvisko);

      // Fetch existing record
      // OPRAVENÉ TS2347: Odstránené <any[]> z volania funkcie
      const existingRecords: any[] = await this.prisma.$queryRawUnsafe(
        `SELECT * FROM "${tableName}" WHERE "ID" = $1`,
        BigInt(input.recordId)
      );

      if (!existingRecords || existingRecords.length === 0) {
        throw new NotFoundException(`Work record with ID ${input.recordId} not found`);
      }

      const existingRecord = existingRecords[0];

      // Validate record is not locked
      const isLocked =
        existingRecord.Lock === true ||
        (employee.ZamknuteK !== null && new Date(existingRecord.StartDate) <= employee.ZamknuteK);

      if (isLocked) {
        throw new ForbiddenException('Cannot edit locked record');
      }

      // Build UPDATE query with only provided fields
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      if (input.date !== undefined) {
        updateFields.push(`"StartDate" = $${paramIndex++}`);
        updateValues.push(new Date(input.date));
      }
      if (input.absenceTypeId !== undefined) {
        updateFields.push(`"CinnostTypID" = $${paramIndex++}`);
        updateValues.push(BigInt(input.absenceTypeId));
      }
      if (input.projectId !== undefined) {
        updateFields.push(`"ProjectID" = $${paramIndex++}`);
        updateValues.push(BigInt(input.projectId));
      }
      if (input.productivityTypeId !== undefined) {
        updateFields.push(`"HourTypeID" = $${paramIndex++}`);
        updateValues.push(BigInt(input.productivityTypeId));
      }
      if (input.workTypeId !== undefined) {
        updateFields.push(`"HourTypesID" = $${paramIndex++}`);
        updateValues.push(BigInt(input.workTypeId));
      }
      if (input.startTime !== undefined) {
        const normalizedTime = input.startTime.length === 5 ? `${input.startTime}:00` : input.startTime;
        updateFields.push(`"StartTime" = $${paramIndex++}::time`);
        updateValues.push(normalizedTime);
      }
      if (input.endTime !== undefined) {
        const normalizedTime = input.endTime.length === 5 ? `${input.endTime}:00` : input.endTime;
        updateFields.push(`"EndTime" = $${paramIndex++}::time`);
        updateValues.push(normalizedTime);
      }
      if (input.description !== undefined) {
        updateFields.push(`"Description" = $${paramIndex++}`);
        updateValues.push(input.description || null);
      }
      if (input.km !== undefined) {
        updateFields.push(`"km" = $${paramIndex++}`);
        updateValues.push(input.km);
      }
      if (input.isTripFlag !== undefined) {
        updateFields.push(`"DlhodobaSC" = $${paramIndex++}`);
        updateValues.push(input.isTripFlag);
      }

      if (updateFields.length === 0) {
        throw new BadRequestException('No fields to update');
      }

      // Execute UPDATE
      updateValues.push(BigInt(input.recordId));
      const updateQuery = `UPDATE "${tableName}" SET ${updateFields.join(', ')} WHERE "ID" = $${paramIndex}`;
      await this.prisma.$queryRawUnsafe(updateQuery, ...updateValues);

      // Fetch updated record
      // OPRAVENÉ TS2347: Odstránené <any[]> z volania funkcie
      const updatedRecords: any[] = await this.prisma.$queryRawUnsafe(
        `
        SELECT
          wr."ID",
          wr."StartDate",
          wr."CinnostTypID",
          wr."ProjectID",
          wr."HourTypeID",
          wr."HourTypesID",
          wr."StartTime"::TEXT as "StartTime",
          wr."EndTime"::TEXT as "EndTime",
          wr."Description",
          wr."km",
          wr."Lock",
          wr."DlhodobaSC",
          ct."Alias" as "CinnostTyp_Alias",
          p."Number" as "Projects_Number",
          ht."HourType" as "HourType_HourType",
          hts."HourType" as "HourTypes_HourType"
        FROM "${tableName}" wr
        INNER JOIN "CinnostTyp" ct ON wr."CinnostTypID" = ct."ID"
        LEFT JOIN "Projects" p ON wr."ProjectID" = p."ID"
        LEFT JOIN "HourType" ht ON wr."HourTypeID" = ht."ID"
        LEFT JOIN "HourTypes" hts ON wr."HourTypesID" = hts."ID"
        WHERE wr."ID" = $1
        `,
        BigInt(input.recordId)
      );

      const record = updatedRecords[0];
      const hours = calculateHours(record.StartTime, record.EndTime);
      const overnight = isOvernightShift(record.StartTime, record.EndTime);

      const workRecord: WorkRecord = {
        id: record.ID.toString(),
        date: new Date(record.StartDate).toISOString(),
        absenceType: record.CinnostTyp_Alias,
        project: record.Projects_Number || null,
        productivityType: record.HourType_HourType || null,
        workType: record.HourTypes_HourType || null,
        startTime: record.StartTime,
        endTime: record.EndTime,
        hours: hours,
        description: record.Description || null,
        km: record.km || 0,
        isTripFlag: record.DlhodobaSC,
        isLocked: false,
        isOvernightShift: overnight,
      };

      return {
        success: true,
        message: 'Work record updated successfully',
        record: workRecord,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('Failed to update work record', error);
      throw new Error('Failed to update work record in database');
    }
  }

  /**
   * Delete a work record.
   *
   * @param input - Record ID and employee ID for validation
   * @returns WorkRecordMutationResponse with success status
   * @throws NotFoundException if employee or record not found
   * @throws ForbiddenException if record is locked
   */
  async deleteWorkRecord(input: DeleteWorkRecordInput): Promise<WorkRecordMutationResponse> {
    try {
      // Fetch employee
      const employee = await this.prisma.zamestnanci.findUnique({
        where: { ID: BigInt(input.employeeId) },
        select: {
          ID: true,
          Meno: true,
          Priezvisko: true,
          ZamknuteK: true,
        },
      });

      if (!employee) {
        throw new NotFoundException(`Employee with ID ${input.employeeId} not found`);
      }

      const tableName = constructTableName(employee.Meno, employee.Priezvisko);

      // Fetch existing record to validate lock status
      // OPRAVENÉ TS2347: Odstránené <any[]> z volania funkcie
      const existingRecords: any[] = await this.prisma.$queryRawUnsafe(
        `SELECT * FROM "${tableName}" WHERE "ID" = $1`,
        BigInt(input.recordId)
      );

      if (!existingRecords || existingRecords.length === 0) {
        throw new NotFoundException(`Work record with ID ${input.recordId} not found`);
      }

      const existingRecord = existingRecords[0];

      // Validate record je not locked
      const isLocked =
        existingRecord.Lock === true ||
        (employee.ZamknuteK !== null && new Date(existingRecord.StartDate) <= employee.ZamknuteK);

      if (isLocked) {
        throw new ForbiddenException('Cannot delete locked record');
      }

      // Execute DELETE
      await this.prisma.$queryRawUnsafe(
        `DELETE FROM "${tableName}" WHERE "ID" = $1`,
        BigInt(input.recordId)
      );

      return {
        success: true,
        message: 'Work record deleted successfully',
        record: undefined,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error('Failed to delete work record', error);
      throw new Error('Failed to delete work record from database');
    }
  }

  /**
   * Get the next valid workday for a specific employee.
   *
   * Fetches the last work record date from the employee's table,
   * then calculates the next valid workday (skipping weekends and Slovak holidays).
   *
   * @param employeeId - The ID of the employee
   * @returns The next valid workday as a Date object
   * @throws NotFoundException if employee not found
   * @throws Error if database query fails
   */
  async getNextWorkday(employeeId: number): Promise<Date> {
    try {
      // Fetch employee to get name for dynamic table
      const employee = await this.prisma.zamestnanci.findUnique({
        where: { ID: BigInt(employeeId) },
        select: {
          ID: true,
          Meno: true,
          Priezvisko: true,
        },
      });

      if (!employee) {
        throw new NotFoundException(`Employee with ID ${employeeId} not found`);
      }

      // Construct dynamic table name
      const tableName = constructTableName(employee.Meno, employee.Priezvisko);
      this.logger.log(`Fetching last record date from table: ${tableName}`);

      // Fetch last record date
      // OPRAVENÉ TS2347: Odstránené <any[]> z volania funkcie
      const lastRecords: any[] = await this.prisma.$queryRawUnsafe(
        `
        SELECT "StartDate"
        FROM "${tableName}"
        ORDER BY "StartDate" DESC
        LIMIT 1
        `,
      );

      // If no records exist, use today as starting point
      const lastRecordDate = lastRecords.length > 0
        ? new Date(lastRecords[0].StartDate)
        : new Date();

      // Calculate next workday using the utility
      const nextWorkday = await calculateNextWorkday(lastRecordDate, this.prisma);

      this.logger.log(`Next workday for employee ${employeeId}: ${nextWorkday.toISOString().split('T')[0]}`);

      return nextWorkday;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to get next workday', error);
      throw new Error('Failed to get next workday from database');
    }
  }

  /**
   * Fetch active projects for filter dropdown options.
   * Only returns projects where AllowAssignWorkingHours = true.
   *
   * @returns Array of Project entities with ID and Number fields
   * @throws Error if database query fails
   */
  async getActiveProjects(): Promise<ProjectCatalogItem[]> { 
    try {
      const projects = await this.prisma.projects.findMany({
        where: {
          AllowAssignWorkingHours: true,
        },
        select: {
          ID: true,
          Number: true,
          Name: true,
        },
        orderBy: {
          Number: 'asc',
        },
      });

      // OPRAVENÉ TS7006: Pridaný explicitný typ 'any' pre parameter 'project'
      return projects.map((project: any) => ({
        id: project.ID.toString(),
        number: project.Number,
        name: project.Name || null,
      }));
    } catch (error) {
      this.logger.error('Failed to fetch active projects', error);
      throw new Error('Failed to fetch active projects from database');
    }
  }

  /**
   * Fetch absence types for filter dropdown options.
   * Excludes deleted entries (Zmazane = true).
   *
   * @returns Array of AbsenceType entities with ID and Alias fields
   * @throws Error if database query fails
   */
  async getAbsenceTypes(): Promise<AbsenceType[]> {
    try {
      const absenceTypes = await this.prisma.cinnostTyp.findMany({
        where: {
          Zmazane: false,
        },
        select: {
          ID: true,
          Alias: true,
        },
        orderBy: {
          Alias: 'asc',
        },
      });

      // OPRAVENÉ TS7006: Pridaný explicitný typ 'any' pre parameter 'type'
      return absenceTypes.map((type: any) => ({
        id: type.ID.toString(),
        alias: type.Alias,
      }));
    } catch (error) {
      this.logger.error('Failed to fetch absence types', error);
      throw new Error('Failed to fetch absence types from database');
    }
  }

  /**
   * Fetch productivity types for filter dropdown options.
   *
   * @returns Array of ProductivityType entities with ID and HourType fields
   * @throws Error if database query fails
   */
  async getProductivityTypes(): Promise<ProductivityType[]> {
    try {
      const productivityTypes = await this.prisma.hourType.findMany({
        select: {
          ID: true,
          HourType: true,
        },
        orderBy: {
          HourType: 'asc',
        },
      });

      // OPRAVENÉ TS7006: Pridaný explicitný typ 'any' pre parameter 'type'
      return productivityTypes.map((type: any) => ({
        id: type.ID.toString(),
        hourType: type.HourType,
      }));
    } catch (error) {
      this.logger.error('Failed to fetch productivity types', error);
      throw new Error('Failed to fetch productivity types from database');
    }
  }

  /**
   * Fetch work types for filter dropdown options.
   *
   * @returns Array of WorkType entities with ID and HourType fields
   * @throws Error if database query fails
   */
  async getWorkTypes(): Promise<WorkType[]> {
    try {
      const workTypes = await this.prisma.hourTypes.findMany({
        select: {
          ID: true,
          HourType: true,
        },
        orderBy: {
          HourType: 'asc',
        },
      });

      // OPRAVENÉ TS7006: Pridaný explicitný typ 'any' pre parameter 'type'
      return workTypes.map((type: any) => ({
        id: type.ID.toString(),
        hourType: type.HourType,
      }));
    } catch (error) {
      this.logger.error('Failed to fetch work types', error);
      throw new Error('Failed to fetch work types from database');
    }
  }
}