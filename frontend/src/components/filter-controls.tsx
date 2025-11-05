'use client';

import { useDeferredValue, useState } from 'react';
import { Search } from 'lucide-react';

export interface FilterState {
  searchText: string;
  adminFilter: 'all' | 'admin' | 'non-admin';
  employeeTypeFilter: string;
}

interface FilterControlsProps {
  onFilterChange: (filters: FilterState) => void;
}

export function FilterControls({ onFilterChange }: FilterControlsProps) {
  const [searchText, setSearchText] = useState('');
  const [adminFilter, setAdminFilter] = useState<FilterState['adminFilter']>('all');
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState('all');

  // Debounce search text
  const deferredSearchText = useDeferredValue(searchText);

  // Notify parent of filter changes
  const handleSearchChange = (value: string) => {
    setSearchText(value);
    // The actual filter will use the deferred value
  };

  const handleAdminFilterChange = (value: FilterState['adminFilter']) => {
    setAdminFilter(value);
    onFilterChange({
      searchText: deferredSearchText,
      adminFilter: value,
      employeeTypeFilter,
    });
  };

  const handleTypeFilterChange = (value: string) => {
    setEmployeeTypeFilter(value);
    onFilterChange({
      searchText: deferredSearchText,
      adminFilter,
      employeeTypeFilter: value,
    });
  };

  // Update filters when deferred search text changes
  if (deferredSearchText !== searchText) {
    // This will trigger on next render
    setTimeout(() => {
      onFilterChange({
        searchText: deferredSearchText,
        adminFilter,
        employeeTypeFilter,
      });
    }, 0);
  }

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-card rounded-lg border border-border mb-6">
      {/* Text Search */}
      <div className="flex-1 min-w-[250px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Admin Status Filter */}
      <div className="min-w-[180px]">
        <label className="block text-sm font-medium text-foreground mb-1">
          Admin Status
        </label>
        <select
          value={adminFilter}
          onChange={(e) => handleAdminFilterChange(e.target.value as FilterState['adminFilter'])}
          className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">All</option>
          <option value="admin">Admin Only</option>
          <option value="non-admin">Non-Admin Only</option>
        </select>
      </div>

      {/* Employee Type Filter */}
      <div className="min-w-[180px]">
        <label className="block text-sm font-medium text-foreground mb-1">
          Employee Type
        </label>
        <select
          value={employeeTypeFilter}
          onChange={(e) => handleTypeFilterChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">All</option>
          <option value="Zamestnanec">Zamestnanec</option>
          <option value="SZCO">SZCO</option>
          <option value="Študent">Študent</option>
          <option value="Brigádnik">Brigádnik</option>
        </select>
      </div>
    </div>
  );
}
