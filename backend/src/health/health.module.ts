import { Module } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthResolver } from './health.resolver';
import { HealthController } from './health.controller';

@Module({
  providers: [HealthService, HealthResolver],
  controllers: [HealthController],
})
export class HealthModule {}
