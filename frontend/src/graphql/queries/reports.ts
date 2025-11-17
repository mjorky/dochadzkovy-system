import { gql } from '@apollo/client';

export const GET_WORK_REPORT_PDF = gql`
  query GetWorkReportPDF($employeeId: Int!, $month: Int!, $year: Int!) {
    getWorkReportPDF(input: { employeeId: $employeeId, month: $month, year: $year })
  }
`;

export const GET_WORK_REPORT_DATA = gql`
  query GetWorkReportData($employeeId: Int!, $month: Int!, $year: Int!) {
    getWorkReportData(input: { employeeId: $employeeId, month: $month, year: $year }) {
      totalWorkDays
      totalHours
      weekendWorkHours
      holidayWorkHours
      dailyRecords {
        date
        dayOfWeek
        startTime
        endTime
        hours
        absenceReason
      }
      absenceSummary {
        category
        days
        hours
      }
    }
  }
`;

export interface DailyRecord {
  date: string;
  dayOfWeek: string;
  startTime?: string;
  endTime?: string;
  hours?: number;
  absenceReason?: string;
}

export interface AbsenceSummaryItem {
  category: string;
  days: number;
  hours: number;
}

export interface WorkReportSummaryData {
  totalWorkDays: number;
  totalHours: number;
  weekendWorkHours: number;
  holidayWorkHours: number;
  dailyRecords: DailyRecord[];
  absenceSummary: AbsenceSummaryItem[];
}
