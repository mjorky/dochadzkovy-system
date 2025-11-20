import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class WorkListReportItem {
    @Field(() => String)
    projectNumber: string;

    @Field(() => String, { nullable: true })
    projectName: string;

    @Field(() => Float)
    productiveHours: number;

    @Field(() => Float)
    nonProductiveHours: number;

    @Field(() => Float)
    productiveOutSkCzHours: number;

    @Field(() => Float)
    nonProductiveZHours: number;

    @Field(() => Float)
    productive70Hours: number;

    @Field(() => Int)
    travelKm: number;

    @Field(() => String, { nullable: true })
    projectManagerName: string;
}

@ObjectType()
export class WorkListReportResponse {
    @Field(() => [WorkListReportItem])
    items: WorkListReportItem[];
}
