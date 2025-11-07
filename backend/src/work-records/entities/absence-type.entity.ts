import { ObjectType, Field } from '@nestjs/graphql';

/**
 * GraphQL entity for Absence Type catalog data used in filter dropdowns.
 */
@ObjectType()
export class AbsenceType {
  @Field(() => String)
  id: string;

  @Field(() => String)
  alias: string;
}
