import { Test, TestingModule } from '@nestjs/testing';
import { HealthResolver } from './health.resolver';
import { HealthService } from './health.service';

describe('HealthResolver', () => {
  let resolver: HealthResolver;
  let healthService: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthResolver,
        {
          provide: HealthService,
          useValue: {
            checkHealth: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<HealthResolver>(HealthResolver);
    healthService = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should return health status from GraphQL query', async () => {
    const mockHealth = {
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    };
    jest.spyOn(healthService, 'checkHealth').mockResolvedValue(mockHealth);

    const result = await resolver.health();

    expect(result).toEqual(mockHealth);
    expect(result.status).toBe('ok');
    expect(result.database).toBe('connected');
  });

  it('should propagate error when health check fails', async () => {
    jest
      .spyOn(healthService, 'checkHealth')
      .mockRejectedValue(new Error('Database connection failed'));

    await expect(resolver.health()).rejects.toThrow(
      'Database connection failed',
    );
  });
});
