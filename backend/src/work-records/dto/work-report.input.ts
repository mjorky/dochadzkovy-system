import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, Min, Max, IsString, IsOptional } from 'class-validator';

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

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  signatureImage?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isLegalReport?: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  legalReportTime?: string;
}
