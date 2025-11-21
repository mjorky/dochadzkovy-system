import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Employee } from '../../employees/entities/employee.entity';
import { Country } from '../../countries/entities/country.entity';

@ObjectType()
export class Project {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  number: string;

  @Field(() => String, {
    nullable: true,
    description: 'Optional project description.',
  })
  description: string | null;

  @Field(() => Boolean, {
    description: 'Allows assigning working hours to this project.',
  })
  active: boolean;

  @Field(() => Country, {
    description: 'The country associated with the project.',
  })
  country: Country;

  @Field(() => Employee, { description: 'The employee managing the project.' })
  manager: Employee;
}
