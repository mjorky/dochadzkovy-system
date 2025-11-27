import { InputType, Field, Float, Int } from '@nestjs/graphql';

@InputType()
export class CreateOvertimeCorrectionInput {
  @Field(() => Int)
  employeeId: number;

  @Field()
  date: Date;

  @Field()
  type: string;

  @Field(() => Float)
  hours: number; // Positive to add, negative to subtract (handled by logic)

  @Field()
  note: string;

  @Field()
  isDeduction: boolean; // If true, we are subtracting (odpocet)
}
