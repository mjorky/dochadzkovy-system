import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Employee } from '../../employees/entities/employee.entity';

@ObjectType()
export class ApprovalRequest {
    @Field(() => String)
    id: string;

    @Field(() => String)
    employeeId: string;

    @Field(() => String)
    type: string;

    @Field(() => Date)
    dateFrom: Date;

    @Field(() => Date)
    dateTo: Date;

    @Field(() => Float, { nullable: true })
    hours: number | null;

    @Field(() => String, { nullable: true })
    note: string | null;

    @Field(() => String)
    status: string;

    @Field(() => String, { nullable: true })
    approverId: string | null;

    @Field(() => Date)
    createdAt: Date;

    @Field(() => Date)
    updatedAt: Date;

    @Field(() => Employee)
    employee: Employee;

    @Field(() => Employee, { nullable: true })
    approver: Employee | null;
}
