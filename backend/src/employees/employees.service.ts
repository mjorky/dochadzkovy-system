import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Employee } from './entities/employee.entity';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Employee[]> {
    try {
      const employees = await this.prisma.zamestnanci.findMany({
        include: {
          ZamestnanecTyp: true,
        },
      });

      return employees.map((employee: any) => ({
        id: employee.ID.toString(),
        fullName: `${employee.Meno} ${employee.Priezvisko}`,
        vacationDays: employee.Dovolenka,
        isAdmin: employee.IsAdmin,
        employeeType: employee.ZamestnanecTyp.Typ,
        lastRecordDate: employee.PoslednyZaznam
          ? employee.PoslednyZaznam.toISOString()
          : null,
        lockedUntil: employee.ZamknuteK
          ? employee.ZamknuteK.toISOString()
          : null,
        titlePrefix: employee.TitulPred || null,
        titleSuffix: employee.TitulZa || null,
      }));
    } catch (error) {
      this.logger.error('Failed to fetch employees', error);
      throw new Error('Failed to fetch employees from database');
    }
  }

  async findManagers(): Promise<Employee[]> {
    try {
      const managers = await this.prisma.zamestnanci.findMany({
        where: {
          IsAdmin: true,
        },
        include: {
          ZamestnanecTyp: true,
        },
      });
      return managers.map((manager: any) => ({
        id: manager.ID.toString(),
        fullName: `${manager.Meno} ${manager.Priezvisko}`,
        vacationDays: manager.Dovolenka,
        isAdmin: manager.IsAdmin,
        employeeType: manager.ZamestnanecTyp.Typ,
        lastRecordDate: manager.PoslednyZaznam
          ? manager.PoslednyZaznam.toISOString()
          : null,
        lockedUntil: manager.ZamknuteK ? manager.ZamknuteK.toISOString() : null,
        titlePrefix: manager.TitulPred || null,
        titleSuffix: manager.TitulZa || null,
      }));
    } catch (error) {
      this.logger.error('Failed to fetch managers', error);
      throw new Error('Failed to fetch managers from database');
    }
  }
}
