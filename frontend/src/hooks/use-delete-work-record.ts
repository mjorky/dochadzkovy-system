import { useMutation } from '@apollo/client';
import { DELETE_WORK_RECORD } from '@/graphql/mutations/work-records';
import { GET_WORK_RECORDS } from '@/graphql/queries/work-records';

interface DeleteWorkRecordInput {
  recordId: number;
  employeeId: number;
}

interface DeleteWorkRecordResponse {
  deleteWorkRecord: {
    success: boolean;
    message: string;
  };
}

interface DeleteWorkRecordVariables {
  input: DeleteWorkRecordInput;
}

/**
 * Hook for deleting a work record via GraphQL mutation.
 *
 * @returns Mutation function, loading state, and error state
 */
export function useDeleteWorkRecord() {
  const [deleteWorkRecord, { data, loading, error }] = useMutation<
    DeleteWorkRecordResponse,
    DeleteWorkRecordVariables
  >(DELETE_WORK_RECORD, {
    // Refetch work records query after successful deletion
    refetchQueries: [GET_WORK_RECORDS],
    // Avoid showing stale data by not using optimistic updates
    awaitRefetchQueries: true,
  });

  return {
    deleteWorkRecord,
    data,
    loading,
    error,
  };
}
