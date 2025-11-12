"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface ProjectFilterState {
  searchText: string
  activeFilter: 'all' | 'active' | 'inactive'
}

interface ProjectsFilterControlsProps {
  filters: ProjectFilterState
  onFilterChange: (newFilters: ProjectFilterState) => void
}

export function ProjectsFilterControls({ filters, onFilterChange }: ProjectsFilterControlsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-6">
      <div className="md:col-span-2">
        <Label htmlFor="search">Search Projects</Label>
        <Input
          id="search"
          placeholder="Search by name or number..."
          value={filters.searchText}
          onChange={(e) => onFilterChange({ ...filters, searchText: e.target.value })}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="activeFilter">Status</Label>
        <Select
          value={filters.activeFilter}
          onValueChange={(value) =>
            onFilterChange({
              ...filters,
              activeFilter: value as ProjectFilterState['activeFilter'],
            })
          }
        >
          <SelectTrigger id="activeFilter" className="mt-1">
            <SelectValue placeholder="Filter by status..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}