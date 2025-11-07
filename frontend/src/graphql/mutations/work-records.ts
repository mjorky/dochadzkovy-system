import { gql } from '@apollo/client';

/**
 * GraphQL mutation for creating a new work record.
 */
export const CREATE_WORK_RECORD = gql`
  mutation CreateWorkRecord($input: CreateWorkRecordInput!) {
    createWorkRecord(input: $input) {
      success
      message
      record {
        id
        date
        absenceType
        project
        productivityType
        workType
        startTime
        endTime
        hours
        description
        km
        isTripFlag
        isLocked
        isOvernightShift
      }
    }
  }
`;

/**
 * GraphQL mutation for updating an existing work record.
 */
export const UPDATE_WORK_RECORD = gql`
  mutation UpdateWorkRecord($input: UpdateWorkRecordInput!) {
    updateWorkRecord(input: $input) {
      success
      message
      record {
        id
        date
        absenceType
        project
        productivityType
        workType
        startTime
        endTime
        hours
        description
        km
        isTripFlag
        isLocked
        isOvernightShift
      }
    }
  }
`;

/**
 * GraphQL mutation for deleting a work record.
 */
export const DELETE_WORK_RECORD = gql`
  mutation DeleteWorkRecord($input: DeleteWorkRecordInput!) {
    deleteWorkRecord(input: $input) {
      success
      message
    }
  }
`;
