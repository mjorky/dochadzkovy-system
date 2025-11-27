// frontend/src/graphql/queries/balances.ts
import { gql } from '@apollo/client';

export const GET_EMPLOYEE_BALANCES = gql`
  query GetEmployeeBalances($employeeId: BigInt!, $year: Int!) {
    employeeBalances(employeeId: $employeeId, year: $year) {
      vacationDays
      doctorHours
      accompanyingHours
      accompanyingDisabledHours
    }
  }
`;

export interface EmployeeBalances {
  vacationDays: number;
  doctorHours: number;
  accompanyingHours: number;
  accompanyingDisabledHours: number;
}

export interface GetEmployeeBalancesData {
  employeeBalances: EmployeeBalances;
}

export interface GetEmployeeBalancesVars {
  employeeId: string; // GraphQL BigInt is represented as string in JS
  year: number;
}
