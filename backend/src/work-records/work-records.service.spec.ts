import { Test, TestingModule } from '@nestjs/testing';
import { WorkRecordsService } from './work-records.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkRecordsInput } from './dto/work-records.input';
import { NotFoundException } from '@nestjs/common';

describe('WorkRecordsService', () => {
  let service: WorkRecordsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkRecordsService,
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
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWorkRecords', () => {
    it('should fetch work records with valid employeeId and date range', async () => {
      const input: WorkRecordsInput = {
        employeeId: 1,
        fromDate: '2025-01-01',
        toDate: '2025-01-31',
        limit: 50,
        offset: 0,
      };

      const mockEmployee = {
        ID: BigInt(1),
        Meno: 'Miroslav',
        Priezvisko: 'Boloz',
        ZamknuteK: new Date('2025-01-15'),
      };

      // Mock data structure matches the flattened SQL query result
      const mockRecords = [
        {
          ID: BigInt(1),
          StartDate: new Date('2025-01-10'),
          CinnostTypID: BigInt(1),
          ProjectID: BigInt(1),
          HourTypeID: BigInt(1),
          HourTypesID: BigInt(5),
          StartTime: '09:00:00',
          EndTime: '17:30:00',
          Description: 'Development work',
          km: 0,
          Lock: false,
          DlhodobaSC: false,
          CinnostTyp_Alias: 'Prítomný v práci',
          Projects_Number: 'PRJ-001',
          HourType_HourType: 'Produktívne',
          HourTypes_HourType: 'Programovanie',
        },
      ];

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(mockEmployee as any);
      jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce(mockRecords as any);
      jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce([{ count: BigInt(1) }] as any);

      const result = await service.getWorkRecords(input);

      expect(result.records).toHaveLength(1);
      expect(result.records[0].id).toBe('1');
      expect(result.records[0].absenceType).toBe('Prítomný v práci');
      expect(result.records[0].project).toBe('PRJ-001');
      expect(result.totalCount).toBe(1);
      expect(result.hasMore).toBe(false);
    });

    it('should construct dynamic table name correctly', async () => {
      const input: WorkRecordsInput = {
        employeeId: 2,
        fromDate: '2025-01-01',
        toDate: '2025-01-31',
        limit: 50,
        offset: 0,
      };

      const mockEmployee = {
        ID: BigInt(2),
        Meno: 'Anna',
        Priezvisko: 'Lovasova',
        ZamknuteK: null,
      };

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(mockEmployee as any);
      jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce([]);
      jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce([{ count: BigInt(0) }]);

      await service.getWorkRecords(input);

      // Verify dynamic table name was used in query
      expect(prismaService.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('t_Anna_Lovasova'),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );
    });

    it('should handle NULL values in LEFT JOINed fields for absence records', async () => {
      const input: WorkRecordsInput = {
        employeeId: 1,
        fromDate: '2025-01-01',
        toDate: '2025-01-31',
        limit: 50,
        offset: 0,
      };

      const mockEmployee = {
        ID: BigInt(1),
        Meno: 'Miroslav',
        Priezvisko: 'Boloz',
        ZamknuteK: null,
      };

      // Absence record with NULL ProjectID, HourTypeID, HourTypesID
      const mockRecords = [
        {
          ID: BigInt(2),
          StartDate: new Date('2025-01-20'),
          CinnostTypID: BigInt(4),
          ProjectID: null,
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
      ];

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(mockEmployee as any);
      jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce(mockRecords as any);
      jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce([{ count: BigInt(1) }] as any);

      const result = await service.getWorkRecords(input);

      expect(result.records).toHaveLength(1);
      expect(result.records[0].absenceType).toBe('Dovolenka');
      expect(result.records[0].project).toBeNull();
      expect(result.records[0].productivityType).toBeNull();
      expect(result.records[0].workType).toBeNull();
    });

    it('should calculate pagination correctly with hasMore flag', async () => {
      const input: WorkRecordsInput = {
        employeeId: 1,
        fromDate: '2025-01-01',
        toDate: '2025-01-31',
        limit: 50,
        offset: 0,
      };

      const mockEmployee = {
        ID: BigInt(1),
        Meno: 'Miroslav',
        Priezvisko: 'Boloz',
        ZamknuteK: null,
      };

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(mockEmployee as any);
      jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce([]);
      jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce([{ count: BigInt(100) }] as any);

      const result = await service.getWorkRecords(input);

      expect(result.totalCount).toBe(100);
      expect(result.hasMore).toBe(true); // 0 + 50 < 100
    });

    it('should compute lock status from Lock flag', async () => {
      const input: WorkRecordsInput = {
        employeeId: 1,
        fromDate: '2025-01-01',
        toDate: '2025-01-31',
        limit: 50,
        offset: 0,
      };

      const mockEmployee = {
        ID: BigInt(1),
        Meno: 'Miroslav',
        Priezvisko: 'Boloz',
        ZamknuteK: null,
      };

      const mockRecords = [
        {
          ID: BigInt(1),
          StartDate: new Date('2025-01-10'),
          CinnostTypID: BigInt(1),
          ProjectID: BigInt(1),
          HourTypeID: BigInt(1),
          HourTypesID: BigInt(5),
          StartTime: '09:00:00',
          EndTime: '17:30:00',
          Description: 'Development work',
          km: 0,
          Lock: true, // Explicitly locked
          DlhodobaSC: false,
          CinnostTyp_Alias: 'Prítomný v práci',
          Projects_Number: 'PRJ-001',
          HourType_HourType: 'Produktívne',
          HourTypes_HourType: 'Programovanie',
        },
      ];

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(mockEmployee as any);
      jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce(mockRecords as any);
      jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce([{ count: BigInt(1) }] as any);

      const result = await service.getWorkRecords(input);

      expect(result.records[0].isLocked).toBe(true);
    });

    it('should compute lock status from ZamknuteK date', async () => {
      const input: WorkRecordsInput = {
        employeeId: 1,
        fromDate: '2025-01-01',
        toDate: '2025-01-31',
        limit: 50,
        offset: 0,
      };

      const mockEmployee = {
        ID: BigInt(1),
        Meno: 'Miroslav',
        Priezvisko: 'Boloz',
        ZamknuteK: new Date('2025-01-20'), // Locked until Jan 20
      };

      const mockRecords = [
        {
          ID: BigInt(1),
          StartDate: new Date('2025-01-10'), // Before ZamknuteK
          CinnostTypID: BigInt(1),
          ProjectID: BigInt(1),
          HourTypeID: BigInt(1),
          HourTypesID: BigInt(5),
          StartTime: '09:00:00',
          EndTime: '17:30:00',
          Description: 'Development work',
          km: 0,
          Lock: false,
          DlhodobaSC: false,
          CinnostTyp_Alias: 'Prítomný v práci',
          Projects_Number: 'PRJ-001',
          HourType_HourType: 'Produktívne',
          HourTypes_HourType: 'Programovanie',
        },
      ];

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(mockEmployee as any);
      jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce(mockRecords as any);
      jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce([{ count: BigInt(1) }] as any);

      const result = await service.getWorkRecords(input);

      expect(result.records[0].isLocked).toBe(true); // StartDate <= ZamknuteK
    });

    it('should throw NotFoundException if employee not found', async () => {
      const input: WorkRecordsInput = {
        employeeId: 999,
        fromDate: '2025-01-01',
        toDate: '2025-01-31',
        limit: 50,
        offset: 0,
      };

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(null);

      await expect(service.getWorkRecords(input)).rejects.toThrow(NotFoundException);
      await expect(service.getWorkRecords(input)).rejects.toThrow('Employee with ID 999 not found');
    });
  });
});
