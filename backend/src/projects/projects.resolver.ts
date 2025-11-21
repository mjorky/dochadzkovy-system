import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ProjectsService } from './projects.service';
import { Project } from './entities/projects.entity';
import { CreateProjectInput } from './dto/create-project.input';
import { UpdateProjectInput } from './dto/update-project.input';
import { UsePipes, ValidationPipe } from '@nestjs/common';

@Resolver(() => Project)
// V-- Uisti sa, že tu máš "export"
export class ProjectsResolver {
  constructor(private readonly projectsService: ProjectsService) {}

  @Query(() => [Project], { name: 'projects' })
  getProjects(
    @Args('active', { type: () => Boolean, nullable: true }) active?: boolean,
    @Args('search', { type: () => String, nullable: true }) search?: string,
  ): Promise<Project[]> {
    return this.projectsService.findAll(active, search);
  }

  @Mutation(() => Project, { name: 'createProject' })
  @UsePipes(new ValidationPipe())
  createProject(
    @Args('createProjectInput') createProjectInput: CreateProjectInput,
  ): Promise<Project> {
    return this.projectsService.create(createProjectInput);
  }

  @Mutation(() => Project, { name: 'updateProject' })
  @UsePipes(new ValidationPipe())
  updateProject(
    @Args('updateProjectInput') updateProjectInput: UpdateProjectInput,
  ): Promise<Project> {
    return this.projectsService.update(updateProjectInput);
  }

  @Mutation(() => Project, { name: 'toggleProjectActive' })
  toggleProjectActive(
    @Args('id', { type: () => ID }) id: string,
    @Args('active', { type: () => Boolean }) active: boolean,
  ): Promise<Project> {
    return this.projectsService.toggleActive(id, active);
  }
}
