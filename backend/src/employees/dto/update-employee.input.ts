import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { CreateEmployeeInput } from './create-employee.input';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateEmployeeInput extends PartialType(CreateEmployeeInput) {
  @Field(() => ID)
  @IsNotEmpty()
  id: string;
}

