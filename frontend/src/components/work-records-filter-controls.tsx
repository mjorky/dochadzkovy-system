'use client';

import { useEffect, useDeferredValue, useState } from 'react';
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
  onFilterChange: (filters: WorkRecordsFilterState) => void;
  projects: ProjectOption[];
  absenceTypes: AbsenceTypeOption[];
  productivityTypes: ProductivityTypeOption[];
  workTypes: WorkTypeOption[];
}

export function WorkRecordsFilterControls({
  onFilterChange,
  projects,
  absenceTypes,
  productivityTypes,
  workTypes,
}: WorkRecordsFilterControlsProps) {
  // Initialize with default date range: last 31 days
  const today = new Date();
  const thirtyOneDaysAgo = new Date();
  thirtyOneDaysAgo.setDate(today.getDate() - 31);

  const [fromDate, setFromDate] = useState<Date | null>(thirtyOneDaysAgo);
  const [toDate, setToDate] = useState<Date | null>(today);
  const [showWholeMonth, setShowWholeMonth] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedAbsenceTypes, setSelectedAbsenceTypes] = useState<string[]>([]);
  const [selectedProductivityTypes, setSelectedProductivityTypes] = useState<string[]>([]);
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>([]);
  const [lockStatus, setLockStatus] = useState<'all' | 'locked' | 'unlocked'>('all');
  const [tripFlag, setTripFlag] = useState<'all' | 'yes' | 'no'>('all');

  // Debounce search text
  const deferredSearchText = useDeferredValue(searchText);

  // Handle "Show whole month" checkbox
  useEffect(() => {
    if (showWholeMonth && fromDate) {
      const firstDay = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
      const lastDay = new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 0);
      setFromDate(firstDay);
      setToDate(lastDay);
    }
  }, [showWholeMonth]);

  // Update filters when any value changes
  useEffect(() => {
    onFilterChange({
      fromDate,
      toDate,
      showWholeMonth,
      searchText: deferredSearchText,
      selectedProjects,
      selectedAbsenceTypes,
      selectedProductivityTypes,
      selectedWorkTypes,
      lockStatus,
      tripFlag,
    });
  }, [
    fromDate,
    toDate,
    showWholeMonth,
    deferredSearchText,
    selectedProjects,
    selectedAbsenceTypes,
    selectedProductivityTypes,
    selectedWorkTypes,
    lockStatus,
    tripFlag,
    onFilterChange,
  ]);

  const handleSearchChange = (value: string) => {
    setSearchText(value);
  };

  const handleClearSearch = () => {
    setSearchText('');
  };

  return (
    <div className="p-4 bg-card rounded-lg border border-border mb-6">
      {/* Date Range Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            From Date
          </label>
          <DatePicker
            value={fromDate}
            onChange={setFromDate}
            placeholder="Select start date"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            To Date
          </label>
          <DatePicker
            value={toDate}
            onChange={setToDate}
            placeholder="Select end date"
          />
        </div>
      </div>

      {/* Show Whole Month Checkbox */}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
          <Checkbox
            checked={showWholeMonth}
            onCheckedChange={(checked) => setShowWholeMonth(checked === true)}
          />
          Show whole month
        </label>
      </div>

      {/* Text Search */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-1">
          Search Description
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by description..."
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchText && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Multi-Select Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <MultiSelect
          label="Projects"
          options={projects.map((p) => ({ value: p.id, label: p.number }))}
          selectedValues={selectedProjects}
          onChange={setSelectedProjects}
          placeholder="All projects"
        />
        <MultiSelect
          label="Absence Types"
          options={absenceTypes.map((a) => ({ value: a.id, label: a.alias }))}
          selectedValues={selectedAbsenceTypes}
          onChange={setSelectedAbsenceTypes}
          placeholder="All absence types"
        />
        <MultiSelect
          label="Productivity Types"
          options={productivityTypes.map((p) => ({ value: p.id, label: p.hourType }))}
          selectedValues={selectedProductivityTypes}
          onChange={setSelectedProductivityTypes}
          placeholder="All productivity types"
        />
        <MultiSelect
          label="Work Types"
          options={workTypes.map((w) => ({ value: w.id, label: w.hourType }))}
          selectedValues={selectedWorkTypes}
          onChange={setSelectedWorkTypes}
          placeholder="All work types"
        />
      </div>

      {/* Single-Select Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Lock Status
          </label>
          <Select
            value={lockStatus}
            onValueChange={(value) => setLockStatus(value as 'all' | 'locked' | 'unlocked')}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="locked">Locked Only</SelectItem>
              <SelectItem value="unlocked">Unlocked Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Trip Flag
          </label>
          <Select
            value={tripFlag}
            onValueChange={(value) => setTripFlag(value as 'all' | 'yes' | 'no')}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="yes">Yes Only</SelectItem>
              <SelectItem value="no">No Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
