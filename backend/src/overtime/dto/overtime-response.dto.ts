import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class OvertimeSummary {
  @Field()
  type: string;

  @Field(() => Float)
  hours: number;
}

@ObjectType()
export class OvertimeResponse {
  @Field(() => [OvertimeSummary])
  items: OvertimeSummary[];
}
