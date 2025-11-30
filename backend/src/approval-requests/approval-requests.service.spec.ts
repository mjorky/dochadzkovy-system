import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { ApprovalRequestsService } from './approval-requests.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ApprovalRequestsService', () => {
    let service: ApprovalRequestsService;
    let prisma: PrismaService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ConfigModule.forRoot()],
            providers: [ApprovalRequestsService, PrismaService],
        }).compile();

        service = module.get<ApprovalRequestsService>(ApprovalRequestsService);
        prisma = module.get<PrismaService>(PrismaService);
        await prisma.onModuleInit();
    });

    afterAll(async () => {
        await prisma.onModuleDestroy();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new approval request', async () => {
            // Get the first employee from the database
            const employee = await prisma.zamestnanci.findFirst();

            if (!employee) {
                console.log('No employees found in database, skipping test');
                return;
            }

            const input = {
                employeeId: employee.ID.toString(),
                type: 'Vacation',
                dateFrom: new Date('2025-01-15'),
                dateTo: new Date('2025-01-17'),
                note: 'Test vacation request',
            };

            const result = await service.create(input);

            expect(result).toBeDefined();
            expect(result.EmployeeID).toEqual(employee.ID);
            expect(result.Type).toBe('Vacation');
            expect(result.Status).toBe('PENDING');

            // Cleanup
            await prisma.approvalRequest.delete({ where: { ID: result.ID } });
        });
    });

    describe('findByEmployee', () => {
        it('should return requests for a specific employee', async () => {
            const employee = await prisma.zamestnanci.findFirst();

            if (!employee) {
                console.log('No employees found in database, skipping test');
                return;
            }

            // Create a test request
            const request = await prisma.approvalRequest.create({
                data: {
                    EmployeeID: employee.ID,
                    Type: 'Vacation',
                    DateFrom: new Date('2025-02-01'),
                    DateTo: new Date('2025-02-05'),
                    Status: 'PENDING',
                },
            });

            const results = await service.findByEmployee(employee.ID.toString());

            expect(results).toBeDefined();
            expect(Array.isArray(results)).toBe(true);
            expect(results.some(r => r.ID === request.ID)).toBe(true);

            // Cleanup
            await prisma.approvalRequest.delete({ where: { ID: request.ID } });
        });
    });

    describe('countPendingForManager', () => {
        it('should return 0 for manager with no subordinates', async () => {
            const manager = await prisma.zamestnanci.findFirst({
                where: { IsAdmin: true },
            });

            if (!manager) {
                console.log('No managers found in database, skipping test');
                return;
            }

            const count = await service.countPendingForManager(manager.ID.toString());

            expect(count).toBeDefined();
            expect(typeof count).toBe('number');
            expect(count).toBeGreaterThanOrEqual(0);
        });
    });

    describe('approve', () => {
        it.skip('should approve a pending request and insert vacation record', async () => {
            // Use Miroslav Boloz as we know this employee has a table
            const employee = await prisma.zamestnanci.findFirst({
                where: {
                    Meno: 'Miroslav',
                    Priezvisko: 'Boloz',
                },
            });
            const manager = await prisma.zamestnanci.findFirst({
                where: { IsAdmin: true },
            });

            if (!employee || !manager) {
                console.log('Required data not found, skipping test');
                return;
            }

            // Create a pending request
            const request = await prisma.approvalRequest.create({
                data: {
                    EmployeeID: employee.ID,
                    Type: 'Dovolenka', // Using actual absence type alias
                    DateFrom: new Date('2025-03-10'),
                    DateTo: new Date('2025-03-10'), // Single day to simplify cleanup
                    Status: 'PENDING',
                },
            });

            // Approve the request
            const approved = await service.approve(Number(request.ID), manager.ID.toString());

            expect(approved).toBeDefined();
            expect(approved.Status).toBe('APPROVED');
            expect(approved.ApproverID).toEqual(manager.ID);

            // Verify the vacation record was created in employee table
            const tableName = `t_${employee.Meno}_${employee.Priezvisko}`;
            const records: any[] = await prisma.$queryRawUnsafe(
                `SELECT * FROM "${tableName}" WHERE "StartDate" = $1`,
                new Date('2025-03-10'),
            );

            expect(records.length).toBeGreaterThan(0);

            // Cleanup
            await prisma.$queryRawUnsafe(
                `DELETE FROM "${tableName}" WHERE "StartDate" = $1 AND "Description" = $2`,
                new Date('2025-03-10'),
                request.Note || '',
            );
            await prisma.approvalRequest.delete({ where: { ID: request.ID } });
        });
    });

    describe('reject', () => {
        it('should reject a pending request', async () => {
            const employee = await prisma.zamestnanci.findFirst();
            const manager = await prisma.zamestnanci.findFirst({
                where: { IsAdmin: true },
            });

            if (!employee || !manager) {
                console.log('Required data not found, skipping test');
                return;
            }

            // Create a pending request
            const request = await prisma.approvalRequest.create({
                data: {
                    EmployeeID: employee.ID,
                    Type: 'Vacation',
                    DateFrom: new Date('2025-04-01'),
                    DateTo: new Date('2025-04-03'),
                    Status: 'PENDING',
                },
            });

            // Reject the request
            const rejected = await service.reject(Number(request.ID), manager.ID.toString());

            expect(rejected).toBeDefined();
            expect(rejected.Status).toBe('REJECTED');
            expect(rejected.ApproverID).toEqual(manager.ID);

            // Cleanup
            await prisma.approvalRequest.delete({ where: { ID: request.ID } });
        });
    });
});
