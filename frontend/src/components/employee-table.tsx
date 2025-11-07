'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Employee } from '@/graphql/queries/employees';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type SortColumn = keyof Employee;
type SortDirection = 'asc' | 'desc';

interface EmployeeTableProps {
  employees: Employee[];
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('fullName');
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
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-muted/50">
          <TableHead
            className="cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={() => handleSort('fullName')}
          >
            <div className="flex items-center gap-2">
              Name
              <SortIndicator column="fullName" />
            </div>
          </TableHead>
          <TableHead
            className="cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={() => handleSort('vacationDays')}
          >
            <div className="flex items-center gap-2">
              Vacation Days
              <SortIndicator column="vacationDays" />
            </div>
          </TableHead>
          <TableHead
            className="cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={() => handleSort('isAdmin')}
          >
            <div className="flex items-center gap-2">
              Admin
              <SortIndicator column="isAdmin" />
            </div>
          </TableHead>
          <TableHead
            className="cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={() => handleSort('employeeType')}
          >
            <div className="flex items-center gap-2">
              Employee Type
              <SortIndicator column="employeeType" />
            </div>
          </TableHead>
          <TableHead
            className="cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={() => handleSort('lastRecordDate')}
          >
            <div className="flex items-center gap-2">
              Last Record
              <SortIndicator column="lastRecordDate" />
            </div>
          </TableHead>
          <TableHead
            className="cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={() => handleSort('lockedUntil')}
          >
            <div className="flex items-center gap-2">
              Locked Until
              <SortIndicator column="lockedUntil" />
            </div>
          </TableHead>
          <TableHead
            className="cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={() => handleSort('titlePrefix')}
          >
            <div className="flex items-center gap-2">
              Title Prefix
              <SortIndicator column="titlePrefix" />
            </div>
          </TableHead>
          <TableHead
            className="cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={() => handleSort('titleSuffix')}
          >
            <div className="flex items-center gap-2">
              Title Suffix
              <SortIndicator column="titleSuffix" />
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedEmployees.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell className="min-w-[150px]">{employee.fullName}</TableCell>
            <TableCell className="w-[100px]">{employee.vacationDays.toFixed(1)}</TableCell>
            <TableCell className="w-[80px]">
              {employee.isAdmin ? (
                <Badge variant="default" className="bg-green-50 text-green-700 border-green-600/20">
                  Admin
                </Badge>
              ) : (
                <Badge variant="secondary">No</Badge>
              )}
            </TableCell>
            <TableCell className="w-[120px]">{employee.employeeType}</TableCell>
            <TableCell className="w-[120px]">{formatDate(employee.lastRecordDate)}</TableCell>
            <TableCell className="w-[120px]">{formatDate(employee.lockedUntil)}</TableCell>
            <TableCell className="w-[100px] text-muted-foreground">{employee.titlePrefix || '—'}</TableCell>
            <TableCell className="w-[100px] text-muted-foreground">{employee.titleSuffix || '—'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
  );
}
