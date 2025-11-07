import { ObjectType, Field } from '@nestjs/graphql';
import { WorkRecord } from './work-record.entity';

/**
 * Response entity for work record mutations (create, update, delete).
 *
 * Provides a consistent response structure for all mutation operations
 * with success status, optional message, and the affected record.
 */
@ObjectType()
export class WorkRecordMutationResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => WorkRecord, { nullable: true })
  record?: WorkRecord;
}
