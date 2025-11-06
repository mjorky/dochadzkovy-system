'use client';

import { useEffect, useDeferredValue, useState } from 'react';
import { Search, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

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

  // Update filters when deferred search text changes
  useEffect(() => {
    onFilterChange({
      searchText: deferredSearchText,
      adminFilter,
      employeeTypeFilter,
    });
  }, [deferredSearchText, adminFilter, employeeTypeFilter, onFilterChange]);

  // Notify parent of filter changes
  const handleSearchChange = (value: string) => {
    setSearchText(value);
  };

  const handleClearSearch = () => {
    setSearchText('');
  };

  const handleAdminFilterChange = (value: FilterState['adminFilter']) => {
    setAdminFilter(value);
  };

  const handleTypeFilterChange = (value: string) => {
    setEmployeeTypeFilter(value);
  };

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-card rounded-lg border border-border mb-6">
      {/* Text Search */}
      <div className="flex-1 min-w-[250px]">
        <label className="block text-sm font-medium text-foreground mb-1">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by name..."
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

      {/* Admin Status Filter */}
      <div className="min-w-[180px]">
        <label className="block text-sm font-medium text-foreground mb-1">
          Admin Status
        </label>
        <Select
          value={adminFilter}
          onValueChange={(value) => handleAdminFilterChange(value as FilterState['adminFilter'])}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="admin">Admin Only</SelectItem>
            <SelectItem value="non-admin">Non-Admin Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Employee Type Filter */}
      <div className="min-w-[180px]">
        <label className="block text-sm font-medium text-foreground mb-1">
          Employee Type
        </label>
        <Select
          value={employeeTypeFilter}
          onValueChange={handleTypeFilterChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Zamestnanec">Zamestnanec</SelectItem>
            <SelectItem value="SZCO">SZCO</SelectItem>
            <SelectItem value="Študent">Študent</SelectItem>
            <SelectItem value="Brigádnik">Brigádnik</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
