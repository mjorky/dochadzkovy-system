import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class ProjectStatisticsItem {
  @Field(() => String)
  projectNumber: string;

  @Field(() => String, { nullable: true })
  projectName: string;

  @Field(() => Float)
  productiveHours: number;

  @Field(() => Float)
  nonProductiveHours: number;

  @Field(() => Float)
  productiveZHours: number;

  @Field(() => Float)
  nonProductiveZHours: number;
}

@ObjectType()
export class ProjectStatisticsResponse {
  @Field(() => [ProjectStatisticsItem])
  items: ProjectStatisticsItem[];
}

