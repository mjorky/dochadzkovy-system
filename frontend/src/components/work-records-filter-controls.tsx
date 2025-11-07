'use client';

import { useEffect, useDeferredValue, useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { WorkRecordsFilterState } from '@/types/work-records-filters';
import { DatePicker } from '@/components/ui/date-picker';
import { MultiSelect } from '@/components/ui/multi-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ProjectOption,
  AbsenceTypeOption,
  ProductivityTypeOption,
  WorkTypeOption,
} from '@/graphql/queries/work-records';

interface WorkRecordsFilterControlsProps {
  filters: WorkRecordsFilterState;
  onFilterChange: (filters: WorkRecordsFilterState) => void;
  projects: ProjectOption[];
  absenceTypes: AbsenceTypeOption[];
  productivityTypes: ProductivityTypeOption[];
  workTypes: WorkTypeOption[];
  availableLockStatuses: { hasLocked: boolean; hasUnlocked: boolean };
  availableTripFlags: { hasYes: boolean; hasNo: boolean };
}

export function WorkRecordsFilterControls({
  filters,
  onFilterChange,
  projects,
  absenceTypes,
  productivityTypes,
  workTypes,
  availableLockStatuses,
  availableTripFlags,
}: WorkRecordsFilterControlsProps) {
  // Debounce search text
  const deferredSearchText = useDeferredValue(filters.searchText);

  // Handle "Show whole month" checkbox
  useEffect(() => {
    if (filters.showWholeMonth && filters.fromDate) {
      const firstDay = new Date(filters.fromDate.getFullYear(), filters.fromDate.getMonth(), 1);
      const lastDay = new Date(filters.fromDate.getFullYear(), filters.fromDate.getMonth() + 1, 0);
      onFilterChange({
        ...filters,
        fromDate: firstDay,
        toDate: lastDay,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.showWholeMonth]);

  // Update parent when deferred search text changes
  useEffect(() => {
    if (deferredSearchText !== filters.searchText) {
      onFilterChange({
        ...filters,
        searchText: deferredSearchText,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredSearchText]);

  return (
    <div className="p-3 bg-card rounded-lg border border-border mb-4">
      {/* First Row: Date Range + Checkbox + Search */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">
        {/* From Date */}
        <div className="md:col-span-3">
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            From Date
          </label>
          <DatePicker
            value={filters.fromDate}
            onChange={(date) => onFilterChange({ ...filters, fromDate: date })}
            placeholder="Start date"
          />
        </div>

        {/* To Date */}
        <div className="md:col-span-3">
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            To Date
          </label>
          <DatePicker
            value={filters.toDate}
            onChange={(date) => onFilterChange({ ...filters, toDate: date })}
            placeholder="End date"
          />
        </div>

        {/* Show Whole Month Checkbox */}
        <div className="md:col-span-2 flex items-end">
          <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer h-9">
            <Checkbox
              checked={filters.showWholeMonth}
              onCheckedChange={(checked) => onFilterChange({ ...filters, showWholeMonth: checked === true })}
            />
            Whole month
          </label>
        </div>

        {/* Search */}
        <div className="md:col-span-4">
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search description..."
              value={filters.searchText}
              onChange={(e) => onFilterChange({ ...filters, searchText: e.target.value })}
              className="pl-10 pr-10 h-9"
            />
            {filters.searchText && (
              <button
                onClick={() => onFilterChange({ ...filters, searchText: '' })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Second Row: All Dropdowns */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <MultiSelect
          label="Projects"
          options={projects.map((p) => ({ value: p.id, label: p.number }))}
          selectedValues={filters.selectedProjects}
          onChange={(selectedProjects) => onFilterChange({ ...filters, selectedProjects })}
          placeholder="All projects"
        />
        <MultiSelect
          label="Absence"
          options={absenceTypes.map((a) => ({ value: a.id, label: a.alias }))}
          selectedValues={filters.selectedAbsenceTypes}
          onChange={(selectedAbsenceTypes) => onFilterChange({ ...filters, selectedAbsenceTypes })}
          placeholder="All types"
        />
        <MultiSelect
          label="Productivity"
          options={productivityTypes.map((p) => ({ value: p.id, label: p.hourType }))}
          selectedValues={filters.selectedProductivityTypes}
          onChange={(selectedProductivityTypes) => onFilterChange({ ...filters, selectedProductivityTypes })}
          placeholder="All types"
        />
        <MultiSelect
          label="Work Type"
          options={workTypes.map((w) => ({ value: w.id, label: w.hourType }))}
          selectedValues={filters.selectedWorkTypes}
          onChange={(selectedWorkTypes) => onFilterChange({ ...filters, selectedWorkTypes })}
          placeholder="All types"
        />
        {/* Only show Lock Status filter if both locked and unlocked records exist */}
        {availableLockStatuses.hasLocked && availableLockStatuses.hasUnlocked && (
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Lock Status
            </label>
            <Select
              value={filters.lockStatus}
              onValueChange={(value) => onFilterChange({ ...filters, lockStatus: value as 'all' | 'locked' | 'unlocked' })}
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
                <SelectItem value="unlocked">Unlocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {/* Only show Trip Flag filter if both yes and no values exist */}
        {availableTripFlags.hasYes && availableTripFlags.hasNo && (
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Trip Flag
            </label>
            <Select
              value={filters.tripFlag}
              onValueChange={(value) => onFilterChange({ ...filters, tripFlag: value as 'all' | 'yes' | 'no' })}
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}
