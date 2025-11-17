import { gql } from '@apollo/client';

export const EMPLOYEES_QUERY = gql`
  query GetEmployees {
    employees {
      id
      fullName
      vacationDays
      isAdmin
      employeeType
      lastRecordDate
      lockedUntil
      titlePrefix
      titleSuffix
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

export interface Employee {
  id: string;
  fullName: string;
  vacationDays: number;
  isAdmin: boolean;
  employeeType: string;
  lastRecordDate?: string;
  lockedUntil?: string;
  titlePrefix?: string;
  titleSuffix?: string;
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
