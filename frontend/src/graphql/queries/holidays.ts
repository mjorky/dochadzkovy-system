import { gql } from "@apollo/client";

export interface Holiday {
    Den: string; // Date as string
}

export const GET_HOLIDAYS = gql`
  query GetHolidays {
    holidays {
      Den
    }
  }
`;

export const ADD_HOLIDAY = gql`
  mutation AddHoliday($date: DateTime!) {
    addHoliday(date: $date) {
      Den
    }
  }
`;

export const UPDATE_HOLIDAY = gql`
  mutation UpdateHoliday($oldDate: DateTime!, $newDate: DateTime!) {
    updateHoliday(oldDate: $oldDate, newDate: $newDate) {
      Den
    }
  }
`;

export const DELETE_HOLIDAY = gql`
  mutation DeleteHoliday($date: DateTime!) {
    deleteHoliday(date: $date) {
      Den
    }
  }
`;
