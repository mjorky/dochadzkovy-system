import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
class DailyRecord {
  @Field()
  date: string;

  @Field()
  dayOfWeek: string;

  @Field({ nullable: true })
  startTime?: string;

  @Field({ nullable: true })
  endTime?: string;

  @Field(() => Float, { nullable: true })
  hours?: number;

  @Field({ nullable: true })
  absenceReason?: string;
}

@ObjectType()
class AbsenceSummaryItem {
  @Field()
  category: string;

  @Field(() => Float)
  days: number;

  @Field(() => Float)
  hours: number;
}

@ObjectType()
class ActivitySummaryItem {
  @Field()
  activityType: string;

  @Field(() => Float)
  hours: number;
}

@ObjectType()
export class WorkReport {
  @Field(() => Int)
  totalWorkDays: number;

  @Field(() => Float)
  totalHours: number;

  @Field(() => Float)
  weekendWorkHours: number;

  @Field(() => Float)
  holidayWorkHours: number;

  @Field(() => [DailyRecord])
  dailyRecords: DailyRecord[];

  @Field(() => [AbsenceSummaryItem])
  absenceSummary: AbsenceSummaryItem[];

  @Field(() => [ActivitySummaryItem])
  activitySummary: ActivitySummaryItem[];
}
