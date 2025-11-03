import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HealthDto } from './dto/health.dto';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async checkHealth(): Promise<HealthDto> {
    try {
      // Simple database query to verify connectivity
      await this.prisma.verzia.findMany({ take: 1 });

      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Database connection failed', error);
      throw new Error('Database connection failed');
    }
  }
}
