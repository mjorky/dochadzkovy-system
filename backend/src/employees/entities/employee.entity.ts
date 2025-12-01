import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class Employee {
  @Field(() => String)
  id: string;

  @Field(() => String)
  fullName: string;

  @Field(() => String, { nullable: true })
  firstName?: string;

  @Field(() => String, { nullable: true })
  lastName?: string;

  @Field(() => Float)
  vacationDays: number;

  @Field(() => Boolean)
  isAdmin: boolean;

  @Field(() => String)
  employeeType: string;

  @Field(() => String, { nullable: true })
  lastRecordDate: string | null;

  @Field(() => String, { nullable: true })
  lockedUntil: string | null;

  @Field(() => String, { nullable: true })
  titlePrefix: string | null;

  @Field(() => String, { nullable: true })
  titleSuffix: string | null;

  @Field(() => Employee, { nullable: true })
  manager?: Employee;
}
