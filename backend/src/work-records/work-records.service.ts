import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkRecordsInput } from './dto/work-records.input';
import { WorkRecordsResponse } from './entities/work-records-response.entity';
import { WorkRecord } from './entities/work-record.entity';
import { Project } from './entities/project.entity';
import { AbsenceType } from './entities/absence-type.entity';
import { ProductivityType } from './entities/productivity-type.entity';
import { WorkType } from './entities/work-type.entity';
import { constructTableName } from './utils/normalize-table-name';

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
      // Note: We use raw query because Prisma doesn't support dynamic table names in the typed API
      const records = await this.prisma.$queryRawUnsafe<any[]>(
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
        ORDER BY wr."StartDate" ASC
        LIMIT $3 OFFSET $4
        `,
        fromDate,
        toDate,
        input.limit || 50,
        input.offset || 0,
      );

      // Get total count for pagination
      const countResult = await this.prisma.$queryRawUnsafe<any[]>(
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
      const workRecords: WorkRecord[] = records.map((record) => {
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
   * Fetch active projects for filter dropdown options.
   * Only returns projects where AllowAssignWorkingHours = true.
   *
   * @returns Array of Project entities with ID and Number fields
   * @throws Error if database query fails
   */
  async getActiveProjects(): Promise<Project[]> {
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

      return projects.map((project) => ({
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

      return absenceTypes.map((type) => ({
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

      return productivityTypes.map((type) => ({
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

      return workTypes.map((type) => ({
        id: type.ID.toString(),
        hourType: type.HourType,
      }));
    } catch (error) {
      this.logger.error('Failed to fetch work types', error);
      throw new Error('Failed to fetch work types from database');
    }
  }
}
