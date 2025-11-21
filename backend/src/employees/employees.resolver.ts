import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeInput } from './dto/create-employee.input';
import { UpdateEmployeeInput } from './dto/update-employee.input';
import { UsePipes, ValidationPipe } from '@nestjs/common';

@Resolver(() => Employee)
export class EmployeesResolver {
  constructor(private readonly employeesService: EmployeesService) {}

  @Query(() => [Employee], { name: 'employees' })
  async employees(): Promise<Employee[]> {
    return this.employeesService.findAll();
  }

  @Query(() => [Employee], { name: 'managers' })
  async managers(): Promise<Employee[]> {
    return this.employeesService.findManagers();
  }

  @Mutation(() => Employee)
  @UsePipes(new ValidationPipe())
  async createEmployee(
    @Args('createEmployeeInput') createEmployeeInput: CreateEmployeeInput,
  ): Promise<Employee> {
    return this.employeesService.create(createEmployeeInput);
  }

  @Mutation(() => Employee)
  @UsePipes(new ValidationPipe())
  async updateEmployee(
    @Args('updateEmployeeInput') updateEmployeeInput: UpdateEmployeeInput,
  ): Promise<Employee> {
    return this.employeesService.update(updateEmployeeInput);
  }

  @Mutation(() => Boolean)
  async deleteEmployee(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.employeesService.delete(id);
  }
}
