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
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Mock user context - in real app, this would come from auth context
// TODO: Replace with actual auth context when available
// Using Milan Šmotlák (ID=2) as default - has work records table t_Milan_Smotlak
const mockUser = {
  id: '2',
  isAdmin: true, // Change to false to test regular employee view
  isManager: false,
};

export default function WorkRecordsPage() {
  // Initialize default date range: last 31 days (computed once!)
  const initialDates = useMemo(() => {
    const today = new Date();
    const thirtyOneDaysAgo = new Date();
    thirtyOneDaysAgo.setDate(today.getDate() - 31);
    return { today, thirtyOneDaysAgo };
  }, []);

  // Employee selection state (for managers/admins)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(mockUser.id);

  // Work records state
  const [allRecords, setAllRecords] = useState<WorkRecord[]>([]);
  const [offset, setOffset] = useState(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Filter state - default to last 31 days
  const [filters, setFilters] = useState<WorkRecordsFilterState>({
    fromDate: initialDates.thirtyOneDaysAgo,
    toDate: initialDates.today,
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

  // Filter available options based on records in current date range
  const availableProjects = useMemo(() => {
    const uniqueProjectNumbers = new Set(
      allRecords.map((r) => r.project).filter(Boolean)
    );
    return (projectsData?.getActiveProjects || []).filter((p) =>
      uniqueProjectNumbers.has(p.number)
    );
  }, [allRecords, projectsData]);

  const availableAbsenceTypes = useMemo(() => {
    const uniqueAbsenceAliases = new Set(
      allRecords.map((r) => r.absenceType).filter(Boolean)
    );
    return (absenceTypesData?.getAbsenceTypes || []).filter((a) =>
      uniqueAbsenceAliases.has(a.alias)
    );
  }, [allRecords, absenceTypesData]);

  const availableProductivityTypes = useMemo(() => {
    const uniqueProductivityHourTypes = new Set(
      allRecords.map((r) => r.productivityType).filter(Boolean)
    );
    return (productivityTypesData?.getProductivityTypes || []).filter((p) =>
      uniqueProductivityHourTypes.has(p.hourType)
    );
  }, [allRecords, productivityTypesData]);

  const availableWorkTypes = useMemo(() => {
    const uniqueWorkHourTypes = new Set(
      allRecords.map((r) => r.workType).filter(Boolean)
    );
    return (workTypesData?.getWorkTypes || []).filter((w) =>
      uniqueWorkHourTypes.has(w.hourType)
    );
  }, [allRecords, workTypesData]);

  // Check which lock statuses exist in current data
  const availableLockStatuses = useMemo(() => {
    const hasLocked = allRecords.some((r) => r.isLocked);
    const hasUnlocked = allRecords.some((r) => !r.isLocked);
    return { hasLocked, hasUnlocked };
  }, [allRecords]);

  // Check which trip flag values exist in current data
  const availableTripFlags = useMemo(() => {
    const hasYes = allRecords.some((r) => r.isTripFlag);
    const hasNo = allRecords.some((r) => !r.isTripFlag);
    return { hasYes, hasNo };
  }, [allRecords]);

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
      if (filters.selectedProjects.length > 0) {
        // Map selected project IDs to their display numbers
        const selectedProjectNumbers = filters.selectedProjects
          .map((id) => projectsData?.getActiveProjects.find((p) => p.id === id)?.number)
          .filter(Boolean);

        // Check if record's project matches any selected project
        if (!record.project || !selectedProjectNumbers.includes(record.project)) {
          return false;
        }
      }

      // Absence Type filter (OR logic within category)
      if (filters.selectedAbsenceTypes.length > 0) {
        // Map selected absence type IDs to their display aliases
        const selectedAbsenceAliases = filters.selectedAbsenceTypes
          .map((id) => absenceTypesData?.getAbsenceTypes.find((a) => a.id === id)?.alias)
          .filter(Boolean);

        // Check if record's absence type matches any selected type
        if (!selectedAbsenceAliases.includes(record.absenceType)) {
          return false;
        }
      }

      // Productivity Type filter (OR logic within category)
      if (filters.selectedProductivityTypes.length > 0) {
        // Map selected productivity type IDs to their display hourTypes
        const selectedProductivityHourTypes = filters.selectedProductivityTypes
          .map((id) => productivityTypesData?.getProductivityTypes.find((p) => p.id === id)?.hourType)
          .filter(Boolean);

        // Check if record's productivity type matches any selected type
        if (!record.productivityType || !selectedProductivityHourTypes.includes(record.productivityType)) {
          return false;
        }
      }

      // Work Type filter (OR logic within category)
      if (filters.selectedWorkTypes.length > 0) {
        // Map selected work type IDs to their display hourTypes
        const selectedWorkHourTypes = filters.selectedWorkTypes
          .map((id) => workTypesData?.getWorkTypes.find((w) => w.id === id)?.hourType)
          .filter(Boolean);

        // Check if record's work type matches any selected type
        if (!record.workType || !selectedWorkHourTypes.includes(record.workType)) {
          return false;
        }
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
  }, [allRecords, filters, projectsData, absenceTypesData, productivityTypesData, workTypesData]);

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
        <Card className="max-w-md border-destructive">
          <CardContent className="flex flex-col items-center gap-4 text-center">
            <XCircle className="h-12 w-12 text-destructive" />
            <CardHeader className="p-0">
              <CardTitle>Failed to load work records</CardTitle>
              <CardDescription>
                {recordsError.message || 'An unexpected error occurred'}
              </CardDescription>
            </CardHeader>
            <Button onClick={() => refetchRecords()}>Retry</Button>
          </CardContent>
        </Card>
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
      <Breadcrumb className="mb-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Work Records</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

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
        filters={filters}
        onFilterChange={handleFilterChange}
        projects={availableProjects}
        absenceTypes={availableAbsenceTypes}
        productivityTypes={availableProductivityTypes}
        workTypes={availableWorkTypes}
        availableLockStatuses={availableLockStatuses}
        availableTripFlags={availableTripFlags}
      />

      {/* Active filter chips */}
      <FilterChips
        filters={filters}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
        projects={availableProjects}
        absenceTypes={availableAbsenceTypes}
        productivityTypes={availableProductivityTypes}
        workTypes={availableWorkTypes}
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
          <div className="overflow-x-auto -mx-8 px-8">
            <WorkRecordsTable workRecords={filteredRecords} />
          </div>

          {/* Infinite scroll sentinel - always render to avoid observer re-initialization */}
          <div ref={observerTarget} className="py-8 text-center">
            {recordsData?.getWorkRecords.hasMore && isFetchingMore && (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Loading more...
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
