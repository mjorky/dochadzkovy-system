import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Holiday {
    @Field(() => Date)
    Den: Date;
}
