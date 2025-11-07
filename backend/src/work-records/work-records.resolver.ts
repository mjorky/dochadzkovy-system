import { Resolver, Query, Args } from '@nestjs/graphql';
import { WorkRecordsService } from './work-records.service';
import { WorkRecordsResponse } from './entities/work-records-response.entity';
import { WorkRecordsInput } from './dto/work-records.input';
import { Project } from './entities/project.entity';
import { AbsenceType } from './entities/absence-type.entity';
import { ProductivityType } from './entities/productivity-type.entity';
import { WorkType } from './entities/work-type.entity';

/**
 * Resolver for work records queries.
 *
 * This resolver provides the main GraphQL query for fetching work records
 * with filtering, pagination, and catalog data.
 */
@Resolver()
export class WorkRecordsResolver {
  constructor(private readonly workRecordsService: WorkRecordsService) {}

  /**
   * Query to fetch work records for a specific employee within a date range.
   *
   * @param input - Query parameters including employeeId, date range, and pagination
   * @returns WorkRecordsResponse with records, totalCount, and hasMore flag
   *
   * @example
   * query {
   *   getWorkRecords(input: {
   *     employeeId: 1,
   *     fromDate: "2025-01-01",
   *     toDate: "2025-01-31",
   *     limit: 50,
   *     offset: 0
   *   }) {
   *     records {
   *       id
   *       date
   *       absenceType
   *       project
   *       hours
   *     }
   *     totalCount
   *     hasMore
   *   }
   * }
   */
  @Query(() => WorkRecordsResponse, { name: 'getWorkRecords' })
  async getWorkRecords(
    @Args('input') input: WorkRecordsInput,
  ): Promise<WorkRecordsResponse> {
    try {
      return await this.workRecordsService.getWorkRecords(input);
    } catch (error) {
      // Re-throw errors for proper GraphQL error handling
      throw error;
    }
  }

  /**
   * Query to fetch active projects for filter dropdown options.
   * Only returns projects where AllowAssignWorkingHours = true.
   *
   * @returns Array of Project entities
   *
   * @example
   * query {
   *   getActiveProjects {
   *     id
   *     number
   *     name
   *   }
   * }
   */
  @Query(() => [Project], { name: 'getActiveProjects' })
  async getActiveProjects(): Promise<Project[]> {
    try {
      return await this.workRecordsService.getActiveProjects();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Query to fetch absence types for filter dropdown options.
   * Excludes deleted entries (Zmazane = true).
   *
   * @returns Array of AbsenceType entities
   *
   * @example
   * query {
   *   getAbsenceTypes {
   *     id
   *     alias
   *   }
   * }
   */
  @Query(() => [AbsenceType], { name: 'getAbsenceTypes' })
  async getAbsenceTypes(): Promise<AbsenceType[]> {
    try {
      return await this.workRecordsService.getAbsenceTypes();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Query to fetch productivity types for filter dropdown options.
   *
   * @returns Array of ProductivityType entities
   *
   * @example
   * query {
   *   getProductivityTypes {
   *     id
   *     hourType
   *   }
   * }
   */
  @Query(() => [ProductivityType], { name: 'getProductivityTypes' })
  async getProductivityTypes(): Promise<ProductivityType[]> {
    try {
      return await this.workRecordsService.getProductivityTypes();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Query to fetch work types for filter dropdown options.
   *
   * @returns Array of WorkType entities
   *
   * @example
   * query {
   *   getWorkTypes {
   *     id
   *     hourType
   *   }
   * }
   */
  @Query(() => [WorkType], { name: 'getWorkTypes' })
  async getWorkTypes(): Promise<WorkType[]> {
    try {
      return await this.workRecordsService.getWorkTypes();
    } catch (error) {
      throw error;
    }
  }
}
