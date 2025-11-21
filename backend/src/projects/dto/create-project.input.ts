import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  MaxLength,
  IsOptional,
} from 'class-validator';

@InputType()
export class CreateProjectInput {
  @Field()
  @IsNotEmpty({ message: 'Project number is required.' })
  @IsString()
  @MaxLength(12)
  number: string;

  @Field()
  @IsNotEmpty({ message: 'Project name is required.' })
  @IsString()
  @MaxLength(100)
  name: string;

  @Field()
  @IsOptional({ message: 'Description is required.' })
  @IsString()
  @MaxLength(255)
  description: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(3)
  countryCode: string;

  @Field(() => ID)
  @IsNotEmpty({ message: 'Manager is required.' })
  managerId: string;

  @Field(() => Boolean)
  @IsBoolean()
  active: boolean;
}
