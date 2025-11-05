import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesResolver } from './employees.resolver';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';

describe('EmployeesResolver', () => {
  let resolver: EmployeesResolver;
  let service: EmployeesService;

  const mockEmployeesService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesResolver,
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
      ],
    }).compile();

    resolver = module.get<EmployeesResolver>(EmployeesResolver);
    service = module.get<EmployeesService>(EmployeesService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('employees query', () => {
    it('should return array of employees', async () => {
      const mockEmployees: Employee[] = [
        {
          id: '1',
          fullName: 'Anna Lovasova',
          vacationDays: 15.5,
          isAdmin: true,
          employeeType: 'Zamestnanec',
          lastRecordDate: '2025-10-15T00:00:00.000Z',
          lockedUntil: '2025-11-05T00:00:00.000Z',
          titlePrefix: 'Ing.',
          titleSuffix: 'PhD.',
        },
      ];

      mockEmployeesService.findAll.mockResolvedValue(mockEmployees);

      const result = await resolver.employees();

      expect(result).toEqual(mockEmployees);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });
});
