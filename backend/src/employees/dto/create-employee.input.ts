import { InputType, Field, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsBoolean, IsNumber, IsOptional, MaxLength } from 'class-validator';

@InputType()
export class CreateEmployeeInput {
  @Field()
  @IsNotEmpty({ message: 'First name is required.' })
  @IsString()
  @MaxLength(50)
  firstName: string;

  @Field()
  @IsNotEmpty({ message: 'Last name is required.' })
  @IsString()
  @MaxLength(50)
  lastName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  titlePrefix?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  titleSuffix?: string;

  @Field()
  @IsNotEmpty({ message: 'Employment type is required.' })
  @IsString()
  employmentType: string;

  @Field(() => Float)
  @IsNumber()
  vacationDays: number;

  @Field(() => Boolean)
  @IsBoolean()
  isAdmin: boolean;
}

