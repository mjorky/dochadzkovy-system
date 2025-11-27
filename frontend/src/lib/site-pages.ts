import { Dictionary } from './dictionary-types';

export interface PageData {
  title: string;
  description?: string;
  label?: string; // Used for breadcrumbs if different from title
  isContainer?: boolean; // If true, this page is not clickable (just a parent)
}

export const getSitePages = (t: Dictionary): Record<string, PageData> => ({
  "/": {
    title: t.common.dashboard,
    description: t.sidebar.dashboardDescription,
    label: t.common.home,
  },
  "/admin": {
    title: t.sidebar.adminDashboard,
    description: t.sidebar.adminDashboardDescription,
    label: t.sidebar.admin,
    isContainer: true,
  },
  "/admin/employees": {
    title: t.employees.title,
    description: t.sidebar.employeesDescription,
    label: t.employees.title,
  },
  "/admin/projects": {
    title: t.projects.title,
    description: t.sidebar.projectsDescription,
    label: t.projects.title,
  },
  "/work-records": {
    title: t.workRecords.title,
    description: t.sidebar.workRecordsDescription,
    label: t.sidebar.records,
  },
  "/overtime": {
    title: t.overtime.title,
    description: t.sidebar.overtimeDescription,
    label: t.overtime.title,
  },
  "/reports": {
    title: t.reports.title,
    description: t.sidebar.reportsDescription,
    label: t.reports.title,
    isContainer: true,
  },
  "/reports/work-list": {
    title: t.reports.workList,
    description: t.sidebar.workListDescription,
    label: t.reports.workList,
  },
  "/reports/work-report": {
    title: t.reports.workReport,
    description: t.sidebar.workReportDescription,
    label: t.reports.workReport,
  },
  "/balances": {
    title: t.balances.title,
    description: t.sidebar.balancesDescription,
    label: t.balances.title,
  },
  "/data": {
    title: t.data.title,
    description: t.sidebar.dataDescription,
    label: t.data.title,
  },
});
