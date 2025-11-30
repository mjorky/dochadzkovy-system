import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLBigInt } from 'graphql-scalars';
import { Request, Response } from 'express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { EmployeesModule } from './employees/employees.module';
import { WorkRecordsModule } from './work-records/work-records.module';
import { ProjectsModule } from './projects/projects.module';
import { CountriesModule } from './countries/countries.module';
import { ReportsModule } from './reports/reports.module';
import { AuthModule } from './auth/auth.module';
import { OvertimeModule } from './overtime/overtime.module';
import { BalancesModule } from './balances/balances.module';
import { HolidaysModule } from './holidays/holidays.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      sortSchema: true,
      playground: true,
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
      buildSchemaOptions: {
        scalarsMap: [{ type: BigInt, scalar: GraphQLBigInt }],
      },
    }),
    PrismaModule,
    HealthModule,
    EmployeesModule,
    WorkRecordsModule,
    ProjectsModule,
    CountriesModule,
    ReportsModule,
    AuthModule,
    OvertimeModule,
    BalancesModule,
    HolidaysModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
