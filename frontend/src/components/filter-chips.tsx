'use client';

import { X } from 'lucide-react';
import { WorkRecordsFilterState } from '@/types/work-records-filters';
import {
  ProjectOption,
  AbsenceTypeOption,
  ProductivityTypeOption,
  WorkTypeOption,
} from '@/graphql/queries/work-records';

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
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
            <span>Description: "{filters.searchText}"</span>
            <button
              onClick={() => onRemoveFilter('searchText')}
              className="hover:bg-primary/20 rounded-full p-0.5"
              aria-label="Remove search filter"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Project chips */}
        {filters.selectedProjects.map((projectId) => (
          <div
            key={projectId}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
          >
            <span>Project: {getLabel(projectId, projectOptions)}</span>
            <button
              onClick={() => onRemoveFilter('selectedProjects', projectId)}
              className="hover:bg-primary/20 rounded-full p-0.5"
              aria-label="Remove project filter"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Absence type chips */}
        {filters.selectedAbsenceTypes.map((absenceTypeId) => (
          <div
            key={absenceTypeId}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
          >
            <span>Absence: {getLabel(absenceTypeId, absenceTypeOptions)}</span>
            <button
              onClick={() => onRemoveFilter('selectedAbsenceTypes', absenceTypeId)}
              className="hover:bg-primary/20 rounded-full p-0.5"
              aria-label="Remove absence type filter"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Productivity type chips */}
        {filters.selectedProductivityTypes.map((productivityTypeId) => (
          <div
            key={productivityTypeId}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
          >
            <span>Productivity: {getLabel(productivityTypeId, productivityTypeOptions)}</span>
            <button
              onClick={() => onRemoveFilter('selectedProductivityTypes', productivityTypeId)}
              className="hover:bg-primary/20 rounded-full p-0.5"
              aria-label="Remove productivity type filter"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Work type chips */}
        {filters.selectedWorkTypes.map((workTypeId) => (
          <div
            key={workTypeId}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
          >
            <span>Work Type: {getLabel(workTypeId, workTypeOptions)}</span>
            <button
              onClick={() => onRemoveFilter('selectedWorkTypes', workTypeId)}
              className="hover:bg-primary/20 rounded-full p-0.5"
              aria-label="Remove work type filter"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Lock status chip */}
        {filters.lockStatus !== 'all' && (
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
            <span>
              Lock Status: {filters.lockStatus === 'locked' ? 'Locked' : 'Unlocked'}
            </span>
            <button
              onClick={() => onRemoveFilter('lockStatus')}
              className="hover:bg-primary/20 rounded-full p-0.5"
              aria-label="Remove lock status filter"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Trip flag chip */}
        {filters.tripFlag !== 'all' && (
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
            <span>Trip Flag: {filters.tripFlag === 'yes' ? 'Yes' : 'No'}</span>
            <button
              onClick={() => onRemoveFilter('tripFlag')}
              className="hover:bg-primary/20 rounded-full p-0.5"
              aria-label="Remove trip flag filter"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Clear all button */}
        <button
          onClick={onClearAll}
          className="ml-2 px-3 py-1 text-sm border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
}
