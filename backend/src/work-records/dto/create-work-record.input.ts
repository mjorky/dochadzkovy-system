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
 * Input DTO for creating a new work record.
 *
 * All fields except description, km, and isTripFlag are required.
 * Time fields must be in HH:MM or HH:MM:SS format.
 */
@InputType()
export class CreateWorkRecordInput {
  @Field(() => Int)
  @IsNotEmpty({ message: 'Employee ID is required' })
  @IsInt()
  employeeId: number;

  @Field(() => String)
  @IsNotEmpty({ message: 'Date is required' })
  @IsString()
  date: string;

  @Field(() => Int)
  @IsNotEmpty({ message: 'Absence type is required' })
  @IsInt()
  absenceTypeId: number;

  @Field(() => Int)
  @IsNotEmpty({ message: 'Project is required' })
  @IsInt()
  projectId: number;

  @Field(() => Int)
  @IsNotEmpty({ message: 'Productivity type is required' })
  @IsInt()
  productivityTypeId: number;

  @Field(() => Int)
  @IsNotEmpty({ message: 'Work type is required' })
  @IsInt()
  workTypeId: number;

  @Field(() => String)
  @IsNotEmpty({ message: 'Start time is required' })
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, {
    message: 'Start time must be in HH:MM or HH:MM:SS format',
  })
  startTime: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'End time is required' })
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, {
    message: 'End time must be in HH:MM or HH:MM:SS format',
  })
  endTime: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description?: string;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0, { message: 'KM must be a non-negative number' })
  km?: number;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isTripFlag?: boolean;
}
