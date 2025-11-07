import { useMutation } from '@apollo/client';
import { UPDATE_WORK_RECORD } from '@/graphql/mutations/work-records';
import { GET_WORK_RECORDS } from '@/graphql/queries/work-records';

interface UpdateWorkRecordInput {
  recordId: number;
  employeeId: number;
  date?: string;
  absenceTypeId?: number;
  projectId?: number;
  productivityTypeId?: number;
  workTypeId?: number;
  startTime?: string;
  endTime?: string;
  description?: string;
  km?: number;
  isTripFlag?: boolean;
}

interface UpdateWorkRecordResponse {
  updateWorkRecord: {
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

interface UpdateWorkRecordVariables {
  input: UpdateWorkRecordInput;
}

/**
 * Hook for updating an existing work record via GraphQL mutation.
 *
 * @returns Mutation function, loading state, and error state
 */
export function useUpdateWorkRecord() {
  const [updateWorkRecord, { data, loading, error }] = useMutation<
    UpdateWorkRecordResponse,
    UpdateWorkRecordVariables
  >(UPDATE_WORK_RECORD, {
    // Refetch work records query after successful update
    refetchQueries: [GET_WORK_RECORDS],
    // Avoid showing stale data by not using optimistic updates
    awaitRefetchQueries: true,
  });

  return {
    updateWorkRecord,
    data,
    loading,
    error,
  };
}
