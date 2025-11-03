import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
    await service.onModuleInit();
  });

  afterAll(async () => {
    await service.onModuleDestroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect to database and query Verzia table', async () => {
    const result = await service.verzia.findMany();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should be able to read from a per-user table', async () => {
    // Test querying t_Miroslav_Boloz table
    const result = await service.t_Miroslav_Boloz.findMany({
      take: 1,
    });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should be able to read from Zamestnanci table', async () => {
    const employees = await service.zamestnanci.findMany({
      take: 5,
    });
    expect(employees).toBeDefined();
    expect(Array.isArray(employees)).toBe(true);
    if (employees.length > 0) {
      expect(employees[0]).toHaveProperty('ID');
      expect(employees[0]).toHaveProperty('Meno');
      expect(employees[0]).toHaveProperty('Priezvisko');
    }
  });
});
