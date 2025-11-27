"use client";

// ... (Importy ostávajú rovnaké) ...
import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import {
  Loader2,
  XCircle,
  Calendar as CalendarIcon,
  Plus,
  Download,
} from "lucide-react";
import { format } from "date-fns";
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
} from "@/graphql/queries/work-records";
import { WorkRecordsTable } from "@/components/work-records-table";
import { EmployeeSelector } from "@/components/employee-selector";
import { WorkRecordDialog } from "@/components/work-record-dialog";
import { DeleteWorkRecordDialog } from "@/components/delete-work-record-dialog";
import { WorkRecordsFilterState } from "@/types/work-records-filters";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { generateCSV, generateFilename } from "@/lib/utils/csv-utils";
import { EMPLOYEES_QUERY, EmployeesData } from "@/graphql/queries/employees";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";

export default function WorkRecordsPage() {
  // ... (Inicializácia stateov, dátumov, zamestnanca ostáva rovnaká) ...
  const { user, loading: authLoading } = useAuth();

  const initialDates = useMemo(() => {
    const today = new Date();
    const thirtyOneDaysAgo = new Date();
    thirtyOneDaysAgo.setDate(today.getDate() - 31);
    return { today, thirtyOneDaysAgo };
  }, []);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  useEffect(() => {
    if (user?.id && !selectedEmployeeId) {
      setSelectedEmployeeId(user.id);
    }
  }, [user, selectedEmployeeId]);

  const [allRecords, setAllRecords] = useState<WorkRecord[]>([]);
  const [offset, setOffset] = useState(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<WorkRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<WorkRecord | null>(null);
  const [copyFromRecord, setCopyFromRecord] = useState<WorkRecord | null>(null);

  const [filters, setFilters] = useState<WorkRecordsFilterState>({
    fromDate: initialDates.thirtyOneDaysAgo,
    toDate: initialDates.today,
    showWholeMonth: false,
    searchText: "",
    selectedProjects: [],
    selectedAbsenceTypes: [],
    selectedProductivityTypes: [],
    selectedWorkTypes: [],
    lockStatus: "all",
    tripFlag: "all",
  });

  const formatDateForQuery = (date: Date | null): string => {
    if (!date) return new Date().toISOString().split("T")[0];
    return date.toISOString().split("T")[0];
  };

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
      sortOrder: "DESC",
    },
    skip: !selectedEmployeeId,
  });

  useEffect(() => {
    if (recordsData?.getWorkRecords.records) {
      setAllRecords(recordsData.getWorkRecords.records);
      setOffset(recordsData.getWorkRecords.records.length);
    }
  }, [recordsData]);

  const { data: projectsData } =
    useQuery<ActiveProjectsData>(GET_ACTIVE_PROJECTS);
  const { data: absenceTypesData } =
    useQuery<AbsenceTypesData>(GET_ABSENCE_TYPES);
  const { data: productivityTypesData } = useQuery<ProductivityTypesData>(
    GET_PRODUCTIVITY_TYPES,
  );
  const { data: workTypesData } = useQuery<WorkTypesData>(GET_WORK_TYPES);
  const { data: employeesData } = useQuery<EmployeesData>(EMPLOYEES_QUERY);

  // ... (Infinite scroll, handleEmployeeChange, handleFetchMore ostáva) ...
  const handleFetchMore = useCallback(async () => {
    if (
      !recordsData?.getWorkRecords.hasMore ||
      isFetchingMore ||
      recordsLoading
    )
      return;
    setIsFetchingMore(true);
    try {
      const result = await fetchMore({
        variables: {
          employeeId: parseInt(selectedEmployeeId, 10),
          fromDate: formatDateForQuery(filters.fromDate),
          toDate: formatDateForQuery(filters.toDate),
          limit: 50,
          offset,
          sortOrder: "DESC",
        },
      });
      if (result.data?.getWorkRecords.records) {
        setAllRecords((prev) => [
          ...prev,
          ...result.data.getWorkRecords.records,
        ]);
        setOffset((prev) => prev + result.data.getWorkRecords.records.length);
      }
    } catch (error) {
      console.error("Error fetching more records:", error);
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

  const observerTarget = useInfiniteScroll({
    fetchMore: handleFetchMore,
    hasMore: recordsData?.getWorkRecords.hasMore || false,
    isLoading: isFetchingMore || recordsLoading,
  });

  const handleEmployeeChange = useCallback(
    (employeeId: string) => {
      setSelectedEmployeeId(employeeId);
      setAllRecords([]);
      setOffset(0);
      refetchRecords({
        employeeId: parseInt(employeeId, 10),
        fromDate: formatDateForQuery(filters.fromDate),
        toDate: formatDateForQuery(filters.toDate),
        limit: 50,
        offset: 0,
      });
    },
    [refetchRecords, filters.fromDate, filters.toDate],
  );

  const handleFilterChange = useCallback(
    (newFilters: WorkRecordsFilterState) => {
      const dateRangeChanged =
        newFilters.fromDate?.getTime() !== filters.fromDate?.getTime() ||
        newFilters.toDate?.getTime() !== filters.toDate?.getTime();

      setFilters(newFilters);

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
    [filters.fromDate, filters.toDate, refetchRecords, selectedEmployeeId],
  );

  const toggleWholeMonth = (checked: boolean) => {
    if (checked) {
      const baseDate = filters.fromDate || new Date();
      const firstDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
      const lastDay = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth() + 1,
        0,
      );

      handleFilterChange({
        ...filters,
        showWholeMonth: true,
        fromDate: firstDay,
        toDate: lastDay,
      });
    } else {
      handleFilterChange({
        ...filters,
        showWholeMonth: false,
      });
    }
  };

  // ... (Dialog Handlers, Export CSV ostávajú) ...
  const handleAddEntry = () => {
    setSelectedRecord(null);
    setCreateDialogOpen(true);
  };
  const handleEdit = (record: WorkRecord) => {
    setSelectedRecord(record);
    setEditDialogOpen(true);
  };
  const handleDelete = (record: WorkRecord) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };
  const handleCopy = (record: WorkRecord) => {
    setCopyFromRecord(record);
    setCreateDialogOpen(true);
  };

  const handleExportCSV = () => {
    try {
      const currentEmployee = employeesData?.employees.find(
        (emp) => emp.id === selectedEmployeeId,
      );
      const employeeName = currentEmployee?.fullName || "employee";
      const csvContent = generateCSV(filteredRecords);
      const filename = generateFilename(
        employeeName,
        filters.fromDate,
        filters.toDate,
      );
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("CSV exported successfully");
    } catch (error) {
      console.error("Failed to export CSV:", error);
      toast.error("Failed to export CSV.");
    }
  };

  // --- FACETED SEARCH LOGIC START ---
  const matchesProject = (record: WorkRecord) => {
    if (filters.selectedProjects.length === 0) return true;
    const projectNumber = projectsData?.getActiveProjects.find((p) =>
      filters.selectedProjects.includes(p.id),
    )?.number;
    return record.project === projectNumber;
  };
  const matchesAbsence = (record: WorkRecord) => {
    if (filters.selectedAbsenceTypes.length === 0) return true;
    const absenceAlias = absenceTypesData?.getAbsenceTypes.find((a) =>
      filters.selectedAbsenceTypes.includes(a.id),
    )?.alias;
    return record.absenceType === absenceAlias;
  };
  const matchesProductivity = (record: WorkRecord) => {
    if (filters.selectedProductivityTypes.length === 0) return true;
    const prodType = productivityTypesData?.getProductivityTypes.find((p) =>
      filters.selectedProductivityTypes.includes(p.id),
    )?.hourType;
    return record.productivityType === prodType;
  };
  const matchesWorkType = (record: WorkRecord) => {
    if (filters.selectedWorkTypes.length === 0) return true;
    const workType = workTypesData?.getWorkTypes.find((w) =>
      filters.selectedWorkTypes.includes(w.id),
    )?.hourType;
    return record.workType === workType;
  };
  const matchesLock = (record: WorkRecord) => {
    if (filters.lockStatus === "all") return true;
    return filters.lockStatus === "locked" ? record.isLocked : !record.isLocked;
  };
  const matchesTrip = (record: WorkRecord) => {
    if (filters.tripFlag === "all") return true;
    return filters.tripFlag === "yes" ? record.isTripFlag : !record.isTripFlag;
  };
  const matchesSearch = (record: WorkRecord) => {
    if (!filters.searchText) return true;
    return record.description
      ?.toLowerCase()
      .includes(filters.searchText.toLowerCase());
  };

  const baseRecords = useMemo(() => {
    return allRecords.filter(matchesSearch);
  }, [allRecords, filters.searchText]);

  const availableProjects = useMemo(() => {
    const relevantRecords = baseRecords.filter(
      (r) =>
        matchesAbsence(r) &&
        matchesProductivity(r) &&
        matchesWorkType(r) &&
        matchesLock(r) &&
        matchesTrip(r),
    );
    const uniqueNumbers = new Set(
      relevantRecords.map((r) => r.project).filter(Boolean),
    );
    return (projectsData?.getActiveProjects || []).filter((p) =>
      uniqueNumbers.has(p.number),
    );
  }, [baseRecords, filters, projectsData]);

  const availableAbsenceTypes = useMemo(() => {
    const relevantRecords = baseRecords.filter(
      (r) =>
        matchesProject(r) &&
        matchesProductivity(r) &&
        matchesWorkType(r) &&
        matchesLock(r) &&
        matchesTrip(r),
    );
    const uniqueAliases = new Set(
      relevantRecords.map((r) => r.absenceType).filter(Boolean),
    );
    return (absenceTypesData?.getAbsenceTypes || []).filter((a) =>
      uniqueAliases.has(a.alias),
    );
  }, [baseRecords, filters, absenceTypesData]);

  const availableProductivityTypes = useMemo(() => {
    const relevantRecords = baseRecords.filter(
      (r) =>
        matchesProject(r) &&
        matchesAbsence(r) &&
        matchesWorkType(r) &&
        matchesLock(r) &&
        matchesTrip(r),
    );
    const uniqueTypes = new Set(
      relevantRecords.map((r) => r.productivityType).filter(Boolean),
    );
    return (productivityTypesData?.getProductivityTypes || []).filter((p) =>
      uniqueTypes.has(p.hourType),
    );
  }, [baseRecords, filters, productivityTypesData]);

  const availableWorkTypes = useMemo(() => {
    const relevantRecords = baseRecords.filter(
      (r) =>
        matchesProject(r) &&
        matchesAbsence(r) &&
        matchesProductivity(r) &&
        matchesLock(r) &&
        matchesTrip(r),
    );
    const uniqueTypes = new Set(
      relevantRecords.map((r) => r.workType).filter(Boolean),
    );
    return (workTypesData?.getWorkTypes || []).filter((w) =>
      uniqueTypes.has(w.hourType),
    );
  }, [baseRecords, filters, workTypesData]);

  // NOVÉ: VÝPOČET DOSTUPNÝCH LOCK STATUSOV
  const availableLockOptions = useMemo(() => {
    const relevantRecords = baseRecords.filter(
      (r) =>
        matchesProject(r) &&
        matchesAbsence(r) &&
        matchesProductivity(r) &&
        matchesWorkType(r) &&
        matchesTrip(r),
    );
    return {
      hasLocked: relevantRecords.some((r) => r.isLocked),
      hasUnlocked: relevantRecords.some((r) => !r.isLocked),
    };
  }, [baseRecords, filters]);

  // NOVÉ: VÝPOČET DOSTUPNÝCH TRIP MOŽNOSTÍ
  const availableTripOptions = useMemo(() => {
    const relevantRecords = baseRecords.filter(
      (r) =>
        matchesProject(r) &&
        matchesAbsence(r) &&
        matchesProductivity(r) &&
        matchesWorkType(r) &&
        matchesLock(r),
    );
    return {
      hasTrip: relevantRecords.some((r) => r.isTripFlag),
      hasNoTrip: relevantRecords.some((r) => !r.isTripFlag),
    };
  }, [baseRecords, filters]);

  const filteredRecords = useMemo(() => {
    return baseRecords.filter(
      (r) =>
        matchesProject(r) &&
        matchesAbsence(r) &&
        matchesProductivity(r) &&
        matchesWorkType(r) &&
        matchesLock(r) &&
        matchesTrip(r),
    );
  }, [
    baseRecords,
    filters,
    projectsData,
    absenceTypesData,
    productivityTypesData,
    workTypesData,
  ]);
  // --- FACETED SEARCH LOGIC END ---

  // ... (Render časť ostáva, len pridáme nové props do tabuľky) ...

  if (authLoading || (recordsLoading && allRecords.length === 0)) {
    // ... loading ...
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading work records...
          </p>
        </div>
      </div>
    );
  }

  if (recordsError) {
    // ... error ...
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="max-w-md border-destructive/50 bg-destructive/5 shadow-lg">
          <CardContent className="flex flex-col items-center gap-4 text-center p-8">
            <XCircle className="h-12 w-12 text-destructive" />
            <CardHeader className="p-0">
              <CardTitle className="text-lg">Failed to load records</CardTitle>
              <CardDescription>
                {recordsError.message || "An unexpected error occurred"}
              </CardDescription>
            </CardHeader>
            <Button
              onClick={() => refetchRecords()}
              variant="outline"
              className="border-destructive/20 hover:bg-destructive/10"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-md">
        <EmployeeSelector
          currentEmployeeId={selectedEmployeeId}
          onEmployeeChange={handleEmployeeChange}
          isAdmin={!!user?.isAdmin}
          isManager={!!user?.isManager}
        />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end gap-4 p-5 rounded-xl border border-border bg-card shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              From Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal border-input hover:bg-accent hover:text-accent-foreground",
                    !filters.fromDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                  {filters.fromDate ? (
                    format(filters.fromDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 animate-in fade-in-0 zoom-in-95"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={filters.fromDate || undefined}
                  onSelect={(date) =>
                    handleFilterChange({
                      ...filters,
                      fromDate: date || null,
                      showWholeMonth: false,
                    })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              To Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal border-input hover:bg-accent hover:text-accent-foreground",
                    !filters.toDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                  {filters.toDate ? (
                    format(filters.toDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 animate-in fade-in-0 zoom-in-95"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={filters.toDate || undefined}
                  onSelect={(date) =>
                    handleFilterChange({
                      ...filters,
                      toDate: date || null,
                      showWholeMonth: false,
                    })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-center gap-3 h-10 pb-1 px-2">
          <Checkbox
            id="wholeMonth"
            checked={filters.showWholeMonth}
            onCheckedChange={(checked) => toggleWholeMonth(checked === true)}
            className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          />
          <Label
            htmlFor="wholeMonth"
            className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Whole Month
          </Label>
        </div>

        <div className="flex-1 lg:hidden" />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="gap-2 shadow-sm"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            onClick={handleAddEntry}
            className="gap-2 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Entry
          </Button>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center border-2 border-dashed border-muted rounded-xl bg-muted/5">
          {/* ... Empty state ... */}
          <div className="p-4 rounded-full bg-background shadow-sm">
            <CalendarIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="max-w-xs">
            <h2 className="text-lg font-semibold text-foreground mb-1">
              No records found
            </h2>
            <p className="text-sm text-muted-foreground">
              We couldn't find any work records for this date range or filter
              selection.
            </p>
          </div>
          {(filters.selectedProjects.length > 0 ||
            filters.searchText ||
            filters.selectedAbsenceTypes.length > 0) && (
            <Button
              variant="link"
              onClick={() =>
                handleFilterChange({
                  ...filters,
                  searchText: "",
                  selectedProjects: [],
                  selectedAbsenceTypes: [],
                  selectedProductivityTypes: [],
                  selectedWorkTypes: [],
                  lockStatus: "all",
                  tripFlag: "all",
                })
              }
              className="text-primary"
            >
              Clear all filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="flex justify-end items-center mb-2">
            <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
              Showing {filteredRecords.length} of{" "}
              {recordsData?.getWorkRecords.totalCount || allRecords.length}{" "}
              records
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl shadow-sm border border-border bg-card">
            <WorkRecordsTable
              workRecords={filteredRecords}
              filters={filters}
              onFilterChange={handleFilterChange}
              options={{
                projects: availableProjects,
                absenceTypes: availableAbsenceTypes,
                productivityTypes: availableProductivityTypes,
                workTypes: availableWorkTypes,
              }}
              // Pridáme nové props
              availableLockOptions={availableLockOptions}
              availableTripOptions={availableTripOptions}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCopy={handleCopy}
            />
          </div>

          <div ref={observerTarget} className="py-8 text-center">
            {recordsData?.getWorkRecords.hasMore && isFetchingMore && (
              <div className="flex items-center justify-center gap-2 p-2 rounded-full bg-secondary/30 inline-flex px-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  Loading more records...
                </span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Dialogs */}
      <WorkRecordDialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) setCopyFromRecord(null);
        }}
        mode="create"
        employeeId={parseInt(selectedEmployeeId, 10)}
        copyFromRecord={copyFromRecord}
      />
      <WorkRecordDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        mode="edit"
        initialData={selectedRecord}
        employeeId={parseInt(selectedEmployeeId, 10)}
      />
      <DeleteWorkRecordDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        record={recordToDelete}
        employeeId={parseInt(selectedEmployeeId, 10)}
      />
    </div>
  );
}
