import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class WorkRecordsInput {
  @Field(() => Int)
  employeeId: number;

  @Field(() => String)
  fromDate: string;

  @Field(() => String)
  toDate: string;

  @Field(() => Int, { nullable: true, defaultValue: 50 })
  limit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  offset?: number;

  @Field(() => String, { nullable: true, defaultValue: 'DESC' })
  sortOrder?: 'ASC' | 'DESC';
}
