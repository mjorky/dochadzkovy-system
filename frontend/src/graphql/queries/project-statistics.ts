import { gql } from '@apollo/client';

export const GET_PROJECT_STATISTICS = gql`
  query GetProjectStatistics($input: ProjectStatisticsInput!) {
    getProjectStatistics(input: $input) {
      items {
        projectNumber
        projectName
        productiveHours
        nonProductiveHours
        productiveZHours
        nonProductiveZHours
      }
    }
  }
`;

export interface ProjectStatisticsItem {
  projectNumber: string;
  projectName: string;
  productiveHours: number;
  nonProductiveHours: number;
  productiveZHours: number;
  nonProductiveZHours: number;
}

export interface ProjectStatisticsResponse {
  getProjectStatistics: {
    items: ProjectStatisticsItem[];
  };
}

export interface ProjectStatisticsInput {
  employeeId: number;
  fromDate: string;
  toDate: string;
}

