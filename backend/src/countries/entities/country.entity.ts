import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Country {
  @Field(() => ID)
  countryCode: string;

  @Field(() => String, { nullable: true })
  name: string | null;
}
