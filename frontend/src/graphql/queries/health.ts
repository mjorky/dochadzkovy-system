import { gql } from '@apollo/client';

export const HEALTH_QUERY = gql`
  query Health {
    health {
      status
      database
    }
  }
`;

export interface HealthData {
  health: {
    status: string;
    database: string;
  };
}
