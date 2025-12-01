import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { HolidaysService } from './holidays.service';
import { Holiday } from './entities/holiday.entity';

@Resolver(() => Holiday)
export class HolidaysResolver {
    constructor(private readonly holidaysService: HolidaysService) { }

    @Query(() => [Holiday], { name: 'holidays' })
    async getHolidays(): Promise<Holiday[]> {
        return this.holidaysService.findAll();
    }

    @Mutation(() => Holiday)
    async addHoliday(@Args('date') date: Date): Promise<Holiday> {
        return this.holidaysService.create(date);
    }

    @Mutation(() => Holiday)
    async updateHoliday(
        @Args('oldDate') oldDate: Date,
        @Args('newDate') newDate: Date,
    ): Promise<Holiday> {
        return this.holidaysService.update(oldDate, newDate);
    }

    @Mutation(() => Holiday)
    async deleteHoliday(@Args('date') date: Date): Promise<Holiday> {
        return this.holidaysService.delete(date);
    }
}
