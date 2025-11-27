// backend/src/balances/entities/balance.entity.ts
import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Balance {
  @Field(() => Float, { description: 'Remaining vacation days' })
  vacationDays: number;

  @Field(() => Float, { description: 'Remaining doctor visit hours' })
  doctorHours: number;

  @Field(() => Float, { description: 'Remaining accompanying family member hours' })
  accompanyingHours: number;

  @Field(() => Float, { description: 'Remaining accompanying disabled person hours' })
  accompanyingDisabledHours: number;
}
