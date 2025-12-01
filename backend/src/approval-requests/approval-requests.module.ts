import { Module } from '@nestjs/common';
import { ApprovalRequestsService } from './approval-requests.service';
import { ApprovalRequestsResolver } from './approval-requests.resolver';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    providers: [ApprovalRequestsResolver, ApprovalRequestsService, PrismaService],
})
export class ApprovalRequestsModule { }
