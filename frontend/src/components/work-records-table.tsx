'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, Lock, Moon } from 'lucide-react';
import { WorkRecord } from '@/graphql/queries/work-records';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => handleSort('id')}>
            <div className="flex items-center gap-2">
              ID
              <SortIndicator column="id" />
            </div>
          </TableHead>
          <TableHead className="cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => handleSort('date')}>
            <div className="flex items-center gap-2">
              Date
              <SortIndicator column="date" />
            </div>
          </TableHead>
          <TableHead className="cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => handleSort('absenceType')}>
            <div className="flex items-center gap-2">
              Absence Type
              <SortIndicator column="absenceType" />
            </div>
          </TableHead>
          <TableHead className="cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => handleSort('project')}>
            <div className="flex items-center gap-2">
              Project
              <SortIndicator column="project" />
            </div>
          </TableHead>
          <TableHead className="cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => handleSort('productivityType')}>
            <div className="flex items-center gap-2">
              Productivity Type
              <SortIndicator column="productivityType" />
            </div>
          </TableHead>
          <TableHead className="cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => handleSort('workType')}>
            <div className="flex items-center gap-2">
              Work Type
              <SortIndicator column="workType" />
            </div>
          </TableHead>
          <TableHead className="cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => handleSort('startTime')}>
            <div className="flex items-center gap-2">
              Start Time
              <SortIndicator column="startTime" />
            </div>
          </TableHead>
          <TableHead className="cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => handleSort('endTime')}>
            <div className="flex items-center gap-2">
              End Time
              <SortIndicator column="endTime" />
            </div>
          </TableHead>
          <TableHead className="cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => handleSort('hours')}>
            <div className="flex items-center gap-2">
              Hours
              <SortIndicator column="hours" />
            </div>
          </TableHead>
          <TableHead className="cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => handleSort('description')}>
            <div className="flex items-center gap-2">
              Description
              <SortIndicator column="description" />
            </div>
          </TableHead>
          <TableHead className="cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => handleSort('km')}>
            <div className="flex items-center gap-2">
              KM
              <SortIndicator column="km" />
            </div>
          </TableHead>
          <TableHead className="cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => handleSort('isTripFlag')}>
            <div className="flex items-center gap-2">
              Trip Flag
              <SortIndicator column="isTripFlag" />
            </div>
          </TableHead>
          <TableHead className="cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => handleSort('isLocked')}>
            <div className="flex items-center gap-2">
              Lock Status
              <SortIndicator column="isLocked" />
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedRecords.map((record) => (
          <TableRow
            key={record.id}
            className={record.isLocked ? 'opacity-50 cursor-not-allowed' : ''}
          >
            <TableCell className="w-20">{record.id}</TableCell>
            <TableCell className="min-w-[120px]">{formatDate(record.date)}</TableCell>
            <TableCell className="min-w-[120px]">{record.absenceType}</TableCell>
            <TableCell className="min-w-[100px]">{record.project ?? '—'}</TableCell>
            <TableCell className="min-w-[140px]">{record.productivityType ?? '—'}</TableCell>
            <TableCell className="min-w-[120px]">{record.workType ?? '—'}</TableCell>
            <TableCell className="w-[100px]">{formatTime(record.startTime)}</TableCell>
            <TableCell className="w-[100px]">
              <div className="flex items-center gap-2">
                {formatTime(record.endTime)}
                {record.isOvernightShift && (
                  <span title="Overnight shift">
                    <Moon className="h-4 w-4 text-blue-500" />
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell className="w-[80px]">{record.hours.toFixed(2)}</TableCell>
            <TableCell className="min-w-[150px] text-muted-foreground">{record.description || '—'}</TableCell>
            <TableCell className="w-[70px]">{record.km}</TableCell>
            <TableCell className="w-[80px]">
              {record.isTripFlag ? (
                <Badge variant="default" className="bg-blue-50 text-blue-700 border-blue-600/20">Yes</Badge>
              ) : (
                <Badge variant="secondary">No</Badge>
              )}
            </TableCell>
            <TableCell className="w-[80px]">
              {record.isLocked && (
                <span title="Locked">
                  <Lock className="h-4 w-4 text-red-500" />
                </span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
