import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApprovalRequestInput } from './dto/create-approval-request.input';
import { constructTableName } from '../work-records/utils/normalize-table-name';

@Injectable()
export class ApprovalRequestsService {
    constructor(private prisma: PrismaService) { }

    private mapToEntity(request: any) {
        return {
            id: request.ID.toString(),
            employeeId: request.EmployeeID.toString(),
            type: request.Type,
            dateFrom: request.DateFrom,
            dateTo: request.DateTo,
            hours: request.Hours,
            note: request.Note,
            status: request.Status,
            approverId: request.ApproverID?.toString() || null,
            createdAt: request.CreatedAt,
            updatedAt: request.UpdatedAt,
            employee: request.Employee ? {
                id: request.Employee.ID.toString(),
                fullName: `${request.Employee.Meno} ${request.Employee.Priezvisko}`,
                firstName: request.Employee.Meno,
                lastName: request.Employee.Priezvisko,
                vacationDays: request.Employee.Dovolenka,
                isAdmin: request.Employee.IsAdmin,
                employeeType: request.Employee.TypZamestnanca,
                lastRecordDate: request.Employee.PoslednyZaznam ? request.Employee.PoslednyZaznam.toISOString() : null,
                lockedUntil: request.Employee.ZamknuteK ? request.Employee.ZamknuteK.toISOString() : null,
                titlePrefix: request.Employee.TitulPred || null,
                titleSuffix: request.Employee.TitulZa || null,
            } : undefined,
            approver: request.Approver ? {
                id: request.Approver.ID.toString(),
                fullName: `${request.Approver.Meno} ${request.Approver.Priezvisko}`,
                firstName: request.Approver.Meno,
                lastName: request.Approver.Priezvisko,
                vacationDays: request.Approver.Dovolenka,
                isAdmin: request.Approver.IsAdmin,
                employeeType: request.Approver.TypZamestnanca,
                lastRecordDate: request.Approver.PoslednyZaznam ? request.Approver.PoslednyZaznam.toISOString() : null,
                lockedUntil: request.Approver.ZamknuteK ? request.Approver.ZamknuteK.toISOString() : null,
                titlePrefix: request.Approver.TitulPred || null,
                titleSuffix: request.Approver.TitulZa || null,
            } : undefined,
        };
    }

    async create(createApprovalRequestInput: CreateApprovalRequestInput) {
        const result = await this.prisma.approvalRequest.create({
            data: {
                EmployeeID: BigInt(createApprovalRequestInput.employeeId),
                Type: createApprovalRequestInput.type,
                DateFrom: createApprovalRequestInput.dateFrom,
                DateTo: createApprovalRequestInput.dateTo,
                Hours: createApprovalRequestInput.hours,
                Note: createApprovalRequestInput.note,
                Status: 'PENDING',
            },
            include: {
                Employee: true,
                Approver: true,
            },
        });

        return this.mapToEntity(result);
    }

    async findAll() {
        const results = await this.prisma.approvalRequest.findMany({
            include: {
                Employee: true,
                Approver: true,
            },
            orderBy: {
                CreatedAt: 'desc',
            },
        });

        return results.map(r => this.mapToEntity(r));
    }

    async findByManager(managerId: string, status?: string[]) {
        // Find all employees who report to this manager
        const subordinates = await this.prisma.zamestnanci.findMany({
            where: { ManagerID: BigInt(managerId) },
            select: { ID: true },
        });

        const subordinateIds = subordinates.map((s) => s.ID);

        const whereClause: any = {
            EmployeeID: { in: subordinateIds },
        };

        if (status && status.length > 0) {
            whereClause.Status = { in: status };
        } else {
            whereClause.Status = 'PENDING';
        }

        const results = await this.prisma.approvalRequest.findMany({
            where: whereClause,
            include: {
                Employee: true,
                Approver: true,
            },
            orderBy: {
                CreatedAt: 'desc',
            },
        });

        return results.map(r => this.mapToEntity(r));
    }

    async findByEmployee(employeeId: string) {
        const results = await this.prisma.approvalRequest.findMany({
            where: {
                EmployeeID: BigInt(employeeId),
            },
            include: {
                Employee: true,
                Approver: true,
            },
            orderBy: {
                CreatedAt: 'desc',
            },
        });

        return results.map(r => this.mapToEntity(r));
    }

