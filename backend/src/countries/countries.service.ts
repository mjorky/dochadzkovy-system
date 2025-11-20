import { Injectable, Logger } from '@nestjs/common';
import { Countries } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Country } from './entities/country.entity';

@Injectable()
export class CountriesService {
  private readonly logger = new Logger(CountriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Country[]> {
    try {
      const countries = await this.prisma.countries.findMany({
        orderBy: {
          CountryName: 'asc',
        },
      });

      return countries.map((country: Countries) => ({
        countryCode: country.CountryCode,
        name: country.CountryName,
      }));
    } catch (error) {
      this.logger.error('Failed to fetch countries', error);
      throw new Error('Could not fetch countries from the database.');
    }
  }
}
