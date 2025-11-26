import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AuthUser {
  @Field()
  id: string;

  @Field()
  username: string;

  @Field()
  isAdmin: boolean;

  @Field()
  isManager: boolean;
}

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;

  @Field(() => AuthUser)
  user: AuthUser;
}

