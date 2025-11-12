import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { CreateProjectInput } from './create-project.input';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateProjectInput extends PartialType(CreateProjectInput) {
  @Field(() => ID)
  @IsNotEmpty()
  id: string;
}