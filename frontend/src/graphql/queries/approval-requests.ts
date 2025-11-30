import { gql } from '@apollo/client';

export const GET_APPROVAL_REQUESTS_BY_EMPLOYEE = gql`
  query GetApprovalRequestsByEmployee($employeeId: String!) {
    approvalRequestsByEmployee(employeeId: $employeeId) {
      id
      type
      dateFrom
      dateTo
      hours
      note
      status
      createdAt
      updatedAt
      approver {
        id
        firstName
        lastName
      }
    }
  }
`;

export const GET_APPROVAL_REQUESTS_BY_MANAGER = gql`
  query GetApprovalRequestsByManager($managerId: String!) {
    approvalRequestsByManager(managerId: $managerId) {
      id
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

export const GET_PENDING_APPROVAL_COUNT = gql`
  query GetPendingApprovalCount($managerId: String!) {
    pendingApprovalCount(managerId: $managerId)
  }
`;
