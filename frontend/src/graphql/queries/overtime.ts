import { gql } from '@apollo/client';

export const GET_OVERTIME_SUMMARY = gql`
  query GetOvertimeSummary($employeeId: Int!, $year: Int!) {
    getOvertimeSummary(employeeId: $employeeId, year: $year) {
      items {
        type
        hours
      }
    }
  }
`;

export const CREATE_OVERTIME_CORRECTION = gql`
  mutation CreateOvertimeCorrection($input: CreateOvertimeCorrectionInput!) {
    createOvertimeCorrection(input: $input)
  }
`;

export interface OvertimeSummaryItem {
  type: string;
  hours: number;
}

export interface OvertimeSummaryData {
  getOvertimeSummary: {
    items: OvertimeSummaryItem[];
  };
}
