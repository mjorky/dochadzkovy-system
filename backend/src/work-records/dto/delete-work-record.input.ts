import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsInt } from 'class-validator';

/**
 * Input DTO for deleting a work record.
 *
 * Requires recordId and employeeId for validation and authorization.
 */
@InputType()
export class DeleteWorkRecordInput {
  @Field(() => Int)
  @IsNotEmpty({ message: 'Record ID is required' })
  @IsInt()
  recordId: number;

  @Field(() => Int)
  @IsNotEmpty({ message: 'Employee ID is required' })
  @IsInt()
  employeeId: number;
}
