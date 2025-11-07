import { ObjectType, Field, Int } from '@nestjs/graphql';
import { WorkRecord } from './work-record.entity';

@ObjectType()
export class WorkRecordsResponse {
  @Field(() => [WorkRecord])
  records: WorkRecord[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Boolean)
  hasMore: boolean;
}
