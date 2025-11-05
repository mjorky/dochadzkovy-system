import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class WorkRecord {
  @Field(() => String)
  id: string;

  @Field(() => String)
  date: string;

  @Field(() => String)
  absenceType: string;

  @Field(() => String, { nullable: true })
  project: string | null;

  @Field(() => String, { nullable: true })
  productivityType: string | null;

  @Field(() => String, { nullable: true })
  workType: string | null;

  @Field(() => String)
  startTime: string;

  @Field(() => String)
  endTime: string;

  @Field(() => Float)
  hours: number;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => Int)
  km: number;

  @Field(() => Boolean)
  isTripFlag: boolean;

  @Field(() => Boolean)
  isLocked: boolean;

  @Field(() => Boolean)
  isOvernightShift: boolean;
}
