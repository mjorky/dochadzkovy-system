import { gql } from '@apollo/client';

export const EMPLOYEES_QUERY = gql`
  query GetEmployees {
    employees {
      id
      firstName
      lastName
      fullName
      vacationDays
      isAdmin
      employeeType
      lastRecordDate
      lockedUntil
      titlePrefix
      titleSuffix
      manager {
        id
        firstName
        lastName
        fullName
      }
    }
  }
`;

export const GET_MANAGERS = gql`
  query GetManagersForDropdown {
    managers { # Používame našu novú query 'managers'
      id
      fullName
    }
  }
`;

export const GET_EMPLOYEES_CATALOG = gql`
  query GetEmployeesCatalog {
    employees {
      id
      fullName
    }
  }
`;

export const CREATE_EMPLOYEE = gql`
  mutation CreateEmployee($createEmployeeInput: CreateEmployeeInput!) {
    createEmployee(createEmployeeInput: $createEmployeeInput) {
      id
      fullName
      firstName
      lastName
      vacationDays
      isAdmin
      employeeType
      lastRecordDate
      lockedUntil
      titlePrefix
      titleSuffix
      manager {
        id
        fullName
      }
    }
  }
`;

export const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee($updateEmployeeInput: UpdateEmployeeInput!) {
    updateEmployee(updateEmployeeInput: $updateEmployeeInput) {
      id
      fullName
      firstName
      lastName
      vacationDays
      isAdmin
      employeeType
      lastRecordDate
      lockedUntil
      titlePrefix
      titleSuffix
      manager {
        id
        fullName
      }
    }
  }
`;

export const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployee($id: ID!) {
    deleteEmployee(id: $id)
  }
`;

export interface Employee {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  vacationDays: number;
  isAdmin: boolean;
  employeeType: string;
  lastRecordDate?: string;
  lockedUntil?: string;
  titlePrefix?: string;
  titleSuffix?: string;
  manager?: {
    id: string;
    firstName?: string;
    lastName?: string;
    fullName: string;
  };
}

export interface EmployeesData {
  employees: Employee[];
}

export interface EmployeeCatalogItem {
  id: string;
  fullName: string;
}

export interface EmployeesCatalogData {
  employees: EmployeeCatalogItem[];
}

export interface ManagersData {
  managers: EmployeeCatalogItem[];
}
