import { gql } from '@apollo/client';

export const CREATE_APPROVAL_REQUEST = gql`
  mutation CreateApprovalRequest($input: CreateApprovalRequestInput!) {
    createApprovalRequest(createApprovalRequestInput: $input) {
      id
      employeeId
      type
      dateFrom
      dateTo
      hours
      note
      status
      createdAt
      employee {
        id
        firstName
        lastName
      }
    }
  }
`;

export const APPROVE_REQUEST = gql`
  mutation ApproveRequest($id: Int!, $approverId: String!) {
    approveRequest(id: $id, approverId: $approverId) {
      id
      status
      approverId
      updatedAt
    }
  }
`;

export const REJECT_REQUEST = gql`
  mutation RejectRequest($id: Int!, $approverId: String!) {
    rejectRequest(id: $id, approverId: $approverId) {
      id
      status
      approverId
      updatedAt
    }
  }
`;
