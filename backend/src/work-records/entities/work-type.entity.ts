import { ObjectType, Field } from '@nestjs/graphql';

/**
 * GraphQL entity for Work Type catalog data used in filter dropdowns.
 */
@ObjectType()
export class WorkType {
  @Field(() => String)
  id: string;

  @Field(() => String)
  hourType: string;
}
