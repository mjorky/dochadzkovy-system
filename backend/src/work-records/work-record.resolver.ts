import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { WorkRecord } from './entities/work-record.entity';
import { calculateHours, isOvernightShift } from './utils/time-calculations';

/**
 * Resolver for computed fields on WorkRecord entity.
 *
 * This resolver handles the calculation of dynamic fields that are not stored
 * in the database but computed from other fields at query time.
 */
@Resolver(() => WorkRecord)
export class WorkRecordResolver {
  /**
   * Resolves the hours field by calculating decimal hours from startTime and endTime.
   * Handles overnight shifts automatically (when endTime < startTime).
   *
   * @param workRecord - The parent WorkRecord object from the database
   * @returns Decimal hours with 2 decimal places (e.g., 8.5 for 8 hours 30 minutes)
   * @throws Error if calculated hours exceed 24 hours
   *
   * @example
   * // For a record with startTime="09:00:00" and endTime="17:30:00"
   * // Returns: 8.5
   *
   * @example
   * // For an overnight shift with startTime="22:00:00" and endTime="06:00:00"
   * // Returns: 8.0
   */
  @ResolveField(() => Number)
  hours(@Parent() workRecord: WorkRecord): number {
    return calculateHours(workRecord.startTime, workRecord.endTime);
  }

  /**
   * Resolves the isOvernightShift field by detecting if the shift spans midnight.
   * Returns true when endTime < startTime.
   *
   * @param workRecord - The parent WorkRecord object from the database
   * @returns true if shift spans midnight, false otherwise
   *
   * @example
   * // For a record with startTime="22:00:00" and endTime="06:00:00"
   * // Returns: true
   *
   * @example
   * // For a record with startTime="09:00:00" and endTime="17:00:00"
   * // Returns: false
   */
  @ResolveField(() => Boolean)
  isOvernightShift(@Parent() workRecord: WorkRecord): boolean {
    return isOvernightShift(workRecord.startTime, workRecord.endTime);
  }
}
