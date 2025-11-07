import { useMutation } from '@apollo/client';
import { CREATE_WORK_RECORD } from '@/graphql/mutations/work-records';
import { GET_WORK_RECORDS, GET_NEXT_WORKDAY } from '@/graphql/queries/work-records';
import { WorkRecordFormData } from '@/lib/validations/work-record-schema';

interface CreateWorkRecordResponse {
  createWorkRecord: {
    success: boolean;
    message: string;
    record: {
      id: string;
      date: string;
      absenceType: string;
      project: string | null;
      productivityType: string | null;
      workType: string | null;
      startTime: string;
      endTime: string;
      hours: number;
      description: string | null;
      km: number;
      isTripFlag: boolean;
      isLocked: boolean;
      isOvernightShift: boolean;
    } | null;
  };
}

interface CreateWorkRecordVariables {
  input: WorkRecordFormData;
}

/**
 * Hook for creating a new work record via GraphQL mutation.
 *
 * @returns Mutation function, loading state, and error state
 */
export function useCreateWorkRecord() {
  const [createWorkRecord, { data, loading, error }] = useMutation<
    CreateWorkRecordResponse,
    CreateWorkRecordVariables
  >(CREATE_WORK_RECORD, {
    // Refetch work records and next workday queries after successful creation
    refetchQueries: [GET_WORK_RECORDS, GET_NEXT_WORKDAY],
    // Avoid showing stale data by not using optimistic updates
    awaitRefetchQueries: true,
  });

  return {
    createWorkRecord,
    data,
    loading,
    error,
  };
}
