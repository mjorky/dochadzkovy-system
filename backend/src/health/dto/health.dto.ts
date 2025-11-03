import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class HealthDto {
  @Field(() => String)
  status: string;

  @Field(() => String)
  database: string;

  @Field(() => String, { nullable: true })
  timestamp?: string;
}
