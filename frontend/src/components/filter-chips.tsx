'use client';

import { X } from 'lucide-react';
import { WorkRecordsFilterState } from '@/types/work-records-filters';
import {
  ProjectOption,
  AbsenceTypeOption,
  ProductivityTypeOption,
  WorkTypeOption,
} from '@/graphql/queries/work-records';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface FilterChipsProps {
  filters: WorkRecordsFilterState;
  onRemoveFilter: (filterType: string, value?: string) => void;
  onClearAll: () => void;
  projects: ProjectOption[];
  absenceTypes: AbsenceTypeOption[];
  productivityTypes: ProductivityTypeOption[];
  workTypes: WorkTypeOption[];
}

export function FilterChips({
  filters,
  onRemoveFilter,
  onClearAll,
  projects,
  absenceTypes,
  productivityTypes,
  workTypes,
}: FilterChipsProps) {
  const hasActiveFilters =
    filters.searchText ||
    filters.selectedProjects.length > 0 ||
    filters.selectedAbsenceTypes.length > 0 ||
    filters.selectedProductivityTypes.length > 0 ||
    filters.selectedWorkTypes.length > 0 ||
    filters.lockStatus !== 'all' ||
    filters.tripFlag !== 'all';

  if (!hasActiveFilters) {
    return null;
  }

  const getLabel = (id: string, options: { id: string; label: string }[]) => {
    return options.find((opt) => opt.id === id)?.label || id;
  };

  const projectOptions = projects.map((p) => ({ id: p.id, label: p.number }));
  const absenceTypeOptions = absenceTypes.map((a) => ({ id: a.id, label: a.alias }));
  const productivityTypeOptions = productivityTypes.map((p) => ({ id: p.id, label: p.hourType }));
  const workTypeOptions = workTypes.map((w) => ({ id: w.id, label: w.hourType }));

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-foreground">Active Filters:</span>

        {/* Search text chip */}
        {filters.searchText && (
          <Badge variant="secondary" className="gap-1 pl-3 pr-1">
            Description: "{filters.searchText}"
            <button
              onClick={() => onRemoveFilter('searchText')}
              className="hover:bg-secondary/80 rounded-full p-0.5 ml-1"
              aria-label="Remove search filter"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}

        {/* Project chips */}
        {filters.selectedProjects.map((projectId) => (
          <Badge key={projectId} variant="secondary" className="gap-1 pl-3 pr-1">
            Project: {getLabel(projectId, projectOptions)}
            <button
              onClick={() => onRemoveFilter('selectedProjects', projectId)}
              className="hover:bg-secondary/80 rounded-full p-0.5 ml-1"
              aria-label="Remove project filter"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {/* Absence type chips */}
        {filters.selectedAbsenceTypes.map((absenceTypeId) => (
          <Badge key={absenceTypeId} variant="secondary" className="gap-1 pl-3 pr-1">
            Absence: {getLabel(absenceTypeId, absenceTypeOptions)}
            <button
              onClick={() => onRemoveFilter('selectedAbsenceTypes', absenceTypeId)}
              className="hover:bg-secondary/80 rounded-full p-0.5 ml-1"
              aria-label="Remove absence type filter"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {/* Productivity type chips */}
        {filters.selectedProductivityTypes.map((productivityTypeId) => (
          <Badge key={productivityTypeId} variant="secondary" className="gap-1 pl-3 pr-1">
            Productivity: {getLabel(productivityTypeId, productivityTypeOptions)}
            <button
              onClick={() => onRemoveFilter('selectedProductivityTypes', productivityTypeId)}
              className="hover:bg-secondary/80 rounded-full p-0.5 ml-1"
              aria-label="Remove productivity type filter"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {/* Work type chips */}
        {filters.selectedWorkTypes.map((workTypeId) => (
          <Badge key={workTypeId} variant="secondary" className="gap-1 pl-3 pr-1">
            Work Type: {getLabel(workTypeId, workTypeOptions)}
            <button
              onClick={() => onRemoveFilter('selectedWorkTypes', workTypeId)}
              className="hover:bg-secondary/80 rounded-full p-0.5 ml-1"
              aria-label="Remove work type filter"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {/* Lock status chip */}
        {filters.lockStatus !== 'all' && (
          <Badge variant="secondary" className="gap-1 pl-3 pr-1">
            Lock Status: {filters.lockStatus === 'locked' ? 'Locked' : 'Unlocked'}
            <button
              onClick={() => onRemoveFilter('lockStatus')}
              className="hover:bg-secondary/80 rounded-full p-0.5 ml-1"
              aria-label="Remove lock status filter"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}

        {/* Trip flag chip */}
        {filters.tripFlag !== 'all' && (
          <Badge variant="secondary" className="gap-1 pl-3 pr-1">
            Trip Flag: {filters.tripFlag === 'yes' ? 'Yes' : 'No'}
            <button
              onClick={() => onRemoveFilter('tripFlag')}
              className="hover:bg-secondary/80 rounded-full p-0.5 ml-1"
              aria-label="Remove trip flag filter"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}

        {/* Clear all button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          className="ml-2"
        >
          Clear all filters
        </Button>
      </div>
    </div>
  );
}
