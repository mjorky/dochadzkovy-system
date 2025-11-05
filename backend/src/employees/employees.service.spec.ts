import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesService } from './employees.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    zamestnanci: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of employees with computed fullName', async () => {
      const mockEmployees = [
        {
          ID: BigInt(1),
          Meno: 'Anna',
          Priezvisko: 'Lovasova',
          TitulPred: 'Ing.',
          TitulZa: 'PhD.',
          Dovolenka: 15.5,
          IsAdmin: true,
          TypZamestnanca: 'Zamestnanec',
          PoslednyZaznam: new Date('2025-10-15'),
          ZamknuteK: new Date('2025-11-05'),
          ZamestnanecTyp: {
            Typ: 'Zamestnanec',
            FondPracovnehoCasu: 40,
          },
        },
      ];

      mockPrismaService.zamestnanci.findMany.mockResolvedValue(mockEmployees);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].fullName).toBe('Anna Lovasova');
      expect(result[0].id).toBe('1');
      expect(result[0].employeeType).toBe('Zamestnanec');
    });

    it('should resolve employee type from ZamestnanecTyp FK', async () => {
      const mockEmployees = [
        {
          ID: BigInt(2),
          Meno: 'John',
          Priezvisko: 'Doe',
          TitulPred: null,
          TitulZa: null,
          Dovolenka: 20,
          IsAdmin: false,
          TypZamestnanca: 'SZCO',
          PoslednyZaznam: null,
          ZamknuteK: null,
          ZamestnanecTyp: {
            Typ: 'SZCO',
            FondPracovnehoCasu: 30,
          },
        },
      ];

      mockPrismaService.zamestnanci.findMany.mockResolvedValue(mockEmployees);

      const result = await service.findAll();

      expect(result[0].employeeType).toBe('SZCO');
      expect(prismaService.zamestnanci.findMany).toHaveBeenCalledWith({
        include: {
          ZamestnanecTyp: true,
        },
      });
    });

    it('should handle null dates gracefully', async () => {
      const mockEmployees = [
        {
          ID: BigInt(3),
          Meno: 'Test',
          Priezvisko: 'User',
          TitulPred: null,
          TitulZa: null,
          Dovolenka: 10,
          IsAdmin: false,
          TypZamestnanca: 'Student',
          PoslednyZaznam: null,
          ZamknuteK: null,
          ZamestnanecTyp: {
            Typ: 'Student',
            FondPracovnehoCasu: 20,
          },
        },
      ];

      mockPrismaService.zamestnanci.findMany.mockResolvedValue(mockEmployees);

      const result = await service.findAll();

      expect(result[0].lastRecordDate).toBeNull();
      expect(result[0].lockedUntil).toBeNull();
    });

    it('should throw error when database query fails', async () => {
      mockPrismaService.zamestnanci.findMany.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.findAll()).rejects.toThrow(
        'Failed to fetch employees from database',
      );
    });
  });
});
