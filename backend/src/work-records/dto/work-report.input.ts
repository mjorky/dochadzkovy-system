import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, Min, Max } from 'class-validator';

@InputType()
export class WorkReportInput {
  @Field(() => Int)
  @IsInt()
  employeeId: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @Field(() => Int)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;
}
