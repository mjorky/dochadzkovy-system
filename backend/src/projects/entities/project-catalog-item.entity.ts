import { ObjectType, Field, ID } from '@nestjs/graphql';

/**
 * Represents a lightweight project object, typically used for catalogs or dropdown menus.
 */
@ObjectType()
export class ProjectCatalogItem {
  @Field(() => ID)
  id: string;

  @Field()
  number: string;

  @Field()
  name: string;
}
