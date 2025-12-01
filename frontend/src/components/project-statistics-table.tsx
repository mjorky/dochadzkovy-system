'use client';

import { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Filter,
  Search,
  Loader2
} from 'lucide-react';
import { useTranslations } from '@/contexts/dictionary-context';
import { ProjectStatisticsItem } from '@/graphql/queries/project-statistics';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type SortColumn = 'projectNumber' | 'projectName' | 'productiveHours' | 'nonProductiveHours' | 'productiveZHours' | 'nonProductiveZHours' | 'totalHours' | 'manDays';
type SortDirection = 'asc' | 'desc';

export interface ProjectStatsFilters {
  selectedProjectNumbers: string[];
  projectNameSearch: string;
}

interface ProjectStatisticsTableProps {
  items: ProjectStatisticsItem[];
  isLoading: boolean;
  filters: ProjectStatsFilters;
  onFilterChange: (filters: ProjectStatsFilters) => void;
}

interface ColumnFilterHeaderProps {
  title: string;
  column: SortColumn;
  currentSort: SortColumn;
  sortDirection: SortDirection;
  onSort: (col: SortColumn) => void;
  isActive: boolean;
  filterContent: React.ReactNode;
}

function ColumnFilterHeader({
  title,
  column,
  currentSort,
  sortDirection,
  onSort,
  isActive,
  filterContent
}: ColumnFilterHeaderProps) {
  const t = useTranslations();

  return (
    <div className="flex items-center space-x-1">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent font-medium text-muted-foreground hover:text-foreground"
        onClick={() => onSort(column)}
      >
        <span>{title}</span>
        {currentSort === column && (
          sortDirection === 'asc'
            ? <ChevronUp className="ml-2 h-3.5 w-3.5 text-primary" />
            : <ChevronDown className="ml-2 h-3.5 w-3.5 text-primary" />
        )}
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 p-0 hover:bg-muted transition-colors",
              isActive && "text-primary bg-primary/10 hover:bg-primary/20"
            )}
          >
            <Filter className={cn("h-3.5 w-3.5", isActive && "fill-primary/20")} />
            <span className="sr-only">{t.common.filter} {title}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[280px] p-3 animate-in fade-in-0 zoom-in-95 duration-200"
          align="start"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm text-foreground">{t.common.filter} {title}</h4>
              {isActive && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5">{t.common.active}</Badge>
              )}
            </div>
            <Separator />
            {filterContent}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Simple header without filter
function SortableHeader({
  title,
  column,
  currentSort,
  sortDirection,
  onSort,
}: {
  title: string;
  column: SortColumn;
  currentSort: SortColumn;
  sortDirection: SortDirection;
  onSort: (col: SortColumn) => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 font-medium text-muted-foreground hover:text-foreground"
      onClick={() => onSort(column)}
    >
      <span>{title}</span>
      {currentSort === column && (
        sortDirection === 'asc'
          ? <ChevronUp className="ml-2 h-3.5 w-3.5 text-primary" />
          : <ChevronDown className="ml-2 h-3.5 w-3.5 text-primary" />
      )}
    </Button>
  );
}

