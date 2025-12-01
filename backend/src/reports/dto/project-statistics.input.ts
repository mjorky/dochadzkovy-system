import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class ProjectStatisticsInput {
  @Field(() => Int)
  @IsInt()
  employeeId: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  fromDate: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  toDate: string;
}