    async countPendingForManager(managerId: string): Promise<number> {
        const subordinates = await this.prisma.zamestnanci.findMany({
            where: { ManagerID: BigInt(managerId) },
            select: { ID: true },
        });

        const subordinateIds = subordinates.map((s) => s.ID);

        return this.prisma.approvalRequest.count({
            where: {
                EmployeeID: { in: subordinateIds },
                Status: 'PENDING',
            },
        });
    }

    async findOne(id: number) {
        const result = await this.prisma.approvalRequest.findUnique({
            where: { ID: BigInt(id) },
            include: {
                Employee: true,
                Approver: true,
            },
        });

        return result ? this.mapToEntity(result) : null;
    }

    async approve(id: number, approverId: string) {
        const request = await this.prisma.approvalRequest.findUnique({
            where: { ID: BigInt(id) },
        });

        if (!request) {
            throw new NotFoundException(`Approval request with ID ${id} not found`);
        }

        if (request.Status !== 'PENDING') {
            throw new BadRequestException(`Request is already ${request.Status}`);
        }

        // Start a transaction
        return await this.prisma.$transaction(async (tx) => {
            // 1. Update the request status
            const updatedRequest = await tx.approvalRequest.update({
                where: { ID: BigInt(id) },
                data: {
                    Status: 'APPROVED',
                    ApproverID: BigInt(approverId),
                },
                include: {
                    Employee: true,
                    Approver: true,
                },
            });

            // 2. Insert the actual record based on type
            if (request.Type === 'Overtime') {
                // Insert into Nadcasy table using raw SQL (composite primary key)
                await tx.$executeRawUnsafe(
                    `INSERT INTO "Nadcasy" ("ZamestnanecID", "Datum", "Nadcas", "Schvalil", "Poznamka", "Typ", "Odpocet")
           VALUES ($1, $2, $3::interval, $4, $5, $6, $7)`,
                    request.EmployeeID,
                    request.DateFrom,
                    `${request.Hours || 0} hours`,
                    BigInt(approverId),
                    request.Note,
                    'Flexi',
                    false,
                );
            } else {
                // Vacation or Absence - Insert into employee's personal table
                const employee = await tx.zamestnanci.findUnique({
                    where: { ID: request.EmployeeID },
                });

                if (!employee) {
                    throw new NotFoundException(`Employee not found`);
                }

                const tableName = constructTableName(employee.Meno, employee.Priezvisko);

                // Get the absence type ID for the request type
                const absenceType = await tx.cinnostTyp.findFirst({
                    where: {
                        OR: [
                            { Alias: request.Type },
                            { Typ: request.Type },
                        ],
                    },
                });

                if (!absenceType) {
                    throw new NotFoundException(`Absence type ${request.Type} not found`);
                }

                // Generate dates between DateFrom and DateTo
                const dates = this.generateDateRange(request.DateFrom, request.DateTo);

                // Insert a record for each date
                for (const date of dates) {
                    await tx.$executeRawUnsafe(
                        `INSERT INTO "${tableName}" ("CinnostTypID", "StartDate", "ProjectID", "HourTypeID", "HourTypesID", "StartTime", "EndTime", "Description", "km", "Lock", "DlhodobaSC")
             VALUES ($1, $2, $3, $4, $5, $6::time, $7::time, COALESCE($8, ''), $9, false, false)`,
                        absenceType.ID,
                        date,
                        null, // ProjectID
                        null, // HourTypeID
                        null, // HourTypesID
                        '00:00:00', // StartTime
                        '00:00:00', // EndTime
                        request.Note, // Description
                        0, // km
                    );
                }
            }

            return this.mapToEntity(updatedRequest);
        });
    }

    async reject(id: number, approverId: string) {
        const request = await this.prisma.approvalRequest.findUnique({
            where: { ID: BigInt(id) },
        });

        if (!request) {
            throw new NotFoundException(`Approval request with ID ${id} not found`);
        }

        if (request.Status !== 'PENDING') {
            throw new BadRequestException(`Request is already ${request.Status}`);
        }

        const result = await this.prisma.approvalRequest.update({
            where: { ID: BigInt(id) },
            data: {
                Status: 'REJECTED',
                ApproverID: BigInt(approverId),
            },
            include: {
                Employee: true,
                Approver: true,
            },
        });

        return this.mapToEntity(result);
    }

    private generateDateRange(start: Date, end: Date): Date[] {
        const dates: Date[] = [];
        const current = new Date(start);
        const endDate = new Date(end);

        while (current <= endDate) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        return dates;
    }
}
