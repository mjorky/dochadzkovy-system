import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            checkHealth: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthService = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return 200 with health status when database is connected', async () => {
    const mockHealth = {
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    };
    jest.spyOn(healthService, 'checkHealth').mockResolvedValue(mockHealth);

    const result = await controller.getHealth();

    expect(result).toEqual(mockHealth);
    expect(result.status).toBe('ok');
    expect(result.database).toBe('connected');
  });

  it('should return 503 when database connection fails', async () => {
    jest
      .spyOn(healthService, 'checkHealth')
      .mockRejectedValue(new Error('Database connection failed'));

    try {
      await controller.getHealth();
      fail('Should have thrown HttpException');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      const response = error.getResponse() as any;
      expect(response.status).toBe('error');
      expect(response.database).toBe('disconnected');
      expect(response.message).toBeDefined();
      expect(response.timestamp).toBeDefined();
    }
  });
});
