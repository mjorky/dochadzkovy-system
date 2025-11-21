import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesService } from './employees.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeInput } from './dto/create-employee.input';
import { UpdateEmployeeInput } from './dto/update-employee.input';
import { Logger } from '@nestjs/common';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    zamestnanci: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    zamestnanecTyp: {
      findFirst: jest.fn(),
    },
    $queryRawUnsafe: jest.fn(),
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
    prisma = module.get<PrismaService>(PrismaService);
    
    jest.clearAllMocks(); // Clear mocks between tests
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an employee and their work record table', async () => {
      const input: CreateEmployeeInput = {
        firstName: 'John',
        lastName: 'Doe',
        employmentType: 'Zamestnanec',
        vacationDays: 20,
        isAdmin: false,
      };

      const mockType = { ID: 1n, Typ: 'Zamestnanec' };
      const mockEmployee = {
        ID: 1n,
        Meno: 'John',
        Priezvisko: 'Doe',
        TypZamestnanca: 1n,
        Dovolenka: 20,
        IsAdmin: false,
        ZamestnanecTyp: mockType,
      };

      mockPrismaService.zamestnanecTyp.findFirst.mockResolvedValue(mockType);
      mockPrismaService.zamestnanci.create.mockResolvedValue(mockEmployee);
      mockPrismaService.$queryRawUnsafe.mockResolvedValue(undefined);
      mockPrismaService.$queryRaw.mockResolvedValue([]); // Mock no tables found initially

      const result = await service.create(input);

      expect(prisma.zamestnanecTyp.findFirst).toHaveBeenCalledWith({
        where: { Typ: 'Zamestnanec' },
      });
      expect(prisma.zamestnanci.create).toHaveBeenCalled();
      // Check if table creation query was called
      expect(prisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE "t_John_Doe"'),
      );
      // Check if view refresh was called
      expect(prisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('CREATE OR REPLACE VIEW "AllTData"'),
      );
      expect(result.fullName).toBe('John Doe');
    });
  });

  describe('update', () => {
    it('should update employee details', async () => {
      const input: UpdateEmployeeInput = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        vacationDays: 25,
      };

      const mockType = { ID: 1n, Typ: 'Zamestnanec' };
      const existingEmployee = {
        ID: 1n,
        Meno: 'John',
        Priezvisko: 'Doe',
        TypZamestnanca: 1n,
        ZamestnanecTyp: mockType,
      };
      
      const updatedEmployee = {
        ...existingEmployee,
        Dovolenka: 25,
      };

      mockPrismaService.zamestnanci.findUnique.mockResolvedValue(existingEmployee);
      mockPrismaService.zamestnanecTyp.findFirst.mockResolvedValue(mockType); // Only if type changes
      mockPrismaService.zamestnanci.update.mockResolvedValue(updatedEmployee);

      const result = await service.update(input);

      expect(prisma.zamestnanci.update).toHaveBeenCalled();
      expect(result.vacationDays).toBe(25);
      // Name didn't change, so table rename shouldn't happen
      expect(prisma.$queryRawUnsafe).not.toHaveBeenCalledWith(
        expect.stringContaining('ALTER TABLE'),
      );
    });

    it('should rename table when name changes', async () => {
        const input: UpdateEmployeeInput = {
          id: '1',
          firstName: 'Johnny',
          lastName: 'Doe',
        };
  
        const mockType = { ID: 1n, Typ: 'Zamestnanec' };
        const existingEmployee = {
          ID: 1n,
          Meno: 'John',
          Priezvisko: 'Doe',
          TypZamestnanca: 1n,
          ZamestnanecTyp: mockType,
        };
        
        const updatedEmployee = {
            ...existingEmployee,
            Meno: 'Johnny',
        };
  
        mockPrismaService.zamestnanci.findUnique.mockResolvedValue(existingEmployee);
        mockPrismaService.zamestnanci.update.mockResolvedValue(updatedEmployee);
        mockPrismaService.$queryRawUnsafe.mockResolvedValue(undefined);
        mockPrismaService.$queryRaw.mockResolvedValue([]);
  
        const result = await service.update(input);
  
        expect(prisma.zamestnanci.update).toHaveBeenCalled();
        expect(prisma.$queryRawUnsafe).toHaveBeenCalledWith(
            expect.stringContaining('ALTER TABLE "t_John_Doe" RENAME TO "t_Johnny_Doe"')
        );
         expect(prisma.$queryRawUnsafe).toHaveBeenCalledWith(
          expect.stringContaining('CREATE OR REPLACE VIEW "AllTData"'),
        );
        expect(result.fullName).toBe('Johnny Doe');
      });
  });

  describe('delete', () => {
    it('should delete employee and drop their table', async () => {
      const id = '1';
      const mockType = { ID: 1n, Typ: 'Zamestnanec' };
      const existingEmployee = {
        ID: 1n,
        Meno: 'John',
        Priezvisko: 'Doe',
        TypZamestnanca: 1n,
        ZamestnanecTyp: mockType,
      };

      mockPrismaService.zamestnanci.findUnique.mockResolvedValue(existingEmployee);
      mockPrismaService.zamestnanci.delete.mockResolvedValue(existingEmployee);
      mockPrismaService.$queryRawUnsafe.mockResolvedValue(undefined);
      mockPrismaService.$queryRaw.mockResolvedValue([]);

      const result = await service.delete(id);

      expect(prisma.zamestnanci.delete).toHaveBeenCalledWith({
        where: { ID: 1n },
      });
      expect(prisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('DROP TABLE IF EXISTS "t_John_Doe"'),
      );
      expect(prisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('CREATE OR REPLACE VIEW "AllTData"'),
      );
      expect(result).toBe(true);
    });
  });
});