export function ProjectStatisticsTable({
  items,
  isLoading,
  filters,
  onFilterChange,
}: ProjectStatisticsTableProps) {
  const t = useTranslations();
  const [sortColumn, setSortColumn] = useState<SortColumn>('projectNumber');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const toggleProjectNumber = (projectNumber: string) => {
    const newSelection = filters.selectedProjectNumbers.includes(projectNumber)
      ? filters.selectedProjectNumbers.filter((p) => p !== projectNumber)
      : [...filters.selectedProjectNumbers, projectNumber];
    onFilterChange({ ...filters, selectedProjectNumbers: newSelection });
  };

  // Get unique project numbers for filter
  const uniqueProjectNumbers = useMemo(() => {
    return [...new Set(items.map((item) => item.projectNumber))].sort();
  }, [items]);

  // Apply filters
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Filter out items with no hours worked
      const totalHours = item.productiveHours + item.nonProductiveHours + item.productiveZHours + item.nonProductiveZHours;
      if (totalHours <= 0) {
        return false;
      }
      // Project number filter
      if (filters.selectedProjectNumbers.length > 0 && !filters.selectedProjectNumbers.includes(item.projectNumber)) {
        return false;
      }
      // Project name search
      if (filters.projectNameSearch && !item.projectName.toLowerCase().includes(filters.projectNameSearch.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [items, filters]);

  // Calculate totals and man days
  const itemsWithCalculations = useMemo(() => {
    return filteredItems.map((item) => {
      const totalHours = item.productiveHours + item.nonProductiveHours + item.productiveZHours + item.nonProductiveZHours;
      const manDays = totalHours / 8;
      return { ...item, totalHours, manDays };
    });
  }, [filteredItems]);

  // Sort items
  const sortedItems = useMemo(() => {
    return [...itemsWithCalculations].sort((a, b) => {
      let aVal: string | number = a[sortColumn as keyof typeof a] as string | number;
      let bVal: string | number = b[sortColumn as keyof typeof b] as string | number;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [itemsWithCalculations, sortColumn, sortDirection]);

  // Calculate totals for summary row
  const totals = useMemo(() => {
    return sortedItems.reduce(
      (acc, item) => ({
        productiveHours: acc.productiveHours + item.productiveHours,
        nonProductiveHours: acc.nonProductiveHours + item.nonProductiveHours,
        productiveZHours: acc.productiveZHours + item.productiveZHours,
        nonProductiveZHours: acc.nonProductiveZHours + item.nonProductiveZHours,
        totalHours: acc.totalHours + item.totalHours,
        manDays: acc.manDays + item.manDays,
      }),
      { productiveHours: 0, nonProductiveHours: 0, productiveZHours: 0, nonProductiveZHours: 0, totalHours: 0, manDays: 0 }
    );
  }, [sortedItems]);

  return (
    <div className="rounded-md border border-border max-h-[500px] overflow-y-auto relative bg-background flex flex-col">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {/* Project Number with filter */}
            <TableHead className="w-[120px]">
              <ColumnFilterHeader
                title={t.projectStatistics?.projectNumber || 'Project No.'}
                column="projectNumber"
                currentSort={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                isActive={filters.selectedProjectNumbers.length > 0}
                filterContent={
                  <div className="space-y-3">
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {uniqueProjectNumbers.length > 0 ? uniqueProjectNumbers.map((projectNumber) => (
                          <div key={projectNumber} className="flex items-center space-x-2.5">
                            <Checkbox
                              id={`proj-${projectNumber}`}
                              checked={filters.selectedProjectNumbers.includes(projectNumber)}
                              onCheckedChange={() => toggleProjectNumber(projectNumber)}
                            />
                            <Label htmlFor={`proj-${projectNumber}`} className="text-sm font-normal leading-none cursor-pointer">
                              {projectNumber}
                            </Label>
                          </div>
                        )) : <div className="text-xs text-muted-foreground py-2">{t.common.none}</div>}
                      </div>
                    </ScrollArea>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8"
                      onClick={() => onFilterChange({ ...filters, selectedProjectNumbers: [] })}
                      disabled={filters.selectedProjectNumbers.length === 0}
                    >
                      {t.filters?.removeFilter || 'Clear filter'}
                    </Button>
                  </div>
                }
              />
            </TableHead>

            {/* Project Name with search filter */}
            <TableHead className="min-w-[200px]">
              <ColumnFilterHeader
                title={t.projectStatistics?.projectName || 'Project Name'}
                column="projectName"
                currentSort={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                isActive={filters.projectNameSearch.length > 0}
                filterContent={
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t.projects?.searchPlaceholder || 'Search...'}
                        value={filters.projectNameSearch}
                        onChange={(e) => onFilterChange({ ...filters, projectNameSearch: e.target.value })}
                        className="pl-8 h-9"
                        autoFocus
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8"
                      onClick={() => onFilterChange({ ...filters, projectNameSearch: '' })}
                      disabled={!filters.projectNameSearch}
                    >
                      {t.filters?.clearSearch || 'Clear search'}
                    </Button>
                  </div>
                }
              />
            </TableHead>

            {/* Numeric columns */}
            <TableHead className="text-center w-[100px]">
              <SortableHeader
                title={t.projectStatistics?.productiveSK || 'Prod SK'}
                column="productiveHours"
                currentSort={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className="text-center w-[100px]">
              <SortableHeader
                title={t.projectStatistics?.nonProductiveSK || 'NonProd SK'}
                column="nonProductiveHours"
                currentSort={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className="text-center w-[100px]">
              <SortableHeader
                title={t.projectStatistics?.productiveZ || 'Prod Z'}
                column="productiveZHours"
                currentSort={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className="text-center w-[100px]">
              <SortableHeader
                title={t.projectStatistics?.nonProductiveZ || 'NonProd Z'}
                column="nonProductiveZHours"
                currentSort={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className="text-center w-[100px]">
              <SortableHeader
                title={t.projectStatistics?.totalHours || 'Total'}
                column="totalHours"
                currentSort={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className="text-center w-[80px]">
              <SortableHeader
                title={t.projectStatistics?.manDays || 'MD'}
                column="manDays"
                currentSort={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              </TableCell>
            </TableRow>
          ) : sortedItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                {t.projectStatistics?.noData || 'No data for selected period'}
              </TableCell>
            </TableRow>
          ) : (
            <>
              {sortedItems.map((item, idx) => (
                <TableRow key={idx} className="group">
                  <TableCell className="font-medium whitespace-nowrap">
                    {item.projectNumber}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate" title={item.projectName}>
                    {item.projectName}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {item.productiveHours > 0 ? item.productiveHours.toFixed(2) : '-'}
                  </TableCell>
                  <TableCell className="text-center tabular-nums text-muted-foreground">
                    {item.nonProductiveHours > 0 ? item.nonProductiveHours.toFixed(2) : '-'}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {item.productiveZHours > 0 ? item.productiveZHours.toFixed(2) : '-'}
                  </TableCell>
                  <TableCell className="text-center tabular-nums text-muted-foreground">
                    {item.nonProductiveZHours > 0 ? item.nonProductiveZHours.toFixed(2) : '-'}
                  </TableCell>
                  <TableCell className="text-center tabular-nums font-medium">
                    {item.totalHours > 0 ? item.totalHours.toFixed(2) : '-'}
                  </TableCell>
                  <TableCell className="text-center tabular-nums font-semibold">
                    {item.manDays > 0 ? item.manDays.toFixed(2) : '-'}
                  </TableCell>
                </TableRow>
              ))}
              {/* Summary row */}
              <TableRow className="bg-primary/5 font-bold">
                <TableCell colSpan={2}>{t.projectStatistics?.total || 'Total'}</TableCell>
                <TableCell className="text-center tabular-nums">{totals.productiveHours.toFixed(2)}</TableCell>
                <TableCell className="text-center tabular-nums">{totals.nonProductiveHours.toFixed(2)}</TableCell>
                <TableCell className="text-center tabular-nums">{totals.productiveZHours.toFixed(2)}</TableCell>
                <TableCell className="text-center tabular-nums">{totals.nonProductiveZHours.toFixed(2)}</TableCell>
                <TableCell className="text-center tabular-nums">{totals.totalHours.toFixed(2)}</TableCell>
                <TableCell className="text-center tabular-nums">{totals.manDays.toFixed(2)}</TableCell>
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
      <div className="p-2 border-t border-border bg-muted/20 text-xs text-muted-foreground text-center shrink-0">
        {t.workRecords?.showing || 'Showing'} {sortedItems.length} {t.projects?.countSuffix || 'records'}
      </div>
    </div>
  );
}

