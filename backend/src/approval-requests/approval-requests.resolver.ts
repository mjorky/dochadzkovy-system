import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ApprovalRequestsService } from './approval-requests.service';
import { ApprovalRequest } from './entities/approval-request.entity';
import { CreateApprovalRequestInput } from './dto/create-approval-request.input';

@Resolver(() => ApprovalRequest)
export class ApprovalRequestsResolver {
    constructor(private readonly approvalRequestsService: ApprovalRequestsService) { }

    @Mutation(() => ApprovalRequest)
    createApprovalRequest(@Args('createApprovalRequestInput') createApprovalRequestInput: CreateApprovalRequestInput) {
        return this.approvalRequestsService.create(createApprovalRequestInput);
    }

    @Query(() => [ApprovalRequest], { name: 'approvalRequests' })
    findAll() {
        return this.approvalRequestsService.findAll();
    }

    @Query(() => [ApprovalRequest], { name: 'approvalRequestsByManager' })
    findByManager(@Args('managerId') managerId: string) {
        return this.approvalRequestsService.findByManager(managerId);
    }

    @Query(() => [ApprovalRequest], { name: 'approvalRequestsByEmployee' })
    findByEmployee(@Args('employeeId') employeeId: string) {
        return this.approvalRequestsService.findByEmployee(employeeId);
    }

    @Query(() => Int, { name: 'pendingApprovalCount' })
    countPendingForManager(@Args('managerId') managerId: string) {
        return this.approvalRequestsService.countPendingForManager(managerId);
    }

    @Query(() => ApprovalRequest, { name: 'approvalRequest' })
    findOne(@Args('id', { type: () => Int }) id: number) {
        return this.approvalRequestsService.findOne(id);
    }

    @Mutation(() => ApprovalRequest)
    approveRequest(
        @Args('id', { type: () => Int }) id: number,
        @Args('approverId') approverId: string,
    ) {
        return this.approvalRequestsService.approve(id, approverId);
    }

    @Mutation(() => ApprovalRequest)
    rejectRequest(
        @Args('id', { type: () => Int }) id: number,
        @Args('approverId') approverId: string,
    ) {
        return this.approvalRequestsService.reject(id, approverId);
    }
}
