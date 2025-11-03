import { Controller, Get, HttpStatus, HttpException } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth() {
    try {
      const health = await this.healthService.checkHealth();
      return health;
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          database: 'disconnected',
          message: error.message || 'Database health check failed',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
