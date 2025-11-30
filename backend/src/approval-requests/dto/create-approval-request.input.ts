import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class CreateApprovalRequestInput {
    @Field(() => String)
    employeeId: string;

    @Field(() => String)
    type: string;

    @Field(() => Date)
    dateFrom: Date;

    @Field(() => Date)
    dateTo: Date;

    @Field(() => Float, { nullable: true })
    hours?: number;

    @Field(() => String, { nullable: true })
    note?: string;
}
