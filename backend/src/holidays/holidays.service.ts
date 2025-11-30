import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Holiday } from './entities/holiday.entity';

@Injectable()
export class HolidaysService {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<Holiday[]> {
        return this.prisma.holidays.findMany({
            orderBy: {
                Den: 'desc',
            },
        });
    }

    async create(date: Date): Promise<Holiday> {
        return this.prisma.holidays.create({
            data: {
                Den: date,
            },
        });
    }

    async update(oldDate: Date, newDate: Date): Promise<Holiday> {
        // Since the ID is the date itself, we need to delete the old one and create a new one
        // OR update the date if Prisma supports updating PKs (it usually does via update)
        // However, updating a PK can be tricky. Let's try standard update.
        return this.prisma.holidays.update({
            where: {
                Den: oldDate,
            },
            data: {
                Den: newDate,
            },
        });
    }

    async delete(date: Date): Promise<Holiday> {
        return this.prisma.holidays.delete({
            where: {
                Den: date,
            },
        });
    }
}
