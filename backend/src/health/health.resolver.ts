import { Resolver, Query } from '@nestjs/graphql';
import { HealthService } from './health.service';
import { HealthDto } from './dto/health.dto';

@Resolver(() => HealthDto)
export class HealthResolver {
  constructor(private readonly healthService: HealthService) {}

  @Query(() => HealthDto, { name: 'health' })
  async health(): Promise<HealthDto> {
    return this.healthService.checkHealth();
  }
}
