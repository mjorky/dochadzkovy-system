import { ObjectType, Field, Int } from '@nestjs/graphql';

/**
 * GraphQL entity for Project catalog data used in filter dropdowns.
 */
@ObjectType()
export class Project {
  @Field(() => String)
  id: string;

  @Field(() => String)
  number: string;

  @Field(() => String, { nullable: true })
  name: string | null;
}
