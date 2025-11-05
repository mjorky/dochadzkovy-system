'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { Loader2, XCircle, Calendar } from 'lucide-react';
import {
  GET_WORK_RECORDS,
  GET_ACTIVE_PROJECTS,
  GET_ABSENCE_TYPES,
  GET_PRODUCTIVITY_TYPES,
  GET_WORK_TYPES,
  WorkRecordsData,
  ActiveProjectsData,
  AbsenceTypesData,
  ProductivityTypesData,
  WorkTypesData,
  WorkRecord,
} from '@/graphql/queries/work-records';
import { WorkRecordsTable } from '@/components/work-records-table';
import { WorkRecordsFilterControls } from '@/components/work-records-filter-controls';
import { FilterChips } from '@/components/filter-chips';
import { EmployeeSelector } from '@/components/employee-selector';
import { WorkRecordsFilterState } from '@/types/work-records-filters';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';

// Mock user context - in real app, this would come from auth context
// TODO: Replace with actual auth context when available
// Using Milan Šmotlák (ID=2) as default - has work records table t_Milan_Smotlak
const mockUser = {
  id: '2',
  isAdmin: true, // Change to false to test regular employee view
  isManager: false,
};

export default function WorkRecordsPage() {
  // Initialize default date range: last 31 days
  const today = new Date();
  const thirtyOneDaysAgo = new Date();
  thirtyOneDaysAgo.setDate(today.getDate() - 31);

  // Employee selection state (for managers/admins)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(mockUser.id);

  // Work records state
  const [allRecords, setAllRecords] = useState<WorkRecord[]>([]);
  const [offset, setOffset] = useState(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Filter state - default to last 31 days
  const [filters, setFilters] = useState<WorkRecordsFilterState>({
    fromDate: thirtyOneDaysAgo,
    toDate: today,
    showWholeMonth: false,
    searchText: '',
    selectedProjects: [],
    selectedAbsenceTypes: [],
    selectedProductivityTypes: [],
    selectedWorkTypes: [],
    lockStatus: 'all',
    tripFlag: 'all',
  });

  // Format dates for GraphQL query (ISO string)
  const formatDateForQuery = (date: Date | null): string => {
    if (!date) return new Date().toISOString().split('T')[0];
    return date.toISOString().split('T')[0];
  };

  // Fetch work records with pagination
  const {
    loading: recordsLoading,
    error: recordsError,
    data: recordsData,
    refetch: refetchRecords,
    fetchMore,
  } = useQuery<WorkRecordsData>(GET_WORK_RECORDS, {
    variables: {
      employeeId: parseInt(selectedEmployeeId, 10),
      fromDate: formatDateForQuery(filters.fromDate),
      toDate: formatDateForQuery(filters.toDate),
      limit: 50,
      offset: 0,
    },
  });

  // Update records when query data changes (replaces deprecated onCompleted)
  useEffect(() => {
    if (recordsData?.getWorkRecords.records) {
      setAllRecords(recordsData.getWorkRecords.records);
      setOffset(recordsData.getWorkRecords.records.length);
    }
  }, [recordsData]);

  // Fetch catalog data for filter dropdowns
  const { data: projectsData } = useQuery<ActiveProjectsData>(GET_ACTIVE_PROJECTS);
  const { data: absenceTypesData } = useQuery<AbsenceTypesData>(GET_ABSENCE_TYPES);
  const { data: productivityTypesData } = useQuery<ProductivityTypesData>(
    GET_PRODUCTIVITY_TYPES
  );
  const { data: workTypesData } = useQuery<WorkTypesData>(GET_WORK_TYPES);

  // Handle fetching more records (infinite scroll)
  const handleFetchMore = useCallback(async () => {
    if (
      !recordsData?.getWorkRecords.hasMore ||
      isFetchingMore ||
      recordsLoading
    ) {
      return;
    }

    setIsFetchingMore(true);

    try {
      const result = await fetchMore({
        variables: {
          employeeId: parseInt(selectedEmployeeId, 10),
          fromDate: formatDateForQuery(filters.fromDate),
          toDate: formatDateForQuery(filters.toDate),
          limit: 50,
          offset,
        },
      });

      if (result.data?.getWorkRecords.records) {
        // Append new records to existing ones
        setAllRecords((prev) => [
          ...prev,
          ...result.data.getWorkRecords.records,
        ]);
        setOffset((prev) => prev + result.data.getWorkRecords.records.length);
      }
    } catch (error) {
      console.error('Error fetching more records:', error);
    } finally {
      setIsFetchingMore(false);
    }
  }, [
    recordsData?.getWorkRecords.hasMore,
    isFetchingMore,
    recordsLoading,
    fetchMore,
    selectedEmployeeId,
    filters.fromDate,
    filters.toDate,
    offset,
  ]);

  // Use infinite scroll hook
  const observerTarget = useInfiniteScroll({
    fetchMore: handleFetchMore,
    hasMore: recordsData?.getWorkRecords.hasMore || false,
    isLoading: isFetchingMore || recordsLoading,
  });

  // Handle employee change (for managers/admins)
  const handleEmployeeChange = useCallback(
    (employeeId: string) => {
      setSelectedEmployeeId(employeeId);
      setAllRecords([]);
      setOffset(0);
      // Refetch will be triggered automatically by useQuery when variables change
      refetchRecords({
        employeeId: parseInt(employeeId, 10),
        fromDate: formatDateForQuery(filters.fromDate),
        toDate: formatDateForQuery(filters.toDate),
        limit: 50,
        offset: 0,
      });
    },
    [refetchRecords, filters.fromDate, filters.toDate]
  );

  // Handle filter changes
  const handleFilterChange = useCallback(
    (newFilters: WorkRecordsFilterState) => {
      // Check if date range changed (requires refetch)
      const dateRangeChanged =
        newFilters.fromDate?.getTime() !== filters.fromDate?.getTime() ||
        newFilters.toDate?.getTime() !== filters.toDate?.getTime();

      setFilters(newFilters);

      // If date range changed, reset and refetch
      if (dateRangeChanged) {
        setAllRecords([]);
        setOffset(0);
        refetchRecords({
          employeeId: parseInt(selectedEmployeeId, 10),
          fromDate: formatDateForQuery(newFilters.fromDate),
          toDate: formatDateForQuery(newFilters.toDate),
          limit: 50,
          offset: 0,
        });
      }
    },
    [filters.fromDate, filters.toDate, refetchRecords, selectedEmployeeId]
  );

  // Client-side filtering logic (OR within category, AND between categories)
  const filteredRecords = useMemo(() => {
    return allRecords.filter((record) => {
      // Text search (Description field)
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        if (!record.description?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Project filter (OR logic within category)
      // Note: projectId needs to be extracted from the record
      // Since backend returns project number (string), we need to compare differently
      // For now, filter by project name/number string comparison
      if (filters.selectedProjects.length > 0) {
        // This will need adjustment based on how backend returns project IDs
        // For now, skip project filtering in client-side
        // (ideally, backend should include projectId field)
      }

      // Absence Type filter (OR logic within category)
      if (filters.selectedAbsenceTypes.length > 0) {
        // Similar issue - need absenceTypeId from backend
      }

      // Productivity Type filter (OR logic within category)
      if (filters.selectedProductivityTypes.length > 0) {
        // Similar issue - need productivityTypeId from backend
      }

      // Work Type filter (OR logic within category)
      if (filters.selectedWorkTypes.length > 0) {
        // Similar issue - need workTypeId from backend
      }

      // Lock Status filter
      if (filters.lockStatus === 'locked' && !record.isLocked) {
        return false;
      }
      if (filters.lockStatus === 'unlocked' && record.isLocked) {
        return false;
      }

      // Trip Flag filter
      if (filters.tripFlag === 'yes' && !record.isTripFlag) {
        return false;
      }
      if (filters.tripFlag === 'no' && record.isTripFlag) {
        return false;
      }

      // All filters passed (AND logic between categories)
      return true;
    });
  }, [allRecords, filters]);

  // Handle removing individual filter
  const handleRemoveFilter = useCallback(
    (filterType: string, value?: string) => {
      const newFilters = { ...filters };

      switch (filterType) {
        case 'searchText':
          newFilters.searchText = '';
          break;
        case 'selectedProjects':
          newFilters.selectedProjects = newFilters.selectedProjects.filter(
            (id) => id !== value
          );
          break;
        case 'selectedAbsenceTypes':
          newFilters.selectedAbsenceTypes =
            newFilters.selectedAbsenceTypes.filter((id) => id !== value);
          break;
        case 'selectedProductivityTypes':
          newFilters.selectedProductivityTypes =
            newFilters.selectedProductivityTypes.filter((id) => id !== value);
          break;
        case 'selectedWorkTypes':
          newFilters.selectedWorkTypes = newFilters.selectedWorkTypes.filter(
            (id) => id !== value
          );
          break;
        case 'lockStatus':
          newFilters.lockStatus = 'all';
          break;
        case 'tripFlag':
          newFilters.tripFlag = 'all';
          break;
        default:
          break;
      }

      setFilters(newFilters);
    },
    [filters]
  );

  // Handle clearing all filters
  const handleClearAllFilters = useCallback(() => {
    // Reset all filters except date range
    setFilters({
      ...filters,
      searchText: '',
      selectedProjects: [],
      selectedAbsenceTypes: [],
      selectedProductivityTypes: [],
      selectedWorkTypes: [],
      lockStatus: 'all',
      tripFlag: 'all',
    });
  }, [filters]);

  // Loading state
  if (recordsLoading && allRecords.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (recordsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4 max-w-md p-6 bg-card rounded-lg border border-destructive shadow-md">
          <XCircle className="h-12 w-12 text-destructive" />
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Failed to load work records
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {recordsError.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => refetchRecords()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  const hasActiveFilters =
    filters.searchText !== '' ||
    filters.selectedProjects.length > 0 ||
    filters.selectedAbsenceTypes.length > 0 ||
    filters.selectedProductivityTypes.length > 0 ||
    filters.selectedWorkTypes.length > 0 ||
    filters.lockStatus !== 'all' ||
    filters.tripFlag !== 'all';

  return (
    <div className="p-8">
      {/* Breadcrumb navigation */}
      <nav className="text-sm text-muted-foreground mb-2">
        <span>Home</span>
        <span className="mx-2">&gt;</span>
        <span className="text-foreground font-medium">Work Records</span>
      </nav>

      {/* Page title */}
      <h1 className="text-3xl font-bold text-foreground mb-6">Work Records</h1>

      {/* Employee selector (for managers/admins only) */}
      <EmployeeSelector
        currentEmployeeId={selectedEmployeeId}
        onEmployeeChange={handleEmployeeChange}
        isAdmin={mockUser.isAdmin}
        isManager={mockUser.isManager}
      />

      {/* Filter controls */}
      <WorkRecordsFilterControls
        onFilterChange={handleFilterChange}
        projects={projectsData?.getActiveProjects || []}
        absenceTypes={absenceTypesData?.getAbsenceTypes || []}
        productivityTypes={productivityTypesData?.getProductivityTypes || []}
        workTypes={workTypesData?.getWorkTypes || []}
      />

      {/* Active filter chips */}
      <FilterChips
        filters={filters}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
        projects={projectsData?.getActiveProjects || []}
        absenceTypes={absenceTypesData?.getAbsenceTypes || []}
        productivityTypes={productivityTypesData?.getProductivityTypes || []}
        workTypes={workTypesData?.getWorkTypes || []}
      />

      {/* Empty state after filtering */}
      {filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <Calendar className="h-16 w-16 text-muted-foreground" />
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {hasActiveFilters
                ? 'No records match your filters'
                : 'No work records found'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters
                ? 'Try adjusting your filters to see more results'
                : 'No work records found for the selected date range'}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Record count */}
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredRecords.length} of{' '}
            {recordsData?.getWorkRecords.totalCount || allRecords.length} records
          </div>

          {/* Work records table */}
          <WorkRecordsTable workRecords={filteredRecords} />

          {/* Infinite scroll sentinel */}
          {recordsData?.getWorkRecords.hasMore && (
            <div ref={observerTarget} className="py-8 text-center">
              {isFetchingMore && (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Loading more...
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
