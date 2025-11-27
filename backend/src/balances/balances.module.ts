// backend/src/balances/balances.module.ts
import { Module } from '@nestjs/common';
import { BalancesService } from './balances.service';
import { BalancesResolver } from './balances.resolver';
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule

@Module({
  imports: [PrismaModule], // Add PrismaModule to imports
  providers: [BalancesResolver, BalancesService],
  exports: [BalancesService], // Export BalancesService if it needs to be used by other modules
})
export class BalancesModule {}
