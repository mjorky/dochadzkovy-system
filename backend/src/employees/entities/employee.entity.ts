import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class Employee {
  @Field(() => String)
  id: string;

  @Field(() => String)
  fullName: string;

  @Field(() => Float)
  vacationDays: number;

  @Field(() => Boolean)
  isAdmin: boolean;

  @Field(() => String)
  employeeType: string;

  @Field(() => String, { nullable: true })
  lastRecordDate?: string;

  @Field(() => String, { nullable: true })
  lockedUntil?: string;

  @Field(() => String, { nullable: true })
  titlePrefix?: string;

  @Field(() => String, { nullable: true })
  titleSuffix?: string;
}
