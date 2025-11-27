// backend/src/balances/balances.resolver.ts
import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { BalancesService } from './balances.service';
import { Balance } from './entities/balance.entity';

@Resolver(() => Balance)
export class BalancesResolver {
  constructor(private readonly balancesService: BalancesService) {}

  @Query(() => Balance, {
    name: 'employeeBalances',
    description: 'Retrieves the remaining balances for vacation, doctor visits, and accompanying duties for a specific employee and year.',
  })
  async getEmployeeBalances(
    @Args('employeeId', { type: () => GraphQLBigInt, description: 'The ID of the employee' }) employeeId: bigint,
    @Args('year', { type: () => Int, description: 'The year for which to retrieve balances' }) year: number,
  ): Promise<Balance> {
    return this.balancesService.getBalances(employeeId, year);
  }
}
