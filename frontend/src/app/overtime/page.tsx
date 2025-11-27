"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useAuth } from "@/providers/auth-provider";
import {
  GET_OVERTIME_SUMMARY,
  CREATE_OVERTIME_CORRECTION,
  OvertimeSummaryData,
  OvertimeRecord,
} from "@/graphql/queries/overtime";
import { EmployeeSelector } from "@/components/employee-selector";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format, parseISO, isSameDay, setHours } from "date-fns";
import {
  Calendar as CalendarIcon,
  Loader2,
  Save,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  History,
  Calculator,
  Filter,
  ChevronUp,
  ChevronDown,
  Search,
} from "lucide-react";
import { toast } from "sonner";

const OVERTIME_TYPES = [
  { id: "Flexi", label: "Flexi" },
  { id: "SCSKCesta", label: "SC SR Cesta" },
  { id: "SCZahranicie", label: "SC Zahraničie" },
  { id: "Neplateny", label: "Neplatené" },
];

type FormPrefillData = {
  amount: string;
  mode: "add" | "subtract";
  note: string;
  originalDate: Date;
  timestamp: number;
} | null;

// Definícia filtrov
export interface HistoryFilters {
  searchText: string;
  selectedTypes: string[];
  changeFilter: "all" | "positive" | "negative";
}

// --- Helper: Column Header with Filter ---
interface ColumnFilterHeaderProps {
  title: string;
  isActive: boolean;
  isSortable?: boolean;
  sortDirection?: "asc" | "desc" | null;
  onSort?: () => void;
  filterContent?: React.ReactNode;
}

function ColumnFilterHeader({
  title,
  isActive,
  isSortable,
  sortDirection,
  onSort,
  filterContent,
}: ColumnFilterHeaderProps) {
  return (
    <div className="flex items-center space-x-1">
      {isSortable ? (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 font-medium text-muted-foreground hover:text-foreground data-[state=open]:bg-accent"
          onClick={onSort}
        >
          <span>{title}</span>
          {sortDirection === "asc" && (
            <ChevronUp className="ml-2 h-3.5 w-3.5 text-primary" />
          )}
          {sortDirection === "desc" && (
            <ChevronDown className="ml-2 h-3.5 w-3.5 text-primary" />
          )}
        </Button>
      ) : (
        <span className="text-sm font-medium text-muted-foreground">
          {title}
        </span>
      )}

      {filterContent && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 w-7 p-0 hover:bg-muted transition-colors",
                isActive && "text-primary bg-primary/10 hover:bg-primary/20",
              )}
            >
              <Filter
                className={cn("h-3.5 w-3.5", isActive && "fill-primary/20")}
              />
              <span className="sr-only">Filter {title}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[240px] p-3 animate-in fade-in-0 zoom-in-95 duration-200"
            align="start"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-foreground">
                  Filter {title}
                </h4>
                {isActive && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1 py-0 h-5"
                  >
                    Active
                  </Badge>
                )}
              </div>
              <Separator />
              {filterContent}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

// --- History Table Component ---
interface HistoryTableProps {
  records: OvertimeRecord[];
  filters: HistoryFilters;
  onFilterChange: (f: HistoryFilters) => void;
  availableTypes: string[]; // Dynamicky dostupné typy
  availableChangeOptions: { hasPositive: boolean; hasNegative: boolean }; // Dynamicky dostupné zmeny
  onRowClick: (record: OvertimeRecord) => void;
}

