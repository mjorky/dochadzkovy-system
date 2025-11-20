import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  MaxLength,
  IsBoolean,
  IsOptional,
  Matches,
} from 'class-validator';

/**
 * Input DTO for updating an existing work record.
 *
 * All fields except recordId and employeeId are optional to support partial updates.
 * Time fields must be in HH:MM or HH:MM:SS format.
 */
@InputType()
export class UpdateWorkRecordInput {
  @Field(() => Int)
  @IsNotEmpty({ message: 'Record ID is required' })
  @IsInt()
  recordId: number;

  @Field(() => Int)
  @IsNotEmpty({ message: 'Employee ID is required' })
  @IsInt()
  employeeId: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  date?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  absenceTypeId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  projectId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  productivityTypeId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  workTypeId?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, {
    message: 'Start time must be in HH:MM or HH:MM:SS format',
  })
  startTime?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, {
    message: 'End time must be in HH:MM or HH:MM:SS format',
  })
  endTime?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0, { message: 'KM must be a non-negative number' })
  km?: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isTripFlag?: boolean;
}
