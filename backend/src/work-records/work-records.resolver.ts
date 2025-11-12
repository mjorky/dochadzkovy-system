import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { WorkRecordsService } from './work-records.service';
import { WorkRecordsResponse } from './entities/work-records-response.entity';
import { WorkRecordsInput } from './dto/work-records.input';
import { CreateWorkRecordInput } from './dto/create-work-record.input';
import { UpdateWorkRecordInput } from './dto/update-work-record.input';
import { DeleteWorkRecordInput } from './dto/delete-work-record.input';
import { WorkRecordMutationResponse } from './entities/work-record-mutation-response.entity';
import { ProjectCatalogItem } from '../projects/entities/project-catalog-item.entity';
import { AbsenceType } from './entities/absence-type.entity';
import { ProductivityType } from './entities/productivity-type.entity';
import { WorkType } from './entities/work-type.entity';

@Resolver()
export class WorkRecordsResolver {
  constructor(private readonly workRecordsService: WorkRecordsService) {}

  @Query(() => WorkRecordsResponse, { name: 'getWorkRecords' })
  async getWorkRecords(
    @Args('input') input: WorkRecordsInput,
  ): Promise<WorkRecordsResponse> {
    return this.workRecordsService.getWorkRecords(input);
  }

  @Mutation(() => WorkRecordMutationResponse, { name: 'createWorkRecord' })
  async createWorkRecord(
    @Args('input') input: CreateWorkRecordInput,
  ): Promise<WorkRecordMutationResponse> {
    return this.workRecordsService.createWorkRecord(input);
  }

  @Mutation(() => WorkRecordMutationResponse, { name: 'updateWorkRecord' })
  async updateWorkRecord(
    @Args('input') input: UpdateWorkRecordInput,
  ): Promise<WorkRecordMutationResponse> {
    return this.workRecordsService.updateWorkRecord(input);
  }

  @Mutation(() => WorkRecordMutationResponse, { name: 'deleteWorkRecord' })
  async deleteWorkRecord(
    @Args('input') input: DeleteWorkRecordInput,
  ): Promise<WorkRecordMutationResponse> {
    return this.workRecordsService.deleteWorkRecord(input);
  }

  @Query(() => Date, { name: 'getNextWorkday' })
  async getNextWorkday(
    @Args('employeeId', { type: () => Int }) employeeId: number,
  ): Promise<Date> {
    return this.workRecordsService.getNextWorkday(employeeId);
  }

  @Query(() => [ProjectCatalogItem], { name: 'getActiveProjects' })
  async getActiveProjects(): Promise<ProjectCatalogItem[]> {
    return this.workRecordsService.getActiveProjects();
  }

  @Query(() => [AbsenceType], { name: 'getAbsenceTypes' })
  async getAbsenceTypes(): Promise<AbsenceType[]> {
    return this.workRecordsService.getAbsenceTypes();
  }

  @Query(() => [ProductivityType], { name: 'getProductivityTypes' })
  async getProductivityTypes(): Promise<ProductivityType[]> {
    return this.workRecordsService.getProductivityTypes();
  }

  @Query(() => [WorkType], { name: 'getWorkTypes' })
  async getWorkTypes(): Promise<WorkType[]> {
    return this.workRecordsService.getWorkTypes();
  }
}