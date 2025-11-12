import { Resolver, Query } from '@nestjs/graphql';
import { CountriesService } from './countries.service';
import { Country } from './entities/country.entity';

@Resolver(() => Country)
export class CountriesResolver {
  constructor(private readonly countriesService: CountriesService) {}

  @Query(() => [Country], { name: 'countries' })
  async getCountries(): Promise<Country[]> {
    return this.countriesService.findAll();
  }
}