'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Employee } from '@/graphql/queries/employees';

type SortColumn = keyof Employee;
type SortDirection = 'asc' | 'desc';

interface EmployeeTableProps {
  employees: Employee[];
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedEmployees = [...employees].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
    if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

    // Compare values based on type
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      return sortDirection === 'asc'
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    }

    // String comparison
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    return sortDirection === 'asc'
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const SortIndicator = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-primary" />
    ) : (
      <ChevronDown className="h-4 w-4 text-primary" />
    );
  };

  return (
    <div className="rounded-lg border border-border bg-card shadow-md overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted border-b border-border">
            <th
              className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleSort('id')}
            >
              <div className="flex items-center gap-2">
                ID
                <SortIndicator column="id" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleSort('fullName')}
            >
              <div className="flex items-center gap-2">
                Name
                <SortIndicator column="fullName" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleSort('vacationDays')}
            >
              <div className="flex items-center gap-2">
                Vacation Days
                <SortIndicator column="vacationDays" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleSort('isAdmin')}
            >
              <div className="flex items-center gap-2">
                Admin
                <SortIndicator column="isAdmin" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleSort('employeeType')}
            >
              <div className="flex items-center gap-2">
                Employee Type
                <SortIndicator column="employeeType" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleSort('lastRecordDate')}
            >
              <div className="flex items-center gap-2">
                Last Record
                <SortIndicator column="lastRecordDate" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleSort('lockedUntil')}
            >
              <div className="flex items-center gap-2">
                Locked Until
                <SortIndicator column="lockedUntil" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleSort('titlePrefix')}
            >
              <div className="flex items-center gap-2">
                Title Prefix
                <SortIndicator column="titlePrefix" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleSort('titleSuffix')}
            >
              <div className="flex items-center gap-2">
                Title Suffix
                <SortIndicator column="titleSuffix" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedEmployees.map((employee) => (
            <tr
              key={employee.id}
              className="border-b border-border hover:bg-muted/50 transition-colors"
            >
              <td className="px-4 py-3 text-sm text-foreground w-20">
                {employee.id}
              </td>
              <td className="px-4 py-3 text-sm text-foreground min-w-[150px]">
                {employee.fullName}
              </td>
              <td className="px-4 py-3 text-sm text-foreground w-[100px]">
                {employee.vacationDays.toFixed(1)}
              </td>
              <td className="px-4 py-3 text-sm w-[80px]">
                {employee.isAdmin ? (
                  <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                    No
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-foreground w-[120px]">
                {employee.employeeType}
              </td>
              <td className="px-4 py-3 text-sm text-foreground w-[120px]">
                {formatDate(employee.lastRecordDate)}
              </td>
              <td className="px-4 py-3 text-sm text-foreground w-[120px]">
                {formatDate(employee.lockedUntil)}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground w-[100px]">
                {employee.titlePrefix || '—'}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground w-[100px]">
                {employee.titleSuffix || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
