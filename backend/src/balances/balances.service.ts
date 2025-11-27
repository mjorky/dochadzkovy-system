// backend/src/balances/balances.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Balance } from './entities/balance.entity';
import { constructTableName } from '../work-records/utils/normalize-table-name';

@Injectable()
export class BalancesService {
  private readonly logger = new Logger(BalancesService.name);

  // Constants from C# code
  private readonly constMaxLekar = 7 * 8; // Max 7 days * 8 hours
  private readonly constMaxDoprovod = 7 * 8; // Max 7 days * 8 hours
  private readonly constMaxDoprovodZP = 10 * 8; // Max 10 days * 8 hours

  constructor(private readonly prisma: PrismaService) {}

  async getBalances(employeeId: bigint, year: number): Promise<Balance> {
    const employee = await this.prisma.zamestnanci.findUnique({
      where: { ID: employeeId },
      include: {
        ZamestnanecTyp: true, // Needed for FondPracovnehoCasu if it were used here
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    // Get CinnostTyp IDs for balance types, filtering by 'Typ' as per C# logic
    const cinnostTypes = await this.prisma.cinnostTyp.findMany({
      where: { Typ: { in: ['RD', 'Lekár', 'Doprovod', 'DoprovodZP'] } },
      select: { ID: true, Typ: true }, // Select Typ instead of Alias for consistency
    });

    const rdId = cinnostTypes.find((ct) => ct.Typ === 'RD')?.ID;
    const lekarId = cinnostTypes.find((ct) => ct.Typ === 'Lekár')?.ID;
    const doprovodId = cinnostTypes.find((ct) => ct.Typ === 'Doprovod')?.ID;
    const doprovodZpId = cinnostTypes.find((ct) => ct.Typ === 'DoprovodZP')?.ID;

    if (!rdId || !lekarId || !doprovodId || !doprovodZpId) {
        throw new NotFoundException('One or more required CinnostTyp types not found. Check CinnostTyp table data.');
    }

    const tableName = constructTableName(employee.Meno, employee.Priezvisko);

    // Function to get total hours for a specific CinnostTypID and year
    const getSummedHours = async (cinnostTypeId: bigint): Promise<number> => {
      // The C# code uses "(EndTime - StartTime)" or "(24:00:00 - StartTime)" for WorkTime.
      // We need to replicate that logic in SQL for interval subtraction.
      const result = await this.prisma.$queryRawUnsafe<
        { total_hours: number }[]
      >(
        `
        SELECT
          SUM(EXTRACT(EPOCH FROM (CASE WHEN "EndTime" = '00:00:00' THEN ('24:00:00'::interval - "StartTime"::interval) ELSE ("EndTime"::interval - "StartTime"::interval) END))) / 3600 AS total_hours
        FROM "${tableName}"
        WHERE "CinnostTypID" = $1 AND EXTRACT(YEAR FROM "StartDate") = $2
        `,
        cinnostTypeId,
        year,
      );
      return result[0]?.total_hours || 0;
    };

    const consumedRdHours = await getSummedHours(rdId);
    const consumedLekarHours = await getSummedHours(lekarId);
    const consumedDoprovodHours = await getSummedHours(doprovodId);
    const consumedDoprovodZpHours = await getSummedHours(doprovodZpId);

    // Calculate final balances as per C# logic
    const vacationDays = employee.Dovolenka - consumedRdHours / 8; // Assuming 8 hours per day for vacation calculation
    const doctorHours = this.constMaxLekar - consumedLekarHours;
    const accompanyingHours = this.constMaxDoprovod - consumedDoprovodHours;
    const accompanyingDisabledHours = this.constMaxDoprovodZP - consumedDoprovodZpHours;

    return {
      vacationDays,
      doctorHours,
      accompanyingHours,
      accompanyingDisabledHours,
    };
  }
}
