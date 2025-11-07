import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { calculateNextWorkday } from './workday-calculator';

describe('calculateNextWorkday', () => {
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaService,
          useValue: {
            holidays: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should skip Saturday and return Monday', async () => {
    // Friday, Nov 1, 2025
    const lastRecordDate = new Date('2025-11-01');

    // No holidays between Nov 2 and Dec 31
    jest.spyOn(prismaService.holidays, 'findMany').mockResolvedValue([]);

    const result = await calculateNextWorkday(lastRecordDate, prismaService);

    // Should return Monday, Nov 3, 2025 (skipping Saturday Nov 2 and Sunday Nov 3)
    expect(result.getDay()).toBe(1); // Monday
    expect(result.toISOString().split('T')[0]).toBe('2025-11-03');
  });

  it('should skip Sunday and return Monday', async () => {
    // Saturday, Nov 2, 2025
    const lastRecordDate = new Date('2025-11-02');

    jest.spyOn(prismaService.holidays, 'findMany').mockResolvedValue([]);

    const result = await calculateNextWorkday(lastRecordDate, prismaService);

    // Should return Monday, Nov 3, 2025 (skipping Sunday Nov 3)
    expect(result.getDay()).toBe(1); // Monday
    expect(result.toISOString().split('T')[0]).toBe('2025-11-03');
  });

  it('should skip Slovak holidays', async () => {
    // Thursday, Jan 1, 2026 (New Year's Day - holiday)
    const lastRecordDate = new Date('2026-01-01');

    // Mock Jan 2 as a holiday (Three Kings Day is Jan 6 in Slovakia)
    const mockHolidays = [
      { Den: new Date('2026-01-06') }, // Epiphany
    ];

    jest.spyOn(prismaService.holidays, 'findMany').mockResolvedValue(mockHolidays as any);

    const result = await calculateNextWorkday(lastRecordDate, prismaService);

    // Should return Friday, Jan 2, 2026 (next workday after Jan 1)
    expect(result.toISOString().split('T')[0]).toBe('2026-01-02');
  });

  it('should skip multiple consecutive non-workdays (weekend + holiday)', async () => {
    // Friday, Dec 24, 2027
    const lastRecordDate = new Date('2027-12-24');

    // Mock Christmas holidays (Dec 25, 26 are holidays, plus weekend)
    const mockHolidays = [
      { Den: new Date('2027-12-25') }, // Christmas Day
      { Den: new Date('2027-12-26') }, // Boxing Day
    ];

    jest.spyOn(prismaService.holidays, 'findMany').mockResolvedValue(mockHolidays as any);

    const result = await calculateNextWorkday(lastRecordDate, prismaService);

    // Should return Monday, Dec 27, 2027 (skipping Sat 25, Sun 26 which are also holidays)
    expect(result.getDay()).toBe(1); // Monday
    expect(result.toISOString().split('T')[0]).toBe('2027-12-27');
  });

  it('should return next workday on regular weekday with no holidays', async () => {
    // Monday, Nov 3, 2025
    const lastRecordDate = new Date('2025-11-03');

    jest.spyOn(prismaService.holidays, 'findMany').mockResolvedValue([]);

    const result = await calculateNextWorkday(lastRecordDate, prismaService);

    // Should return Tuesday, Nov 4, 2025
    expect(result.getDay()).toBe(2); // Tuesday
    expect(result.toISOString().split('T')[0]).toBe('2025-11-04');
  });

  it('should handle edge case with Friday to Monday gap', async () => {
    // Friday, Aug 29, 2025
    const lastRecordDate = new Date('2025-08-29');

    // Mock Aug 29 as Slovak National Uprising Day (actual holiday)
    const mockHolidays = [
      { Den: new Date('2025-08-29') },
    ];

    jest.spyOn(prismaService.holidays, 'findMany').mockResolvedValue(mockHolidays as any);

    const result = await calculateNextWorkday(lastRecordDate, prismaService);

    // Should return Monday, Sep 1, 2025 (skipping weekend)
    expect(result.getDay()).toBe(1); // Monday
    expect(result.toISOString().split('T')[0]).toBe('2025-09-01');
  });
});
