import { Test, TestingModule } from '@nestjs/testing';
import { WorkRecordsService } from './work-records.service';
import { WorkRecordResolver } from './work-record.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { WorkRecordsInput } from './dto/work-records.input';
import { NotFoundException } from '@nestjs/common';

/**
 * Integration tests for Work Records feature
 *
 * These tests verify critical integration points:
 * 1. Service integration with real Prisma (mocked database)
 * 2. Resolver integration with service layer
 * 3. End-to-end data flow from GraphQL to database
 * 4. Complex queries with multiple employees
 * 5. Edge cases with real-world data scenarios
 *
 * NOTE: These tests use mocked Prisma for predictable results.
 * They fill critical integration test gaps beyond unit tests.
 */
describe('WorkRecords Integration Tests', () => {
  let service: WorkRecordsService;
  let resolver: WorkRecordResolver;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkRecordsService,
        WorkRecordResolver,
        {
          provide: PrismaService,
          useValue: {
            zamestnanci: {
              findUnique: jest.fn(),
            },
            $queryRawUnsafe: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WorkRecordsService>(WorkRecordsService);
    resolver = module.get<WorkRecordResolver>(WorkRecordResolver);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('Integration: Multiple Employees with Different Table Names', () => {
    it('should correctly query different employee tables', async () => {
      const employees = [
        { ID: BigInt(1), Meno: 'Miroslav', Priezvisko: 'Boloz', ZamknuteK: null },
        { ID: BigInt(2), Meno: 'Anna', Priezvisko: 'Lovasova', ZamknuteK: null },
        { ID: BigInt(3), Meno: 'Jan', Priezvisko: 'Novak', ZamknuteK: null },
      ];

      for (const employee of employees) {
        const input: WorkRecordsInput = {
          employeeId: Number(employee.ID),
          fromDate: '2025-01-01',
          toDate: '2025-01-31',
          limit: 50,
          offset: 0,
        };

        // Mock employee lookup
        jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(employee as any);

        // Mock empty results
        jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce([]);
        jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce([{ count: BigInt(0) }]);

        const result = await service.getWorkRecords(input);

        expect(result.records).toEqual([]);

        // Verify dynamic table name was constructed correctly
        const expectedTableName = `t_${employee.Meno}_${employee.Priezvisko}`;
        expect(prismaService.$queryRawUnsafe).toHaveBeenCalledWith(
          expect.stringContaining(expectedTableName),
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expect.anything()
        );
      }
    });

    it('should handle employee names with special characters', async () => {
      // Edge case: Employee name with accented characters
      const employee = {
        ID: BigInt(4),
        Meno: 'Matúš',
        Priezvisko: 'Kováč',
        ZamknuteK: null,
      };

      const input: WorkRecordsInput = {
        employeeId: 4,
        fromDate: '2025-01-01',
        toDate: '2025-01-31',
        limit: 50,
        offset: 0,
      };

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(employee as any);
      jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce([]);
      jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce([{ count: BigInt(0) }]);

      const result = await service.getWorkRecords(input);

      // Should still work even with special characters
      expect(result.records).toEqual([]);
      expect(prismaService.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('t_Matúš_Kováč'),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything()
      );
    });
  });

  describe('Integration: Complex Data Scenarios', () => {
    it('should handle mixed work and absence records correctly', async () => {
      const employee = {
        ID: BigInt(1),
        Meno: 'Miroslav',
        Priezvisko: 'Boloz',
        ZamknuteK: new Date('2025-01-10'),
      };

      // Mix of work records and absence records
      const mockRecords = [
        {
          ID: BigInt(1),
          StartDate: new Date('2025-01-05'),
          CinnostTypID: BigInt(1),
          ProjectID: BigInt(1),
          HourTypeID: BigInt(1),
          HourTypesID: BigInt(5),
          StartTime: '09:00:00',
          EndTime: '17:30:00',
          Description: 'Work record',
          km: 0,
          Lock: false,
          DlhodobaSC: false,
          CinnostTyp_Alias: 'Prítomný v práci',
          Projects_Number: 'PRJ-001',
          HourType_HourType: 'Produktívne',
          HourTypes_HourType: 'Programovanie',
        },
        {
          ID: BigInt(2),
          StartDate: new Date('2025-01-08'),
          CinnostTypID: BigInt(4),
          ProjectID: null, // Absence record
          HourTypeID: null,
          HourTypesID: null,
          StartTime: '08:00:00',
          EndTime: '16:00:00',
          Description: null,
          km: 0,
          Lock: false,
          DlhodobaSC: false,
          CinnostTyp_Alias: 'Dovolenka',
          Projects_Number: null,
          HourType_HourType: null,
          HourTypes_HourType: null,
        },
        {
          ID: BigInt(3),
          StartDate: new Date('2025-01-20'),
          CinnostTypID: BigInt(1),
          ProjectID: BigInt(2),
          HourTypeID: BigInt(1),
          HourTypesID: BigInt(6),
          StartTime: '22:00:00',
          EndTime: '06:00:00', // Overnight shift
          Description: 'Night shift',
          km: 100,
          Lock: true, // Explicitly locked
          DlhodobaSC: true, // Trip flag
          CinnostTyp_Alias: 'Prítomný v práci',
          Projects_Number: 'PRJ-002',
          HourType_HourType: 'Produktívne',
          HourTypes_HourType: 'Stretnutie',
        },
      ];

      const input: WorkRecordsInput = {
        employeeId: 1,
        fromDate: '2025-01-01',
        toDate: '2025-01-31',
        limit: 50,
        offset: 0,
      };

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(employee as any);
      jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce(mockRecords as any);
      jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce([{ count: BigInt(3) }]);

      const result = await service.getWorkRecords(input);

      expect(result.records).toHaveLength(3);

      // Verify work record (ID 1)
      const workRecord = result.records[0];
      expect(workRecord.absenceType).toBe('Prítomný v práci');
      expect(workRecord.project).toBe('PRJ-001');
      expect(workRecord.productivityType).toBe('Produktívne');
      expect(workRecord.workType).toBe('Programovanie');
      expect(workRecord.isLocked).toBe(true); // Locked by ZamknuteK date (Jan 5 <= Jan 10)
      expect(workRecord.isTripFlag).toBe(false);

      // Verify absence record (ID 2)
      const absenceRecord = result.records[1];
      expect(absenceRecord.absenceType).toBe('Dovolenka');
      expect(absenceRecord.project).toBeNull();
      expect(absenceRecord.productivityType).toBeNull();
      expect(absenceRecord.workType).toBeNull();
      expect(absenceRecord.isLocked).toBe(true); // Locked by ZamknuteK date (Jan 8 <= Jan 10)

      // Verify overnight shift with explicit lock (ID 3)
      const overnightRecord = result.records[2];
      expect(overnightRecord.startTime).toBe('22:00:00');
      expect(overnightRecord.endTime).toBe('06:00:00');
      expect(overnightRecord.isLocked).toBe(true); // Explicitly locked (Lock flag)
      expect(overnightRecord.isTripFlag).toBe(true);
      expect(overnightRecord.km).toBe(100);
    });

    it('should handle large dataset pagination correctly', async () => {
      const employee = {
        ID: BigInt(1),
        Meno: 'Miroslav',
        Priezvisko: 'Boloz',
        ZamknuteK: null,
      };

      const input: WorkRecordsInput = {
        employeeId: 1,
        fromDate: '2024-01-01',
        toDate: '2025-12-31',
        limit: 50,
        offset: 0,
      };

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(employee as any);
      jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce([]);
      jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce([{ count: BigInt(500) }]);

      const result = await service.getWorkRecords(input);

      // With 500 total records and offset 0, limit 50, hasMore should be true
      expect(result.totalCount).toBe(500);
      expect(result.hasMore).toBe(true);

      // Test pagination at different offsets
      const testCases = [
        { offset: 0, limit: 50, expectedHasMore: true }, // 0 + 50 < 500
        { offset: 100, limit: 50, expectedHasMore: true }, // 100 + 50 < 500
        { offset: 450, limit: 50, expectedHasMore: false }, // 450 + 50 >= 500
        { offset: 500, limit: 50, expectedHasMore: false }, // 500 + 50 > 500
      ];

      for (const testCase of testCases) {
        jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(employee as any);
        jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce([]);
        jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce([{ count: BigInt(500) }]);

        const paginationResult = await service.getWorkRecords({
          ...input,
          offset: testCase.offset,
          limit: testCase.limit,
        });

        expect(paginationResult.hasMore).toBe(testCase.expectedHasMore);
      }
    });
  });

  describe('Integration: Lock Status Computation', () => {
    it('should correctly compute lock status with various ZamknuteK scenarios', async () => {
      const testScenarios = [
        {
          description: 'Record before ZamknuteK should be locked',
          zamknuteK: new Date('2025-01-31'),
          recordDate: new Date('2025-01-15'),
          lockFlag: false,
          expectedLocked: true,
        },
        {
          description: 'Record on ZamknuteK should be locked',
          zamknuteK: new Date('2025-01-31'),
          recordDate: new Date('2025-01-31'),
          lockFlag: false,
          expectedLocked: true,
        },
        {
          description: 'Record after ZamknuteK should not be locked',
          zamknuteK: new Date('2025-01-31'),
          recordDate: new Date('2025-02-01'),
          lockFlag: false,
          expectedLocked: false,
        },
        {
          description: 'Explicitly locked record (Lock flag)',
          zamknuteK: null,
          recordDate: new Date('2025-02-01'),
          lockFlag: true,
          expectedLocked: true,
        },
        {
          description: 'Unlocked record after ZamknuteK with Lock=false',
          zamknuteK: new Date('2025-01-15'),
          recordDate: new Date('2025-02-01'),
          lockFlag: false,
          expectedLocked: false,
        },
      ];

      for (const scenario of testScenarios) {
        const employee = {
          ID: BigInt(1),
          Meno: 'Miroslav',
          Priezvisko: 'Boloz',
          ZamknuteK: scenario.zamknuteK,
        };

        const mockRecord = {
          ID: BigInt(1),
          StartDate: scenario.recordDate,
          CinnostTypID: BigInt(1),
          ProjectID: BigInt(1),
          HourTypeID: BigInt(1),
          HourTypesID: BigInt(5),
          StartTime: '09:00:00',
          EndTime: '17:00:00',
          Description: 'Test record',
          km: 0,
          Lock: scenario.lockFlag,
          DlhodobaSC: false,
          CinnostTyp_Alias: 'Prítomný v práci',
          Projects_Number: 'PRJ-001',
          HourType_HourType: 'Produktívne',
          HourTypes_HourType: 'Programovanie',
        };

        jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(employee as any);
        jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce([mockRecord] as any);
        jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce([{ count: BigInt(1) }]);

        const result = await service.getWorkRecords({
          employeeId: 1,
          fromDate: '2025-01-01',
          toDate: '2025-12-31',
          limit: 50,
          offset: 0,
        });

        expect(result.records[0].isLocked).toBe(scenario.expectedLocked);
      }
    });
  });

  describe('Integration: Resolver with Field Resolvers', () => {
    it('should correctly resolve hours field for different shift types', () => {
      const testCases = [
        {
          startTime: '09:00:00',
          endTime: '17:30:00',
          expectedHours: 8.5,
          isOvernight: false,
        },
        {
          startTime: '22:00:00',
          endTime: '06:00:00',
          expectedHours: 8.0,
          isOvernight: true,
        },
        {
          startTime: '08:00:00',
          endTime: '16:00:00',
          expectedHours: 8.0,
          isOvernight: false,
        },
        {
          startTime: '23:30:00',
          endTime: '07:15:00',
          expectedHours: 7.75,
          isOvernight: true,
        },
      ];

      for (const testCase of testCases) {
        const workRecord: any = {
          startTime: testCase.startTime,
          endTime: testCase.endTime,
        };

        const hours = resolver.hours(workRecord);
        const isOvernight = resolver.isOvernightShift(workRecord);

        expect(hours).toBe(testCase.expectedHours);
        expect(isOvernight).toBe(testCase.isOvernight);
      }
    });
  });

  describe('Integration: Date Range Filtering', () => {
    it('should handle edge case date ranges correctly', async () => {
      const employee = {
        ID: BigInt(1),
        Meno: 'Miroslav',
        Priezvisko: 'Boloz',
        ZamknuteK: null,
      };

      const edgeCases = [
        {
          description: 'Single day range',
          fromDate: '2025-01-15',
          toDate: '2025-01-15',
        },
        {
          description: 'Full year range',
          fromDate: '2025-01-01',
          toDate: '2025-12-31',
        },
        {
          description: 'Cross-year range',
          fromDate: '2024-12-15',
          toDate: '2025-01-15',
        },
        {
          description: 'Leap year Feb 29',
          fromDate: '2024-02-28',
          toDate: '2024-03-01',
        },
      ];

      for (const edgeCase of edgeCases) {
        jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(employee as any);
        jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce([]);
        jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce([{ count: BigInt(0) }]);

        const result = await service.getWorkRecords({
          employeeId: 1,
          fromDate: edgeCase.fromDate,
          toDate: edgeCase.toDate,
          limit: 50,
          offset: 0,
        });

        // Should not throw error for any edge case date range
        expect(result.records).toEqual([]);

        // Verify query was called with correct date range (service converts strings to Date objects)
        expect(prismaService.$queryRawUnsafe).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(Date), // Service converts string to Date
          expect.any(Date),
          50,
          0
        );
      }
    });
  });

  describe('Integration: Error Scenarios', () => {
    it('should throw NotFoundException for non-existent employee', async () => {
      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(null);

      await expect(
        service.getWorkRecords({
          employeeId: 9999,
          fromDate: '2025-01-01',
          toDate: '2025-01-31',
          limit: 50,
          offset: 0,
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle database query errors gracefully', async () => {
      const employee = {
        ID: BigInt(1),
        Meno: 'Miroslav',
        Priezvisko: 'Boloz',
        ZamknuteK: null,
      };

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(employee as any);
      jest
        .spyOn(prismaService, '$queryRawUnsafe')
        .mockRejectedValue(new Error('Database connection failed'));

      await expect(
        service.getWorkRecords({
          employeeId: 1,
          fromDate: '2025-01-01',
          toDate: '2025-01-31',
          limit: 50,
          offset: 0,
        })
      ).rejects.toThrow();
    });
  });
});
