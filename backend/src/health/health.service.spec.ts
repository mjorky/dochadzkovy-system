import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthService', () => {
  let service: HealthService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: {
            verzia: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return health status when database is connected', async () => {
    jest.spyOn(prismaService.verzia, 'findMany').mockResolvedValue([]);

    const result = await service.checkHealth();

    expect(result.status).toBe('ok');
    expect(result.database).toBe('connected');
    expect(result.timestamp).toBeDefined();
    expect(typeof result.timestamp).toBe('string');
  });

  it('should throw error when database connection fails', async () => {
    jest
      .spyOn(prismaService.verzia, 'findMany')
      .mockRejectedValue(new Error('Connection failed'));

    await expect(service.checkHealth()).rejects.toThrow(
      'Database connection failed',
    );
  });

  it('should return valid ISO8601 timestamp', async () => {
    jest.spyOn(prismaService.verzia, 'findMany').mockResolvedValue([]);

    const result = await service.checkHealth();
    const timestamp = result.timestamp;

    expect(timestamp).toBeDefined();
    // Verify ISO8601 format
    const date = new Date(timestamp);
    expect(date.toISOString()).toBe(timestamp);
  });
});
