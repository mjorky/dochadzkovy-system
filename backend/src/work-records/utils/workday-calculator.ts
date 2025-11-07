import { PrismaService } from '../../prisma/prisma.service';

/**
 * Calculate the next valid workday from a given date.
 *
 * A valid workday is a date that:
 * 1. Is not a Saturday (weekday 6)
 * 2. Is not a Sunday (weekday 0)
 * 3. Is not in the Holidays table (Slovak public holidays)
 *
 * @param lastRecordDate - The date of the last work record
 * @param prisma - Prisma service instance for querying holidays
 * @returns The next valid workday as a Date object
 *
 * @example
 * // If last record is Friday Aug 28 2025
 * // and Aug 29 is a Slovak holiday, Aug 30 is Saturday, Aug 31 is Sunday
 * // returns Monday Sep 1 2025
 * calculateNextWorkday(new Date('2025-08-28'), prisma)
 */
export async function calculateNextWorkday(
  lastRecordDate: Date,
  prisma: PrismaService,
): Promise<Date> {
  // Start from the day after the last record
  let candidateDate = new Date(lastRecordDate);
  candidateDate.setDate(candidateDate.getDate() + 1);

  // Query holidays between last record and 60 days ahead (reasonable range)
  const maxDate = new Date(lastRecordDate);
  maxDate.setDate(maxDate.getDate() + 60);

  const holidays = await prisma.holidays.findMany({
    where: {
      Den: {
        gte: candidateDate,
        lte: maxDate,
      },
    },
    select: {
      Den: true,
    },
  });

  // Create a Set of holiday dates for fast lookup (compare by date string)
  const holidayDates = new Set(
    holidays.map((h) => h.Den.toISOString().split('T')[0]),
  );

  // Find the next workday
  let iterations = 0;
  const maxIterations = 60; // Safety limit

  while (iterations < maxIterations) {
    const weekday = candidateDate.getDay();
    const dateString = candidateDate.toISOString().split('T')[0];

    // Check if it's a weekend
    const isWeekend = weekday === 0 || weekday === 6; // Sunday or Saturday

    // Check if it's a holiday
    const isHoliday = holidayDates.has(dateString);

    // If it's a valid workday, return it
    if (!isWeekend && !isHoliday) {
      return candidateDate;
    }

    // Move to next day
    candidateDate.setDate(candidateDate.getDate() + 1);
    iterations++;
  }

  // If we couldn't find a workday in 60 days, just return the candidate
  // This shouldn't happen in practice
  return candidateDate;
}
