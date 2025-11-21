import { Injectable, Logger, NotFoundException, ConflictException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeInput } from './dto/create-employee.input';
import { UpdateEmployeeInput } from './dto/update-employee.input';
import { constructTableName } from '../work-records/utils/normalize-table-name';
import { UsernameService } from '../auth/username.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usernameService: UsernameService,
  ) {}

  async findAll(): Promise<Employee[]> {
    try {
      const employees = await this.prisma.zamestnanci.findMany({
        include: {
          ZamestnanecTyp: true,
        },
      });

      return employees.map((employee: any) => ({
        id: employee.ID.toString(),
        firstName: employee.Meno,
        lastName: employee.Priezvisko,
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
        firstName: manager.Meno,
        lastName: manager.Priezvisko,
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

  async create(input: CreateEmployeeInput): Promise<Employee> {
    const type = await this.prisma.zamestnanecTyp.findFirst({
      where: { Typ: input.employmentType },
    });

    if (!type) {
      throw new NotFoundException(`Employment type ${input.employmentType} not found`);
    }

    try {
      // 1. Create Employee in Zamestnanci table
      const newEmployee = await this.prisma.zamestnanci.create({
        data: {
          Meno: input.firstName,
          Priezvisko: input.lastName,
          TitulPred: input.titlePrefix,
          TitulZa: input.titleSuffix,
          TypZamestnanca: type.Typ,
          Dovolenka: input.vacationDays,
          IsAdmin: input.isAdmin,
        },
        include: { ZamestnanecTyp: true },
      });

      // 2. Create UserCredentials
      const username = await this.usernameService.generateUsername(input.firstName, input.lastName);
      const defaultPassword = 'EmsT_2811'; 
      const passwordHash = await bcrypt.hash(defaultPassword, 10);

      await this.prisma.userCredentials.create({
        data: {
          ZamestnanecID: newEmployee.ID,
          Username: username,
          PasswordHash: passwordHash,
        },
      });

      // 3. Create personal table
      const tableName = constructTableName(input.firstName, input.lastName);
      try {
        await this.prisma.$queryRawUnsafe(`
          CREATE TABLE "${tableName}" (
            "ID" BIGSERIAL PRIMARY KEY,
            "CinnostTypID" BIGINT NOT NULL,
            "StartDate" DATE NOT NULL,
            "ProjectID" BIGINT NULL,
            "HourTypeID" BIGINT NULL,
            "HourTypesID" BIGINT NULL,
            "StartTime" TIME WITHOUT TIME ZONE NULL,
            "EndTime" TIME WITHOUT TIME ZONE NULL,
            "Description" TEXT NULL,
            "km" FLOAT NULL,
            "Lock" BOOLEAN NOT NULL DEFAULT FALSE,
            "DlhodobaSC" BOOLEAN NOT NULL DEFAULT FALSE,
            CONSTRAINT "FK_${tableName}_CinnostTyp" FOREIGN KEY ("CinnostTypID") REFERENCES "CinnostTyp"("ID"),
            CONSTRAINT "FK_${tableName}_Project" FOREIGN KEY ("ProjectID") REFERENCES "Projects"("ID"),
            CONSTRAINT "FK_${tableName}_HourType" FOREIGN KEY ("HourTypeID") REFERENCES "HourType"("ID"),
            CONSTRAINT "FK_${tableName}_HourTypes" FOREIGN KEY ("HourTypesID") REFERENCES "HourTypes"("ID")
          );
        `);
        
        // 4. Refresh AllTData view
        await this.refreshAllTDataView();

      } catch (dbError) {
        // If table creation fails, we should delete the employee record to maintain consistency
        // Cascade delete should remove UserCredentials too if configured, but let's rely on FK constraints or manual cleanup
        // Prisma doesn't support cascade delete on deleteMany/delete unless configured in schema. 
        // Here we just delete employee, UserCredentials should be deleted via Cascade in schema.
        await this.prisma.zamestnanci.delete({ where: { ID: newEmployee.ID } });
        this.logger.error(`Failed to create table ${tableName}, rolled back employee creation`, dbError);
        throw new InternalServerErrorException('Failed to create employee work record table');
      }

      return this.mapToEntity(newEmployee);
    } catch (error) {
      this.logger.error('Failed to create employee', error);
      if (error instanceof InternalServerErrorException || error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Could not create employee');
    }
  }

  async update(input: UpdateEmployeeInput): Promise<Employee> {
    const existingEmployee = await this.prisma.zamestnanci.findUnique({
        where: { ID: BigInt(input.id) },
        include: { ZamestnanecTyp: true, UserCredentials: true },
    });

    if (!existingEmployee) {
        throw new NotFoundException(`Employee with ID ${input.id} not found`);
    }

    let typeId = existingEmployee.TypZamestnanca;
    if (input.employmentType) {
        const type = await this.prisma.zamestnanecTyp.findFirst({
            where: { Typ: input.employmentType },
        });
        if (!type) throw new NotFoundException(`Employment type ${input.employmentType} not found`);
        typeId = type.Typ;
    }

    try {
        const updatedEmployee = await this.prisma.zamestnanci.update({
            where: { ID: BigInt(input.id) },
            data: {
                Meno: input.firstName ?? undefined,
                Priezvisko: input.lastName ?? undefined,
                TitulPred: input.titlePrefix ?? undefined,
                TitulZa: input.titleSuffix ?? undefined,
                TypZamestnanca: typeId,
                Dovolenka: input.vacationDays ?? undefined,
                IsAdmin: input.isAdmin ?? undefined,
            },
            include: { ZamestnanecTyp: true },
        });

        // Name Change Logic
        if (
            (input.firstName && input.firstName !== existingEmployee.Meno) ||
            (input.lastName && input.lastName !== existingEmployee.Priezvisko)
        ) {
            // 1. Rename Table
            const oldTableName = constructTableName(existingEmployee.Meno, existingEmployee.Priezvisko);
            const newTableName = constructTableName(updatedEmployee.Meno, updatedEmployee.Priezvisko);

            if (oldTableName !== newTableName) {
                // Check if old table exists to avoid error
                try {
                await this.prisma.$queryRawUnsafe(`ALTER TABLE "${oldTableName}" RENAME TO "${newTableName}"`);
                await this.refreshAllTDataView();
                } catch (e) {
                   this.logger.warn(`Could not rename table ${oldTableName} to ${newTableName}. It might not exist.`, e);
                }
            }

            // 2. Update UserCredentials Username
            // Spec: "Trigger: Occurs when an Admin creates a new employee or updates an employee's name"
            if (existingEmployee.UserCredentials) {
                const newUsername = await this.usernameService.generateUsername(updatedEmployee.Meno, updatedEmployee.Priezvisko);
                if (newUsername !== existingEmployee.UserCredentials.Username) {
                    await this.prisma.userCredentials.update({
                        where: { ID: existingEmployee.UserCredentials.ID },
                        data: { Username: newUsername },
                    });
                }
            }
        }

        // Also update isAdmin in credentials payload/cache if we had one, but we query DB on login so it's fine.

        return this.mapToEntity(updatedEmployee);
    } catch (error) {
        this.logger.error('Failed to update employee', error);
        throw new Error('Could not update employee');
    }
  }

  async delete(id: string): Promise<boolean> {
      const employee = await this.prisma.zamestnanci.findUnique({
          where: { ID: BigInt(id) },
      });

      if (!employee) {
          throw new NotFoundException(`Employee with ID ${id} not found`);
      }

      const tableName = constructTableName(employee.Meno, employee.Priezvisko);

      try {
          // Drop table
          await this.prisma.$queryRawUnsafe(`DROP TABLE IF EXISTS "${tableName}"`);
          
          // Delete record (Cascade will delete UserCredentials)
          await this.prisma.zamestnanci.delete({ where: { ID: BigInt(id) } });

          // Refresh view
          await this.refreshAllTDataView();

          return true;
      } catch (error) {
          this.logger.error('Failed to delete employee', error);
          throw new Error('Could not delete employee');
      }
  }

  private async refreshAllTDataView() {
    try {
        const tables: {table_name: string}[] = await this.prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name LIKE 't\_%\_%' 
            AND table_schema = 'public'
        `;
        
        if (tables.length === 0) {
             await this.prisma.$queryRawUnsafe(`CREATE OR REPLACE VIEW "AllTData" AS SELECT 1 AS "ID" WHERE 1=0`);
             return;
        }

        const unionQuery = tables.map(t => `SELECT *, '${t.table_name}' as "SourceTable" FROM "${t.table_name}"`).join(' UNION ALL ');
        await this.prisma.$queryRawUnsafe(`CREATE OR REPLACE VIEW "AllTData" AS ${unionQuery}`);

    } catch (e) {
        this.logger.error('Failed to refresh AllTData view', e);
    }
  }

  private mapToEntity(employee: any): Employee {
    return {
        id: employee.ID.toString(),
        firstName: employee.Meno,
        lastName: employee.Priezvisko,
        fullName: `${employee.Meno} ${employee.Priezvisko}`,
        vacationDays: employee.Dovolenka,
        isAdmin: employee.IsAdmin,
        employeeType: employee.ZamestnanecTyp?.Typ || '',
        lastRecordDate: employee.PoslednyZaznam ? employee.PoslednyZaznam.toISOString() : null,
        lockedUntil: employee.ZamknuteK ? employee.ZamknuteK.toISOString() : null,
        titlePrefix: employee.TitulPred || null,
        titleSuffix: employee.TitulZa || null,
    };
  }
}
