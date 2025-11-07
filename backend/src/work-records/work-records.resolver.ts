import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { WorkRecordsService } from './work-records.service';
import { WorkRecordsResponse } from './entities/work-records-response.entity';
import { WorkRecordsInput } from './dto/work-records.input';
import { CreateWorkRecordInput } from './dto/create-work-record.input';
import { UpdateWorkRecordInput } from './dto/update-work-record.input';
import { DeleteWorkRecordInput } from './dto/delete-work-record.input';
import { WorkRecordMutationResponse } from './entities/work-record-mutation-response.entity';
import { Project } from './entities/project.entity';
import { AbsenceType } from './entities/absence-type.entity';
import { ProductivityType } from './entities/productivity-type.entity';
import { WorkType } from './entities/work-type.entity';

/**
 * Resolver for work records queries and mutations.
 *
 * This resolver provides GraphQL queries for fetching work records
 * and mutations for creating, updating, and deleting work records.
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
   * Mutation to create a new work record.
   *
   * @param input - Work record data including all required fields
   * @returns WorkRecordMutationResponse with success status and created record
   *
   * @example
   * mutation {
   *   createWorkRecord(input: {
   *     employeeId: 1,
   *     date: "2025-01-15",
   *     absenceTypeId: 1,
   *     projectId: 100,
   *     productivityTypeId: 1,
   *     workTypeId: 1,
   *     startTime: "08:00",
   *     endTime: "16:30",
   *     description: "Development work",
   *     km: 0,
   *     isTripFlag: false
   *   }) {
   *     success
   *     message
   *     record {
   *       id
   *       date
   *       hours
   *     }
   *   }
   * }
   */
  @Mutation(() => WorkRecordMutationResponse, { name: 'createWorkRecord' })
  async createWorkRecord(
    @Args('input') input: CreateWorkRecordInput,
  ): Promise<WorkRecordMutationResponse> {
    try {
      return await this.workRecordsService.createWorkRecord(input);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mutation to update an existing work record.
   *
   * @param input - Work record data with recordId and optional field updates
   * @returns WorkRecordMutationResponse with success status and updated record
   *
   * @example
   * mutation {
   *   updateWorkRecord(input: {
   *     recordId: 123,
   *     employeeId: 1,
   *     description: "Updated description",
   *     endTime: "17:00"
   *   }) {
   *     success
   *     message
   *     record {
   *       id
   *       description
   *       endTime
   *     }
   *   }
   * }
   */
  @Mutation(() => WorkRecordMutationResponse, { name: 'updateWorkRecord' })
  async updateWorkRecord(
    @Args('input') input: UpdateWorkRecordInput,
  ): Promise<WorkRecordMutationResponse> {
    try {
      return await this.workRecordsService.updateWorkRecord(input);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mutation to delete a work record.
   *
   * @param input - Record ID and employee ID for validation
   * @returns WorkRecordMutationResponse with success status
   *
   * @example
   * mutation {
   *   deleteWorkRecord(input: {
   *     recordId: 123,
   *     employeeId: 1
   *   }) {
   *     success
   *     message
   *   }
   * }
   */
  @Mutation(() => WorkRecordMutationResponse, { name: 'deleteWorkRecord' })
  async deleteWorkRecord(
    @Args('input') input: DeleteWorkRecordInput,
  ): Promise<WorkRecordMutationResponse> {
    try {
      return await this.workRecordsService.deleteWorkRecord(input);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Query to get the next valid workday for a specific employee.
   * Skips weekends and Slovak holidays from the Holidays table.
   *
   * @param employeeId - The ID of the employee
   * @returns Date scalar with the next valid workday
   *
   * @example
   * query {
   *   getNextWorkday(employeeId: 1)
   * }
   */
  @Query(() => Date, { name: 'getNextWorkday' })
  async getNextWorkday(
    @Args('employeeId', { type: () => Int }) employeeId: number,
  ): Promise<Date> {
    try {
      return await this.workRecordsService.getNextWorkday(employeeId);
    } catch (error) {
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
