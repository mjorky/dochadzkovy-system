import { gql } from '@apollo/client';

// GraphQL query for fetching work records
export const GET_WORK_RECORDS = gql`
  query GetWorkRecords(
    $employeeId: Int!
    $fromDate: String!
    $toDate: String!
    $limit: Int
    $offset: Int
  ) {
    getWorkRecords(
      input: {
        employeeId: $employeeId
        fromDate: $fromDate
        toDate: $toDate
        limit: $limit
        offset: $offset
      }
    ) {
      records {
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
      totalCount
      hasMore
    }
  }
`;

// GraphQL query for next workday calculation
export const GET_NEXT_WORKDAY = gql`
  query GetNextWorkday($employeeId: Int!) {
    getNextWorkday(employeeId: $employeeId)
  }
`;

// GraphQL query for active projects (AllowAssignWorkingHours=true)
export const GET_ACTIVE_PROJECTS = gql`
  query GetActiveProjects {
    getActiveProjects {
      id
      number
    }
  }
`;

// GraphQL query for absence types (CinnostTyp)
export const GET_ABSENCE_TYPES = gql`
  query GetAbsenceTypes {
    getAbsenceTypes {
      id
      alias
    }
  }
`;

// GraphQL query for productivity types (HourType)
export const GET_PRODUCTIVITY_TYPES = gql`
  query GetProductivityTypes {
    getProductivityTypes {
      id
      hourType
    }
  }
`;

// GraphQL query for work types (HourTypes)
export const GET_WORK_TYPES = gql`
  query GetWorkTypes {
    getWorkTypes {
      id
      hourType
    }
  }
`;

// TypeScript interfaces matching backend entities
export interface WorkRecord {
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
}

export interface WorkRecordsResponse {
  records: WorkRecord[];
  totalCount: number;
  hasMore: boolean;
}

export interface WorkRecordsData {
  getWorkRecords: WorkRecordsResponse;
}

export interface NextWorkdayData {
  getNextWorkday: string;
}

// Catalog data types for filter options
export interface ProjectOption {
  id: string;
  number: string;
}

export interface AbsenceTypeOption {
  id: string;
  alias: string;
}

export interface ProductivityTypeOption {
  id: string;
  hourType: string;
}

export interface WorkTypeOption {
  id: string;
  hourType: string;
}

export interface ActiveProjectsData {
  getActiveProjects: ProjectOption[];
}

export interface AbsenceTypesData {
  getAbsenceTypes: AbsenceTypeOption[];
}

export interface ProductivityTypesData {
  getProductivityTypes: ProductivityTypeOption[];
}

export interface WorkTypesData {
  getWorkTypes: WorkTypeOption[];
}
