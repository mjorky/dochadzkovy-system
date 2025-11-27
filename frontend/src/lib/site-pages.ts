export interface PageData {
  title: string;
  description?: string;
  label?: string; // Used for breadcrumbs if different from title
}

export const sitePages: Record<string, PageData> = {
  "/": {
    title: "Dashboard",
    description: "Overview of your activity and stats.",
    label: "Home",
  },
  "/admin": {
    title: "Admin Dashboard",
    description: "Welcome to the admin panel. Use the menu to navigate.",
    label: "Admin",
  },
  "/admin/employees": {
    title: "Employees",
    description: "Manage user accounts and permissions.",
    label: "Employees",
  },
  "/admin/projects": {
    title: "Projects",
    description: "Manage company projects and assignments.",
    label: "Projects",
  },
  "/work-records": {
    title: "Work Records",
    description: "View and manage your daily work records.",
    label: "Records",
  },
  "/overtime": {
    title: "Overtime",
    description: "Track and manage overtime hours.",
    label: "Overtime",
  },
  "/reports": {
    title: "Reports",
    description: "Generate and view attendance reports.",
    label: "Reports",
  },
  "/reports/work-list": {
    title: "Work List",
    description: "Project-specific hour statistics.",
    label: "Work List",
  },
  "/reports/work-report": {
    title: "Work Report",
    description: "Monthly attendance report.",
    label: "Work Report",
  },
  "/balances": {
    title: "Balances",
    description: "View leave balances and time off.",
    label: "Balances",
  },
  "/data": {
    title: "Data Management",
    description: "Import and export system data.",
    label: "Data",
  },
};
