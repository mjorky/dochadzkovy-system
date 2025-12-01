import { Module } from '@nestjs/common';
import { HolidaysService } from './holidays.service';
import { HolidaysResolver } from './holidays.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [HolidaysResolver, HolidaysService],
    exports: [HolidaysService],
})
export class HolidaysModule { }