function HistoryTable({
  records,
  filters,
  onFilterChange,
  availableTypes,
  availableChangeOptions,
  onRowClick,
}: HistoryTableProps) {
  // Sorting state ostáva v tabuľke (neovplyvňuje dataset)
  const [sortColumn, setSortColumn] = useState<keyof OvertimeRecord>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (column: keyof OvertimeRecord) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const toggleType = (typeId: string) => {
    const current = filters.selectedTypes;
    const next = current.includes(typeId)
      ? current.filter((t) => t !== typeId)
      : [...current, typeId];
    onFilterChange({ ...filters, selectedTypes: next });
  };

  // Iba sortujeme (filtrovanie už prebehlo v parent componente)
  const sortedRecords = useMemo(() => {
    const sorted = [...records];
    sorted.sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      // Strings
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      // Numbers
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
    return sorted;
  }, [records, sortColumn, sortDirection]);

  return (
    <div className="rounded-md border border-border max-h-[500px] overflow-y-auto relative bg-background flex flex-col">
      <Table>
        <TableHeader className="sticky top-0 bg-muted/90 backdrop-blur-sm z-10 shadow-sm">
          <TableRow className="hover:bg-transparent border-border">
            {/* DATE Column */}
            <TableHead className="w-[140px]">
              <ColumnFilterHeader
                title="Date"
                isActive={false}
                isSortable={true}
                sortDirection={sortColumn === "date" ? sortDirection : null}
                onSort={() => handleSort("date")}
              />
            </TableHead>

            {/* TYPE Column - Dynamické filtre */}
            <TableHead>
              <ColumnFilterHeader
                title="Type"
                isActive={filters.selectedTypes.length > 0}
                isSortable={true}
                sortDirection={sortColumn === "type" ? sortDirection : null}
                onSort={() => handleSort("type")}
                filterContent={
                  <div className="space-y-3">
                    <div className="space-y-2">
                      {OVERTIME_TYPES.filter((t) =>
                        availableTypes.includes(t.id),
                      ).length > 0 ? (
                        OVERTIME_TYPES.filter((t) =>
                          availableTypes.includes(t.id),
                        ).map((type) => (
                          <div
                            key={type.id}
                            className="flex items-center space-x-2.5"
                          >
                            <Checkbox
                              id={`type-${type.id}`}
                              checked={filters.selectedTypes.includes(type.id)}
                              onCheckedChange={() => toggleType(type.id)}
                            />
                            <Label
                              htmlFor={`type-${type.id}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {type.label}
                            </Label>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-muted-foreground py-2">
                          No types available
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8"
                      onClick={() =>
                        onFilterChange({ ...filters, selectedTypes: [] })
                      }
                      disabled={filters.selectedTypes.length === 0}
                    >
                      Reset Filter
                    </Button>
                  </div>
                }
              />
            </TableHead>

            {/* CHANGE Column - Dynamické filtre */}
            <TableHead className="text-right">
              <div className="flex justify-end">
                <ColumnFilterHeader
                  title="Change"
                  isActive={filters.changeFilter !== "all"}
                  isSortable={true}
                  sortDirection={sortColumn === "hours" ? sortDirection : null}
                  onSort={() => handleSort("hours")}
                  filterContent={
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2.5">
                          <Checkbox
                            id="chg-all"
                            checked={filters.changeFilter === "all"}
                            onCheckedChange={() =>
                              onFilterChange({
                                ...filters,
                                changeFilter: "all",
                              })
                            }
                          />
                          <Label htmlFor="chg-all">All</Label>
                        </div>

                        {availableChangeOptions.hasPositive && (
                          <div className="flex items-center space-x-2.5">
                            <Checkbox
                              id="chg-pos"
                              checked={filters.changeFilter === "positive"}
                              onCheckedChange={() =>
                                onFilterChange({
                                  ...filters,
                                  changeFilter: "positive",
                                })
                              }
                            />
                            <Label htmlFor="chg-pos" className="text-green-600">
                              Added (+)
                            </Label>
                          </div>
                        )}

                        {availableChangeOptions.hasNegative && (
                          <div className="flex items-center space-x-2.5">
                            <Checkbox
                              id="chg-neg"
                              checked={filters.changeFilter === "negative"}
                              onCheckedChange={() =>
                                onFilterChange({
                                  ...filters,
                                  changeFilter: "negative",
                                })
                              }
                            />
                            <Label
                              htmlFor="chg-neg"
                              className="text-destructive"
                            >
                              Deducted (-)
                            </Label>
                          </div>
                        )}

                        {!availableChangeOptions.hasPositive &&
                          !availableChangeOptions.hasNegative && (
                            <div className="text-xs text-muted-foreground py-1">
                              No options available
                            </div>
                          )}
                      </div>
                    </div>
                  }
                />
              </div>
            </TableHead>

            {/* NOTE Column */}
            <TableHead className="hidden md:table-cell">
              <ColumnFilterHeader
                title="Note"
                isActive={!!filters.searchText}
                isSortable={true}
                sortDirection={sortColumn === "note" ? sortDirection : null}
                onSort={() => handleSort("note")}
                filterContent={
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search notes..."
                        value={filters.searchText}
                        onChange={(e) =>
                          onFilterChange({
                            ...filters,
                            searchText: e.target.value,
                          })
                        }
                        className="pl-8 h-9"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8"
                      onClick={() =>
                        onFilterChange({ ...filters, searchText: "" })
                      }
                      disabled={!filters.searchText}
                    >
                      Clear
                    </Button>
                  </div>
                }
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRecords.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-24 text-center text-muted-foreground"
              >
                No records match your filters.
              </TableCell>
            </TableRow>
          ) : (
            sortedRecords.map((record, i) => (
              <TableRow
                key={i}
                onClick={() => onRowClick(record)}
                className="cursor-pointer hover:bg-muted/60 active:bg-muted transition-colors border-border group"
              >
                <TableCell className="font-medium text-foreground/90 tabular-nums">
                  {format(parseISO(record.date), "dd.MM.yyyy")}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="font-normal bg-secondary text-secondary-foreground border-border hover:bg-secondary/80"
                  >
                    {OVERTIME_TYPES.find((t) => t.id === record.type)?.label ||
                      record.type}
                  </Badge>
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-mono font-medium tabular-nums",
                    record.hours > 0
                      ? "text-green-600 dark:text-green-500"
                      : "text-destructive",
                  )}
                >
                  {record.hours > 0 ? "+" : ""}
                  {record.hours.toFixed(2)}
                </TableCell>
                <TableCell className="hidden md:table-cell max-w-[200px] truncate text-muted-foreground text-sm group-hover:text-foreground/80">
                  {record.note || "-"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="p-2 border-t border-border bg-muted/20 text-xs text-muted-foreground text-center">
        Showing {sortedRecords.length} of {records.length} records
      </div>
    </div>
  );
}

// --- Correction Form (Nezmenené) ---

function CorrectionForm({
  type,
  totalBalance,
  employeeId,
  date,
  setDate,
  prefillData,
  historyRecords,
  onSubmit,
}: {
  type: string;
  totalBalance: number;
  employeeId: string;
  date: Date | undefined;
  setDate: (d: Date | undefined) => void;
  prefillData: FormPrefillData;
  historyRecords: OvertimeRecord[];
  onSubmit: (input: any) => Promise<void>;
}) {
  const [mode, setMode] = useState<"add" | "subtract">("add");
  const [hoursValue, setHoursValue] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentDayBalance = useMemo(() => {
    if (!date) return 0;
    return historyRecords
      .filter((r) => isSameDay(parseISO(r.date), date) && r.type === type)
      .reduce((acc, curr) => acc + curr.hours, 0);
  }, [date, historyRecords, type]);

  useEffect(() => {
    if (prefillData) {
      setHoursValue(prefillData.amount);
      setMode(prefillData.mode);
      setNote(prefillData.note);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [prefillData]);

  useEffect(() => {
    if (!prefillData) {
      setHoursValue("");
      setNote("");
      setMode(totalBalance > 0 ? "subtract" : "add");
    }
  }, [type, totalBalance, prefillData]);

  const handleSubmit = async () => {
    if (!employeeId) return;
    const val = parseFloat(hoursValue);

    if (!val || isNaN(val) || val <= 0) {
      toast.error("Please enter a valid positive number");
      return;
    }
    if (!date) {
      toast.error("Please select a date");
      return;
    }

    const safeDate = setHours(date, 12);

    setSubmitting(true);
    try {
      await onSubmit({
        employeeId: parseInt(employeeId, 10),
        date: safeDate,
        type: type,
        hours: val,
        note: note,
        isDeduction: mode === "subtract",
      });
      setHoursValue("");
      setNote("");
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const inputHours = parseFloat(hoursValue) || 0;
  const adjustment = mode === "add" ? inputHours : -inputHours;

  const predictedTotalBalance = totalBalance + adjustment;
  const predictedDayBalance = currentDayBalance + adjustment;
  const isSaveDisabled = submitting || !employeeId || !hoursValue || !date;

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col gap-1 mb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
            {OVERTIME_TYPES.find((t) => t.id === type)?.label}
          </h3>
          <Badge
            variant="outline"
            className="font-mono text-sm px-3 py-1 bg-background"
          >
            Total Balance:{" "}
            <span
              className={cn(
                "ml-2 font-bold",
                totalBalance < 0 ? "text-destructive" : "text-primary",
              )}
            >
              {totalBalance.toFixed(2)} h
            </span>
          </Badge>
        </div>
      </div>

      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as "add" | "subtract")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="add"
            className="data-[state=active]:bg-green-500/10 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-400 transition-all"
          >
            <TrendingUp className="w-4 h-4 mr-2" /> Add Hours
          </TabsTrigger>
          <TabsTrigger
            value="subtract"
            className="data-[state=active]:bg-red-500/10 data-[state=active]:text-red-700 dark:data-[state=active]:text-red-400 transition-all"
          >
            <TrendingDown className="w-4 h-4 mr-2" /> Subtract Hours
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-foreground/80">Amount (Hours)</Label>
          <div className="relative">
            <Input
              ref={inputRef}
              type="number"
              step="0.5"
              min="0"
              placeholder="0.0"
              value={hoursValue}
              onChange={(e) => setHoursValue(e.target.value)}
              className="pl-8 text-lg font-medium h-10 border-input bg-background focus-visible:ring-primary/20"
            />
            <span
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 font-bold pointer-events-none transition-colors",
                mode === "add" ? "text-green-600" : "text-destructive",
              )}
            >
              {mode === "add" ? "+" : "-"}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground/80">Effective Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal h-10 border-input bg-background hover:bg-muted/50",
                  !date &&
                    "text-muted-foreground border-dashed border-muted-foreground/50",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Select a date...</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {date && (
          <div className="p-3 rounded-lg border bg-muted/30 flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Day Balance ({format(date, "dd.MM")}):
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono">
              <span className="text-muted-foreground line-through decoration-destructive/50">
                {currentDayBalance.toFixed(2)}
              </span>
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
              <span
                className={cn(
                  "font-bold text-base",
                  predictedDayBalance < 0
                    ? "text-destructive"
                    : "text-green-600",
                )}
              >
                {predictedDayBalance > 0 ? "+" : ""}
                {predictedDayBalance.toFixed(2)} h
              </span>
            </div>
          </div>
        )}

        <div
          className={cn(
            "p-3 rounded-lg border flex justify-between items-center transition-colors duration-300 text-sm",
            mode === "add"
              ? "bg-green-500/5 border-green-500/20"
              : "bg-red-500/5 border-red-500/20",
          )}
        >
          <span className="text-muted-foreground font-medium">
            New Total Balance (Year)
          </span>
          <div className="flex items-center gap-2 font-mono font-bold">
            <span className="text-foreground/60">
              {totalBalance.toFixed(2)}
            </span>
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
            <span
              className={
                predictedTotalBalance < 0
                  ? "text-destructive"
                  : "text-green-600"
              }
            >
              {predictedTotalBalance.toFixed(2)} h
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground/80">Note / Reason</Label>
        <Textarea
          placeholder="Describe why this adjustment is being made..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="resize-none bg-background border-input"
          rows={2}
        />
      </div>

      <Button
        className={cn(
          "w-full gap-2 transition-all",
          mode === "subtract" ? "variant-destructive" : "",
        )}
        variant={mode === "subtract" ? "destructive" : "default"}
        onClick={handleSubmit}
        disabled={isSaveDisabled}
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {isSaveDisabled && !submitting && !date
          ? "Select Date to Save"
          : mode === "subtract"
            ? "Confirm Deduction"
            : "Confirm Addition"}
      </Button>
    </div>
  );
}

// --- Main Page ---

export default function OvertimePage() {
  const { user, loading: authLoading } = useAuth();
  const canManage = !!user?.isAdmin || !!user?.isManager;

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());

  const [selectedType, setSelectedType] = useState<string>("Flexi");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [formPrefill, setFormPrefill] = useState<FormPrefillData>(null);

  // Filter State v parent komponente
  const [filters, setFilters] = useState<HistoryFilters>({
    searchText: "",
    selectedTypes: [],
    changeFilter: "all",
  });

  useEffect(() => {
    if (user?.id && !selectedEmployeeId) {
      setSelectedEmployeeId(user.id);
    }
  }, [user, selectedEmployeeId]);

  const { data, loading } = useQuery<OvertimeSummaryData>(
    GET_OVERTIME_SUMMARY,
    {
      variables: {
        employeeId: parseInt(selectedEmployeeId || "0", 10),
        year: parseInt(year, 10),
      },
      skip: !selectedEmployeeId,
    },
  );

  const [createCorrection] = useMutation(CREATE_OVERTIME_CORRECTION, {
    onCompleted: () => {
      toast.success("Correction saved successfully");
      setFormPrefill(null);
    },
    onError: (err) => toast.error(err.message),
    refetchQueries: [GET_OVERTIME_SUMMARY],
  });

  const currentBalance =
    data?.getOvertimeSummary.items.find((i) => i.type === selectedType)
      ?.hours || 0;
  const historyRecords = data?.getOvertimeSummary.records || [];

  // --- FACETED SEARCH LOGIC ---

  // 1. BASE: Filtrovanie podľa Search textu (Note)
  const baseRecords = useMemo(() => {
    if (!filters.searchText) return historyRecords;
    const lowerSearch = filters.searchText.toLowerCase();
    return historyRecords.filter((r) =>
      r.note?.toLowerCase().includes(lowerSearch),
    );
  }, [historyRecords, filters.searchText]);

  // 2. Vypočítame dostupné TYPES (zohľadňujeme Search + Change Filter)
  const availableTypes = useMemo(() => {
    const relevantRecords = baseRecords.filter((r) => {
      if (filters.changeFilter === "positive") return r.hours > 0;
      if (filters.changeFilter === "negative") return r.hours < 0;
      return true;
    });
    const types = new Set(relevantRecords.map((r) => r.type));
    return Array.from(types);
  }, [baseRecords, filters.changeFilter]);

  // 3. Vypočítame dostupné CHANGE options (zohľadňujeme Search + Type Filter)
  const availableChangeOptions = useMemo(() => {
    const relevantRecords = baseRecords.filter((r) => {
      if (filters.selectedTypes.length > 0) {
        return filters.selectedTypes.includes(r.type);
      }
      return true;
    });

    return {
      hasPositive: relevantRecords.some((r) => r.hours > 0),
      hasNegative: relevantRecords.some((r) => r.hours < 0),
    };
  }, [baseRecords, filters.selectedTypes]);

  // 4. FINÁLNY FILTER (Aplikujeme všetko naraz)
  const filteredRecords = useMemo(() => {
    return baseRecords.filter((r) => {
      // Type Filter
      if (
        filters.selectedTypes.length > 0 &&
        !filters.selectedTypes.includes(r.type)
      ) {
        return false;
      }
      // Change Filter
      if (filters.changeFilter === "positive" && r.hours <= 0) return false;
      if (filters.changeFilter === "negative" && r.hours >= 0) return false;

      return true;
    });
  }, [baseRecords, filters.selectedTypes, filters.changeFilter]);

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setFormPrefill(null);
    setDate(undefined);
  };

  const handleHistoryRowClick = (record: OvertimeRecord) => {
    const recDate = parseISO(record.date);
    setDate(recDate);
    setSelectedType(record.type);
    setFormPrefill({
      amount: Math.abs(record.hours).toString(),
      mode: record.hours < 0 ? "subtract" : "add",
      note: record.note || "",
      originalDate: recDate,
      timestamp: Date.now(),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.info(`Loaded record details.`);
  };

  if (authLoading)
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="space-y-8">
      {/* 2. Filter Bar (Biela karta pod headerom) */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            {/* Employee Selector */}
            <div className="w-full md:w-[350px]">
              <EmployeeSelector
                currentEmployeeId={selectedEmployeeId}
                onEmployeeChange={setSelectedEmployeeId}
                isAdmin={!!user?.isAdmin}
                isManager={!!user?.isManager}
                label="Employee"
              />
            </div>

            {/* Year Selector (zarovnaný vedľa) */}
            <div className="w-full md:w-[150px] space-y-2">
              <Label>Year</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2].map((i) => {
                    const y = new Date().getFullYear() - i;
                    return (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="overflow-hidden border-border bg-card shadow-sm">
            <CardHeader className="pb-4 border-b border-border/50 bg-muted/20">
              <CardTitle className="text-lg">Balances ({year})</CardTitle>
              <CardDescription>Select a category to manage.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col">
                {loading && !data ? (
                  <div className="p-8 flex justify-center">
                    <Loader2 className="animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  OVERTIME_TYPES.map((type) => {
                    const item = data?.getOvertimeSummary.items.find(
                      (i) => i.type === type.id,
                    );
                    const balance = item?.hours || 0;
                    const isSelected = selectedType === type.id;

                    return (
                      <button
                        key={type.id}
                        onClick={() => handleTypeSelect(type.id)}
                        className={cn(
                          "group flex items-center justify-between p-4 text-left transition-all border-l-4",
                          isSelected
                            ? "bg-primary/5 border-primary shadow-inner"
                            : "border-transparent hover:bg-muted/50",
                        )}
                      >
                        <div className="flex flex-col gap-1">
                          <span
                            className={cn(
                              "font-medium transition-colors",
                              isSelected ? "text-primary" : "text-foreground",
                            )}
                          >
                            {type.label}
                          </span>
                        </div>
                        <div
                          className={cn(
                            "text-lg font-bold tabular-nums",
                            balance < 0
                              ? "text-destructive"
                              : "text-green-600 dark:text-green-500",
                          )}
                        >
                          {balance.toFixed(2)}{" "}
                          <span className="text-xs font-normal text-muted-foreground">
                            h
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-8 space-y-8">
          {canManage && (
            <Card className="border border-border bg-card shadow-sm ring-1 ring-black/5">
              <CardContent className="pt-6">
                <CorrectionForm
                  type={selectedType}
                  totalBalance={currentBalance}
                  employeeId={selectedEmployeeId}
                  date={date}
                  setDate={setDate}
                  prefillData={formPrefill}
                  historyRecords={historyRecords}
                  onSubmit={async (input) => {
                    await createCorrection({ variables: { input } });
                  }}
                />
              </CardContent>
            </Card>
          )}

          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-muted-foreground" />
                <CardTitle>History Log</CardTitle>
              </div>
              <CardDescription>
                Sort and filter log entries. Click to load details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HistoryTable
                records={filteredRecords}
                filters={filters}
                onFilterChange={setFilters}
                availableTypes={availableTypes}
                availableChangeOptions={availableChangeOptions}
                onRowClick={handleHistoryRowClick}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
