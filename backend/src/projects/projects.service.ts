import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma, Zamestnanci } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Project } from './entities/projects.entity';
import { CreateProjectInput } from './dto/create-project.input';
import { UpdateProjectInput } from './dto/update-project.input';
import { Employee } from '../employees/entities/employee.entity';

type ProjectWithRelations = Prisma.ProjectsGetPayload<{
  include: {
    Zamestnanci: true;
    Countries: true;
  };
}>;

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(active?: boolean, search?: string): Promise<Project[]> {
    const where: Prisma.ProjectsWhereInput = {};

    if (typeof active === 'boolean') {
      where.AllowAssignWorkingHours = active;
    }

    if (search) {
      where.OR = [
        { Name: { contains: search, mode: 'insensitive' } },
        { Number: { contains: search, mode: 'insensitive' } },
      ];
    }

    try {
      const dbProjects = await this.prisma.projects.findMany({
        where,
        // 👇👇👇 OPRAVA: Používame názvy relácií presne podľa `schema.prisma` 👇👇👇
        include: {
          Zamestnanci: true,
          Countries: true,
        },
        orderBy: { Name: 'asc' },
      });

      return dbProjects.map((p: ProjectWithRelations) => this.mapToProjectEntity(p));
    } catch (error) {
      this.logger.error('Failed to fetch projects', error);
      throw new Error('Could not fetch projects from the database.');
    }
  }

  async create(input: CreateProjectInput): Promise<Project> {
    const existing = await this.prisma.projects.findUnique({ where: { Number: input.number } });
    if (existing) {
      throw new ConflictException(`Project with number "${input.number}" already exists.`);
    }
    try {
      const newProject = await this.prisma.projects.create({
        data: {
          Name: input.name, Number: input.number, Description: input.description,
          AllowAssignWorkingHours: input.active, CountryCode: input.countryCode, Manager: BigInt(input.managerId),
        },
        include: { Zamestnanci: true, Countries: true },
      });
      return this.mapToProjectEntity(newProject);
    } catch (error) {
      this.logger.error('Failed to create project', error);
      throw new Error('Could not create the project.');
    }
  }

  async update(input: UpdateProjectInput): Promise<Project> {
    const { id, ...data } = input;
    try {
      const updatedProject = await this.prisma.projects.update({
        where: { ID: BigInt(id) },
        data: {
          Name: data.name, Number: data.number, Description: data.description, AllowAssignWorkingHours: data.active,
          CountryCode: data.countryCode, Manager: data.managerId ? BigInt(data.managerId) : undefined,
        },
        include: { Zamestnanci: true, Countries: true },
      });
      return this.mapToProjectEntity(updatedProject);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Project with ID "${id}" not found.`);
      }
      this.logger.error(`Failed to update project ${id}`, error);
      throw new Error('Could not update the project.');
    }
  }

  async toggleActive(id: string, active: boolean): Promise<Project> {
    try {
      const updatedProject = await this.prisma.projects.update({
        where: { ID: BigInt(id) },
        data: { AllowAssignWorkingHours: active },
        include: { Zamestnanci: true, Countries: true },
      });
      return this.mapToProjectEntity(updatedProject);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Project with ID "${id}" not found.`);
      }
      this.logger.error(`Failed to toggle active status for project ${id}`, error);
      throw new Error('Could not update the project status.');
    }
  }

  private mapToProjectEntity(dbProject: ProjectWithRelations): Project {
    return {
      id: dbProject.ID.toString(),
      name: dbProject.Name,
      number: dbProject.Number,
      description: dbProject.Description ?? null,
      active: dbProject.AllowAssignWorkingHours,
      country: {
        countryCode: dbProject.Countries.CountryCode,
        name: dbProject.Countries.CountryName,
      },
      manager: this.mapToEmployeeEntity(dbProject.Zamestnanci),
    };
  }

  private mapToEmployeeEntity(dbEmployee: Zamestnanci): Employee {
    return {
      id: dbEmployee.ID.toString(),
      firstName: dbEmployee.Meno,
      lastName: dbEmployee.Priezvisko,
      fullName: `${dbEmployee.Meno} ${dbEmployee.Priezvisko}`,
      isAdmin: dbEmployee.IsAdmin,
      vacationDays: dbEmployee.Dovolenka,
      employeeType: dbEmployee.TypZamestnanca,
      lastRecordDate: dbEmployee.PoslednyZaznam?.toISOString() || null,
      lockedUntil: dbEmployee.ZamknuteK?.toISOString() || null,
      titlePrefix: dbEmployee.TitulPred || null,
      titleSuffix: dbEmployee.TitulZa || null,
    };
  }
}