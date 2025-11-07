import { Test, TestingModule } from '@nestjs/testing';
import { WorkRecordsService } from './work-records.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkRecordsInput } from './dto/work-records.input';
import { CreateWorkRecordInput } from './dto/create-work-record.input';
import { UpdateWorkRecordInput } from './dto/update-work-record.input';
import { DeleteWorkRecordInput } from './dto/delete-work-record.input';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

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
    jest.clearAllMocks();
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

  describe('createWorkRecord', () => {
    it('should create a work record successfully', async () => {
      const input: CreateWorkRecordInput = {
        employeeId: 1,
        date: '2025-02-01',
        absenceTypeId: 1,
        projectId: 100,
        productivityTypeId: 1,
        workTypeId: 5,
        startTime: '08:00',
        endTime: '16:30',
        description: 'Development work',
        km: 0,
        isTripFlag: false,
      };

      const mockEmployee = {
        ID: BigInt(1),
        Meno: 'Miroslav',
        Priezvisko: 'Boloz',
        ZamknuteK: new Date('2025-01-15'), // Date is after this, so not locked
      };

      const mockInsertResult = [{ ID: BigInt(123) }];

      const mockCreatedRecord = {
        ID: BigInt(123),
        StartDate: new Date('2025-02-01'),
        CinnostTypID: BigInt(1),
        ProjectID: BigInt(100),
        HourTypeID: BigInt(1),
        HourTypesID: BigInt(5),
        StartTime: '08:00:00',
        EndTime: '16:30:00',
        Description: 'Development work',
        km: 0,
        Lock: false,
        DlhodobaSC: false,
        CinnostTyp_Alias: 'Prítomný v práci',
        Projects_Number: 'PRJ-100',
        HourType_HourType: 'Produktívne',
        HourTypes_HourType: 'Programovanie',
      };

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(mockEmployee as any);
      jest.spyOn(prismaService, '$queryRawUnsafe')
        .mockResolvedValueOnce(mockInsertResult as any) // INSERT
        .mockResolvedValueOnce([mockCreatedRecord] as any); // SELECT

      const result = await service.createWorkRecord(input);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Work record created successfully');
      expect(result.record).toBeDefined();
      expect(result.record?.id).toBe('123');
      expect(result.record?.hours).toBe(8.5);
      expect(result.record?.isOvernightShift).toBe(false);
      expect(result.record?.isLocked).toBe(false);
    });

    it('should prevent creating work record on locked date', async () => {
      const input: CreateWorkRecordInput = {
        employeeId: 1,
        date: '2025-01-10', // Before ZamknuteK
        absenceTypeId: 1,
        projectId: 100,
        productivityTypeId: 1,
        workTypeId: 5,
        startTime: '08:00',
        endTime: '16:00',
      };

      const mockEmployee = {
        ID: BigInt(1),
        Meno: 'Miroslav',
        Priezvisko: 'Boloz',
        ZamknuteK: new Date('2025-01-15'), // Date is before this, so locked
      };

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(mockEmployee as any);

      await expect(service.createWorkRecord(input)).rejects.toThrow(ForbiddenException);
      await expect(service.createWorkRecord(input)).rejects.toThrow('Cannot create record for locked date');
    });

    it('should handle overnight shift correctly', async () => {
      const input: CreateWorkRecordInput = {
        employeeId: 1,
        date: '2025-02-01',
        absenceTypeId: 1,
        projectId: 100,
        productivityTypeId: 1,
        workTypeId: 5,
        startTime: '22:00',
        endTime: '06:00', // Overnight shift
      };

      const mockEmployee = {
        ID: BigInt(1),
        Meno: 'Miroslav',
        Priezvisko: 'Boloz',
        ZamknuteK: null,
      };

      const mockInsertResult = [{ ID: BigInt(124) }];

      const mockCreatedRecord = {
        ID: BigInt(124),
        StartDate: new Date('2025-02-01'),
        CinnostTypID: BigInt(1),
        ProjectID: BigInt(100),
        HourTypeID: BigInt(1),
        HourTypesID: BigInt(5),
        StartTime: '22:00:00',
        EndTime: '06:00:00',
        Description: null,
        km: 0,
        Lock: false,
        DlhodobaSC: false,
        CinnostTyp_Alias: 'Prítomný v práci',
        Projects_Number: 'PRJ-100',
        HourType_HourType: 'Produktívne',
        HourTypes_HourType: 'Programovanie',
      };

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(mockEmployee as any);
      jest.spyOn(prismaService, '$queryRawUnsafe')
        .mockResolvedValueOnce(mockInsertResult as any)
        .mockResolvedValueOnce([mockCreatedRecord] as any);

      const result = await service.createWorkRecord(input);

      expect(result.success).toBe(true);
      expect(result.record?.hours).toBe(8.0); // 22:00 to 06:00 = 8 hours
      expect(result.record?.isOvernightShift).toBe(true);
    });

    it('should throw NotFoundException if employee not found', async () => {
      const input: CreateWorkRecordInput = {
        employeeId: 999,
        date: '2025-02-01',
        absenceTypeId: 1,
        projectId: 100,
        productivityTypeId: 1,
        workTypeId: 5,
        startTime: '08:00',
        endTime: '16:00',
      };

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(null);

      await expect(service.createWorkRecord(input)).rejects.toThrow(NotFoundException);
      await expect(service.createWorkRecord(input)).rejects.toThrow('Employee with ID 999 not found');
    });

    it('should accept both HH:MM and HH:MM:SS time formats', async () => {
      const input: CreateWorkRecordInput = {
        employeeId: 1,
        date: '2025-02-01',
        absenceTypeId: 1,
        projectId: 100,
        productivityTypeId: 1,
        workTypeId: 5,
        startTime: '08:00', // HH:MM format
        endTime: '16:00',
      };

      const mockEmployee = {
        ID: BigInt(1),
        Meno: 'Miroslav',
        Priezvisko: 'Boloz',
        ZamknuteK: null,
      };

      const mockInsertResult = [{ ID: BigInt(125) }];
      const mockCreatedRecord = {
        ID: BigInt(125),
        StartDate: new Date('2025-02-01'),
        CinnostTypID: BigInt(1),
        ProjectID: BigInt(100),
        HourTypeID: BigInt(1),
        HourTypesID: BigInt(5),
        StartTime: '08:00:00',
        EndTime: '16:00:00',
        Description: null,
        km: 0,
        Lock: false,
        DlhodobaSC: false,
        CinnostTyp_Alias: 'Prítomný v práci',
        Projects_Number: 'PRJ-100',
        HourType_HourType: 'Produktívne',
        HourTypes_HourType: 'Programovanie',
      };

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(mockEmployee as any);
      jest.spyOn(prismaService, '$queryRawUnsafe')
        .mockResolvedValueOnce(mockInsertResult as any)
        .mockResolvedValueOnce([mockCreatedRecord] as any);

      const result = await service.createWorkRecord(input);

      expect(result.success).toBe(true);
      expect(result.record?.startTime).toBe('08:00:00');
      expect(result.record?.endTime).toBe('16:00:00');
    });
  });

  describe('updateWorkRecord', () => {
    it('should update a work record successfully', async () => {
      const input: UpdateWorkRecordInput = {
        employeeId: 1,
        recordId: '123',
        description: 'Updated description',
        km: 50,
      };

      const mockEmployee = {
        ID: BigInt(1),
        Meno: 'Miroslav',
        Priezvisko: 'Boloz',
        ZamknuteK: new Date('2025-01-15'),
      };

      const mockExistingRecord = {
        ID: BigInt(123),
        StartDate: new Date('2025-02-01'), // After ZamknuteK, so not locked
        Lock: false,
      };

      const mockUpdatedRecord = {
        ID: BigInt(123),
        StartDate: new Date('2025-02-01'),
        CinnostTypID: BigInt(1),
        ProjectID: BigInt(100),
        HourTypeID: BigInt(1),
        HourTypesID: BigInt(5),
        StartTime: '08:00:00',
        EndTime: '16:00:00',
        Description: 'Updated description',
        km: 50,
        Lock: false,
        DlhodobaSC: false,
        CinnostTyp_Alias: 'Prítomný v práci',
        Projects_Number: 'PRJ-100',
        HourType_HourType: 'Produktívne',
        HourTypes_HourType: 'Programovanie',
      };

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(mockEmployee as any);
      jest.spyOn(prismaService, '$queryRawUnsafe')
        .mockResolvedValueOnce([mockExistingRecord] as any) // Fetch existing
        .mockResolvedValueOnce(undefined as any) // UPDATE (no return)
        .mockResolvedValueOnce([mockUpdatedRecord] as any); // Fetch updated

      const result = await service.updateWorkRecord(input);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Work record updated successfully');
      expect(result.record?.description).toBe('Updated description');
      expect(result.record?.km).toBe(50);
    });

    it('should prevent updating a locked record (Lock flag)', async () => {
      const input: UpdateWorkRecordInput = {
        employeeId: 1,
        recordId: '123',
        description: 'Attempted update',
      };

      const mockEmployee = {
        ID: BigInt(1),
        Meno: 'Miroslav',
        Priezvisko: 'Boloz',
        ZamknuteK: null,
      };

      const mockExistingRecord = {
        ID: BigInt(123),
        StartDate: new Date('2025-02-01'),
        Lock: true, // Explicitly locked
      };

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(mockEmployee as any);
      jest.spyOn(prismaService, '$queryRawUnsafe')
        .mockResolvedValue([mockExistingRecord] as any);

      await expect(service.updateWorkRecord(input)).rejects.toThrow(ForbiddenException);
      await expect(service.updateWorkRecord(input)).rejects.toThrow('Cannot edit locked record');
    });

    it('should prevent updating a record locked by ZamknuteK', async () => {
      const input: UpdateWorkRecordInput = {
        employeeId: 1,
        recordId: '123',
        description: 'Attempted update',
      };

      const mockEmployee = {
        ID: BigInt(1),
        Meno: 'Miroslav',
        Priezvisko: 'Boloz',
        ZamknuteK: new Date('2025-01-20'), // Locked until Jan 20
      };

      const mockExistingRecord = {
        ID: BigInt(123),
        StartDate: new Date('2025-01-10'), // Before ZamknuteK, so locked
        Lock: false,
      };

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(mockEmployee as any);
      jest.spyOn(prismaService, '$queryRawUnsafe')
        .mockResolvedValue([mockExistingRecord] as any);

      await expect(service.updateWorkRecord(input)).rejects.toThrow(ForbiddenException);
      await expect(service.updateWorkRecord(input)).rejects.toThrow('Cannot edit locked record');
    });

    it('should throw NotFoundException if employee not found', async () => {
      const input: UpdateWorkRecordInput = {
        employeeId: 999,
        recordId: '123',
        description: 'Test',
      };

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(null);

      await expect(service.updateWorkRecord(input)).rejects.toThrow(NotFoundException);
      await expect(service.updateWorkRecord(input)).rejects.toThrow('Employee with ID 999 not found');
    });

    it('should throw NotFoundException if record not found', async () => {
      const input: UpdateWorkRecordInput = {
        employeeId: 1,
        recordId: '999',
        description: 'Test',
      };

      const mockEmployee = {
        ID: BigInt(1),
        Meno: 'Miroslav',
        Priezvisko: 'Boloz',
        ZamknuteK: null,
      };

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(mockEmployee as any);
      jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce([] as any);

      await expect(service.updateWorkRecord(input)).rejects.toThrow(NotFoundException);
      await expect(service.updateWorkRecord(input)).rejects.toThrow('Work record with ID 999 not found');
    });

    it('should throw BadRequestException if no fields to update', async () => {
      const input: UpdateWorkRecordInput = {
        employeeId: 1,
        recordId: '123',
        // No update fields provided
      };

      const mockEmployee = {
        ID: BigInt(1),
        Meno: 'Miroslav',
        Priezvisko: 'Boloz',
        ZamknuteK: null,
      };

      const mockExistingRecord = {
        ID: BigInt(123),
        StartDate: new Date('2025-02-01'),
        Lock: false,
      };

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(mockEmployee as any);
      jest.spyOn(prismaService, '$queryRawUnsafe')
        .mockResolvedValue([mockExistingRecord] as any);

      await expect(service.updateWorkRecord(input)).rejects.toThrow(BadRequestException);
      await expect(service.updateWorkRecord(input)).rejects.toThrow('No fields to update');
    });

    it('should handle partial updates (only some fields)', async () => {
      const input: UpdateWorkRecordInput = {
        employeeId: 1,
        recordId: '123',
        startTime: '09:00',
        endTime: '17:00',
      };

      const mockEmployee = {
        ID: BigInt(1),
        Meno: 'Miroslav',
        Priezvisko: 'Boloz',
        ZamknuteK: null,
      };

      const mockExistingRecord = {
        ID: BigInt(123),
        StartDate: new Date('2025-02-01'),
        Lock: false,
      };

      const mockUpdatedRecord = {
        ID: BigInt(123),
        StartDate: new Date('2025-02-01'),
        CinnostTypID: BigInt(1),
        ProjectID: BigInt(100),
        HourTypeID: BigInt(1),
        HourTypesID: BigInt(5),
        StartTime: '09:00:00',
        EndTime: '17:00:00',
        Description: 'Original description',
        km: 0,
        Lock: false,
        DlhodobaSC: false,
        CinnostTyp_Alias: 'Prítomný v práci',
        Projects_Number: 'PRJ-100',
        HourType_HourType: 'Produktívne',
        HourTypes_HourType: 'Programovanie',
      };

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(mockEmployee as any);
      jest.spyOn(prismaService, '$queryRawUnsafe')
        .mockResolvedValueOnce([mockExistingRecord] as any)
        .mockResolvedValueOnce(undefined as any)
        .mockResolvedValueOnce([mockUpdatedRecord] as any);

      const result = await service.updateWorkRecord(input);

      expect(result.success).toBe(true);
      expect(result.record?.startTime).toBe('09:00:00');
      expect(result.record?.endTime).toBe('17:00:00');
      expect(result.record?.hours).toBe(8.0);
    });
  });

  describe('deleteWorkRecord', () => {
    it('should delete a work record successfully', async () => {
      const input: DeleteWorkRecordInput = {
        employeeId: 1,
        recordId: '123',
      };

      const mockEmployee = {
        ID: BigInt(1),
        Meno: 'Miroslav',
        Priezvisko: 'Boloz',
        ZamknuteK: new Date('2025-01-15'),
      };

      const mockExistingRecord = {
        ID: BigInt(123),
        StartDate: new Date('2025-02-01'), // After ZamknuteK, so not locked
        Lock: false,
      };

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(mockEmployee as any);
      jest.spyOn(prismaService, '$queryRawUnsafe')
        .mockResolvedValueOnce([mockExistingRecord] as any) // Fetch existing
        .mockResolvedValueOnce(undefined as any); // DELETE (no return)

      const result = await service.deleteWorkRecord(input);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Work record deleted successfully');
      expect(result.record).toBeUndefined();
    });

    it('should prevent deleting a locked record (Lock flag)', async () => {
      const input: DeleteWorkRecordInput = {
        employeeId: 1,
        recordId: '123',
      };

      const mockEmployee = {
        ID: BigInt(1),
        Meno: 'Miroslav',
        Priezvisko: 'Boloz',
        ZamknuteK: null,
      };

      const mockExistingRecord = {
        ID: BigInt(123),
        StartDate: new Date('2025-02-01'),
        Lock: true, // Explicitly locked
      };

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(mockEmployee as any);
      jest.spyOn(prismaService, '$queryRawUnsafe')
        .mockResolvedValue([mockExistingRecord] as any);

      await expect(service.deleteWorkRecord(input)).rejects.toThrow(ForbiddenException);
      await expect(service.deleteWorkRecord(input)).rejects.toThrow('Cannot delete locked record');
    });

    it('should prevent deleting a record locked by ZamknuteK', async () => {
      const input: DeleteWorkRecordInput = {
        employeeId: 1,
        recordId: '123',
      };

      const mockEmployee = {
        ID: BigInt(1),
        Meno: 'Miroslav',
        Priezvisko: 'Boloz',
        ZamknuteK: new Date('2025-01-20'), // Locked until Jan 20
      };

      const mockExistingRecord = {
        ID: BigInt(123),
        StartDate: new Date('2025-01-10'), // Before ZamknuteK, so locked
        Lock: false,
      };

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(mockEmployee as any);
      jest.spyOn(prismaService, '$queryRawUnsafe')
        .mockResolvedValue([mockExistingRecord] as any);

      await expect(service.deleteWorkRecord(input)).rejects.toThrow(ForbiddenException);
      await expect(service.deleteWorkRecord(input)).rejects.toThrow('Cannot delete locked record');
    });

    it('should throw NotFoundException if employee not found', async () => {
      const input: DeleteWorkRecordInput = {
        employeeId: 999,
        recordId: '123',
      };

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(null);

      await expect(service.deleteWorkRecord(input)).rejects.toThrow(NotFoundException);
      await expect(service.deleteWorkRecord(input)).rejects.toThrow('Employee with ID 999 not found');
    });

    it('should throw NotFoundException if record not found', async () => {
      const input: DeleteWorkRecordInput = {
        employeeId: 1,
        recordId: '999',
      };

      const mockEmployee = {
        ID: BigInt(1),
        Meno: 'Miroslav',
        Priezvisko: 'Boloz',
        ZamknuteK: null,
      };

      jest.spyOn(prismaService.zamestnanci, 'findUnique').mockResolvedValue(mockEmployee as any);
      jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce([] as any);

      await expect(service.deleteWorkRecord(input)).rejects.toThrow(NotFoundException);
      await expect(service.deleteWorkRecord(input)).rejects.toThrow('Work record with ID 999 not found');
    });
  });
});
