'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, Lock, Moon } from 'lucide-react';
import { WorkRecord } from '@/graphql/queries/work-records';

type SortColumn = keyof WorkRecord;
type SortDirection = 'asc' | 'desc';

interface WorkRecordsTableProps {
  workRecords: WorkRecord[];
}

export function WorkRecordsTable({ workRecords }: WorkRecordsTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction for same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column: reset to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedRecords = [...workRecords].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    // Handle null/undefined values - push to end
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    // Format HH:MM:SS to HH:MM
    return timeString.substring(0, 5);
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
              onClick={() => handleSort('date')}
            >
              <div className="flex items-center gap-2">
                Date
                <SortIndicator column="date" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleSort('absenceType')}
            >
              <div className="flex items-center gap-2">
                Absence Type
                <SortIndicator column="absenceType" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleSort('project')}
            >
              <div className="flex items-center gap-2">
                Project
                <SortIndicator column="project" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleSort('productivityType')}
            >
              <div className="flex items-center gap-2">
                Productivity Type
                <SortIndicator column="productivityType" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleSort('workType')}
            >
              <div className="flex items-center gap-2">
                Work Type
                <SortIndicator column="workType" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleSort('startTime')}
            >
              <div className="flex items-center gap-2">
                Start Time
                <SortIndicator column="startTime" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleSort('endTime')}
            >
              <div className="flex items-center gap-2">
                End Time
                <SortIndicator column="endTime" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleSort('hours')}
            >
              <div className="flex items-center gap-2">
                Hours
                <SortIndicator column="hours" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleSort('description')}
            >
              <div className="flex items-center gap-2">
                Description
                <SortIndicator column="description" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleSort('km')}
            >
              <div className="flex items-center gap-2">
                KM
                <SortIndicator column="km" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleSort('isTripFlag')}
            >
              <div className="flex items-center gap-2">
                Trip Flag
                <SortIndicator column="isTripFlag" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleSort('isLocked')}
            >
              <div className="flex items-center gap-2">
                Lock Status
                <SortIndicator column="isLocked" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedRecords.map((record) => (
            <tr
              key={record.id}
              className={`border-b border-border ${
                record.isLocked
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-muted/50'
              } transition-colors`}
            >
              <td className="px-4 py-3 text-sm text-foreground w-20">
                {record.id}
              </td>
              <td className="px-4 py-3 text-sm text-foreground min-w-[120px]">
                {formatDate(record.date)}
              </td>
              <td className="px-4 py-3 text-sm text-foreground min-w-[120px]">
                {record.absenceType}
              </td>
              <td className="px-4 py-3 text-sm text-foreground min-w-[100px]">
                {record.project ?? '—'}
              </td>
              <td className="px-4 py-3 text-sm text-foreground min-w-[140px]">
                {record.productivityType ?? '—'}
              </td>
              <td className="px-4 py-3 text-sm text-foreground min-w-[120px]">
                {record.workType ?? '—'}
              </td>
              <td className="px-4 py-3 text-sm text-foreground w-[100px]">
                {formatTime(record.startTime)}
              </td>
              <td className="px-4 py-3 text-sm text-foreground w-[100px]">
                <div className="flex items-center gap-2">
                  {formatTime(record.endTime)}
                  {record.isOvernightShift && (
                    <span title="Overnight shift">
                      <Moon className="h-4 w-4 text-blue-500" />
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-foreground w-[80px]">
                {record.hours.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground min-w-[150px]">
                {record.description || '—'}
              </td>
              <td className="px-4 py-3 text-sm text-foreground w-[70px]">
                {record.km}
              </td>
              <td className="px-4 py-3 text-sm w-[80px]">
                {record.isTripFlag ? (
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                    Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                    No
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-sm w-[80px]">
                {record.isLocked && (
                  <span title="Locked">
                    <Lock className="h-4 w-4 text-red-500" />
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
