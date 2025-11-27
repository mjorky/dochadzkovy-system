import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class OvertimeSummary {
  @Field()
  type: string;

  @Field(() => Float)
  hours: number;
}

@ObjectType()
export class OvertimeRecord {
  @Field(() => String)
  id: string;

  @Field()
  date: string; // Assuming date is returned as a string for now

  @Field()
  type: string;

  @Field(() => Float)
  hours: number;

  @Field({ nullable: true })
  description: string;

  @Field()
  isCorrection: boolean;
}

@ObjectType()
export class OvertimeResponse {
  @Field(() => [OvertimeSummary])
  items: OvertimeSummary[];

  @Field(() => [OvertimeRecord])
  records: OvertimeRecord[];
}
