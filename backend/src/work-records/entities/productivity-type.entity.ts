import { ObjectType, Field } from '@nestjs/graphql';

/**
 * GraphQL entity for Productivity Type catalog data used in filter dropdowns.
 */
@ObjectType()
export class ProductivityType {
  @Field(() => String)
  id: string;

  @Field(() => String)
  hourType: string;
}
