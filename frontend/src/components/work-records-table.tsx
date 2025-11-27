'use client';

import { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Lock,
  Moon,
  Pencil,
  Trash2,
  CopyPlus,
  Filter,
  Search
} from 'lucide-react';
import { useTranslations } from '@/contexts/dictionary-context';
import { WorkRecord, ProjectOption, AbsenceTypeOption, ProductivityTypeOption, WorkTypeOption } from '@/graphql/queries/work-records';
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
import { WorkRecordsFilterState } from '@/types/work-records-filters';

type SortColumn = keyof WorkRecord;
type SortDirection = 'asc' | 'desc';

interface WorkRecordsTableProps {
  workRecords: WorkRecord[];
  filters: WorkRecordsFilterState;
  onFilterChange: (filters: WorkRecordsFilterState) => void;
  options: {
    projects: ProjectOption[];
    absenceTypes: AbsenceTypeOption[];
    productivityTypes: ProductivityTypeOption[];
    workTypes: WorkTypeOption[];
  };
  // NOVÉ PROPS PRE DYNAMICKÉ FILTRE
  availableLockOptions: { hasLocked: boolean; hasUnlocked: boolean };
  availableTripOptions: { hasTrip: boolean; hasNoTrip: boolean };

  onEdit?: (record: WorkRecord) => void;
  onDelete?: (record: WorkRecord) => void;
  onCopy?: (record: WorkRecord) => void;
}

// ... ColumnFilterHeader ostáva rovnaký ...
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

export function WorkRecordsTable({
  workRecords,
  filters,
  onFilterChange,
  options,
  availableLockOptions, // Nové
  availableTripOptions, // Nové
  onEdit,
  onDelete,
  onCopy
}: WorkRecordsTableProps) {
  const t = useTranslations();
  const [sortColumn, setSortColumn] = useState<SortColumn>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedRecords = [...workRecords].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
    if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      return sortDirection === 'asc' ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
    }
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  const formatTime = (timeString: string) => timeString.substring(0, 5);
  const showActions = onEdit || onDelete || onCopy;

  const toggleSelection = (currentIds: string[], id: string) => {
    return currentIds.includes(id)
      ? currentIds.filter(item => item !== id)
      : [...currentIds, id];
  };

  return (
    <div className="min-w-[1200px] border border-border rounded-xl overflow-hidden shadow-sm bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent border-b border-border">
            {/* DATE */}
            <TableHead className="w-[130px]">
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 font-medium text-muted-foreground hover:text-foreground"
                onClick={() => handleSort('date')}
              >
                {t.workRecords.date}
                {sortColumn === 'date' && (sortDirection === 'asc' ? <ChevronUp className="ml-2 h-3.5 w-3.5 text-primary" /> : <ChevronDown className="ml-2 h-3.5 w-3.5 text-primary" />)}
              </Button>
            </TableHead>

            {/* ABSENCE TYPE */}
            <TableHead>
              <ColumnFilterHeader
                title={t.filters.absence}
                column="absenceType"
                currentSort={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                isActive={filters.selectedAbsenceTypes.length > 0}
                filterContent={
                  <div className="space-y-3">
                    <ScrollArea className="h-[200px] pr-3">
                      <div className="space-y-2">
                        {options.absenceTypes.length > 0 ? options.absenceTypes.map((type) => (
                          <div key={type.id} className="flex items-center space-x-2.5">
                            <Checkbox
                              id={`abs-${type.id}`}
                              checked={filters.selectedAbsenceTypes.includes(type.id)}
                              onCheckedChange={() => {
                                const newTypes = toggleSelection(filters.selectedAbsenceTypes, type.id);
                                onFilterChange({ ...filters, selectedAbsenceTypes: newTypes });
                              }}
                            />
                            <Label htmlFor={`abs-${type.id}`} className="text-sm font-normal leading-none cursor-pointer">{type.alias}</Label>
                          </div>
                        )) : <div className="text-xs text-muted-foreground py-2">{t.common.none}</div>}
                      </div>
                    </ScrollArea>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8"
                      onClick={() => onFilterChange({ ...filters, selectedAbsenceTypes: [] })}
                      disabled={filters.selectedAbsenceTypes.length === 0}
                    >
                      {t.filters.removeFilter}
                    </Button>
                  </div>
                }
              />
            </TableHead>

            {/* PROJECT, PRODUCTIVITY, WORK TYPE... (Bez zmeny, kód skrátený pre prehľadnosť) */}
            <TableHead>
              <ColumnFilterHeader
                title={t.workRecords.project}
                column="project"
                currentSort={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                isActive={filters.selectedProjects.length > 0}
                filterContent={
                  <div className="space-y-3">
                    <ScrollArea className="h-[200px] pr-3">
                      <div className="space-y-2">
                        {options.projects.length > 0 ? options.projects.map((proj) => (
                          <div key={proj.id} className="flex items-center space-x-2.5">
                            <Checkbox
                              id={`proj-${proj.id}`}
                              checked={filters.selectedProjects.includes(proj.id)}
                              onCheckedChange={() => {
                                const newProjs = toggleSelection(filters.selectedProjects, proj.id);
                                onFilterChange({ ...filters, selectedProjects: newProjs });
                              }}
                            />
                            <Label htmlFor={`proj-${proj.id}`} className="text-sm font-mono font-normal leading-none cursor-pointer">{proj.number}</Label>
                          </div>
                        )) : <div className="text-xs text-muted-foreground py-2">{t.common.none}</div>}
                      </div>
                    </ScrollArea>
                    <Button
                      variant="outline" size="sm" className="w-full text-xs h-8"
                      onClick={() => onFilterChange({ ...filters, selectedProjects: [] })}
                      disabled={filters.selectedProjects.length === 0}
                    >
                      {t.filters.removeFilter}
                    </Button>
                  </div>
                }
              />
            </TableHead>

            <TableHead>
              <ColumnFilterHeader
                title={t.filters.productivity}
                column="productivityType"
                currentSort={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                isActive={filters.selectedProductivityTypes.length > 0}
                filterContent={
                  <div className="space-y-3">
                    <div className="space-y-2">
                      {options.productivityTypes.length > 0 ? options.productivityTypes.map((type) => (
                        <div key={type.id} className="flex items-center space-x-2.5">
                          <Checkbox
                            id={`prod-${type.id}`}
                            checked={filters.selectedProductivityTypes.includes(type.id)}
                            onCheckedChange={() => {
                              const newTypes = toggleSelection(filters.selectedProductivityTypes, type.id);
                              onFilterChange({ ...filters, selectedProductivityTypes: newTypes });
                            }}
                          />
                          <Label htmlFor={`prod-${type.id}`} className="text-sm font-normal leading-none cursor-pointer">{type.hourType}</Label>
                        </div>
                      )) : <div className="text-xs text-muted-foreground py-2">{t.common.none}</div>}
                    </div>
                    <Button
                      variant="outline" size="sm" className="w-full text-xs h-8"
                      onClick={() => onFilterChange({ ...filters, selectedProductivityTypes: [] })}
                      disabled={filters.selectedProductivityTypes.length === 0}
                    >
                      {t.filters.removeFilter}
                    </Button>
                  </div>
                }
              />
            </TableHead>

            <TableHead>
              <ColumnFilterHeader
                title={t.filters.workType}
                column="workType"
                currentSort={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                isActive={filters.selectedWorkTypes.length > 0}
                filterContent={
                  <div className="space-y-3">
                    <div className="space-y-2">
                      {options.workTypes.length > 0 ? options.workTypes.map((type) => (
                        <div key={type.id} className="flex items-center space-x-2.5">
                          <Checkbox
                            id={`work-${type.id}`}
                            checked={filters.selectedWorkTypes.includes(type.id)}
                            onCheckedChange={() => {
                              const newTypes = toggleSelection(filters.selectedWorkTypes, type.id);
                              onFilterChange({ ...filters, selectedWorkTypes: newTypes });
                            }}
                          />
                          <Label htmlFor={`work-${type.id}`} className="text-sm font-normal leading-none cursor-pointer">{type.hourType}</Label>
                        </div>
                      )) : <div className="text-xs text-muted-foreground py-2">{t.common.none}</div>}
                    </div>
                    <Button
                      variant="outline" size="sm" className="w-full text-xs h-8"
                      onClick={() => onFilterChange({ ...filters, selectedWorkTypes: [] })}
                      disabled={filters.selectedWorkTypes.length === 0}
                    >
                      {t.filters.removeFilter}
                    </Button>
                  </div>
                }
              />
            </TableHead>

            <TableHead className="font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('startTime')}>{t.workRecords.startTime}</TableHead>
            <TableHead className="font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('endTime')}>{t.workRecords.endTime}</TableHead>
            <TableHead className="font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors text-right" onClick={() => handleSort('hours')}>{t.workRecords.hours}</TableHead>

            <TableHead>
              <ColumnFilterHeader
                title={t.workRecords.description}
                column="description"
                currentSort={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                isActive={filters.searchText.length > 0}
                filterContent={
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t.workRecords.searchPlaceholder}
                        value={filters.searchText}
                        onChange={(e) => onFilterChange({ ...filters, searchText: e.target.value })}
                        className="pl-8 h-9"
                      />
                    </div>
                    <Button
                      variant="outline" size="sm" className="w-full text-xs h-8"
                      onClick={() => onFilterChange({ ...filters, searchText: '' })}
                      disabled={!filters.searchText}
                    >
                      {t.filters.clearSearch}
                    </Button>
                  </div>
                }
              />
            </TableHead>

            <TableHead className="font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors text-right" onClick={() => handleSort('km')}>{t.workRecords.kilometers}</TableHead>

            {/* TRIP - AKTUALIZOVANÉ PRE DYNAMICKÉ ZOBRAZENIE */}
            <TableHead>
              <ColumnFilterHeader
                title={t.filters.tripFlag}
                column="isTripFlag"
                currentSort={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                isActive={filters.tripFlag !== 'all'}
                filterContent={
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2.5">
                      <Checkbox
                        id="trip-all"
                        checked={filters.tripFlag === 'all'}
                        onCheckedChange={() => onFilterChange({ ...filters, tripFlag: 'all' })}
                      />
                      <Label htmlFor="trip-all" className="font-normal cursor-pointer">{t.common.all}</Label>
                    </div>

                    {/* Zobraz Yes len ak existujú dáta */}
                    {availableTripOptions.hasTrip && (
                      <div className="flex items-center space-x-2.5">
                        <Checkbox
                          id="trip-yes"
                          checked={filters.tripFlag === 'yes'}
                          onCheckedChange={() => onFilterChange({ ...filters, tripFlag: 'yes' })}
                        />
                        <Label htmlFor="trip-yes" className="font-normal cursor-pointer">{t.filters.withTrip}</Label>
                      </div>
                    )}

                    {/* Zobraz No len ak existujú dáta */}
                    {availableTripOptions.hasNoTrip && (
                      <div className="flex items-center space-x-2.5">
                        <Checkbox
                          id="trip-no"
                          checked={filters.tripFlag === 'no'}
                          onCheckedChange={() => onFilterChange({ ...filters, tripFlag: 'no' })}
                        />
                        <Label htmlFor="trip-no" className="font-normal cursor-pointer">{t.filters.withoutTrip}</Label>
                      </div>
                    )}

                    {!availableTripOptions.hasTrip && !availableTripOptions.hasNoTrip && (
                      <div className="text-xs text-muted-foreground py-1">{t.common.none}</div>
                    )}
                  </div>
                }
              />
            </TableHead>

            {/* LOCKED - AKTUALIZOVANÉ PRE DYNAMICKÉ ZOBRAZENIE */}
            <TableHead>
              <ColumnFilterHeader
                title={t.filters.lockStatus}
                column="isLocked"
                currentSort={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                isActive={filters.lockStatus !== 'all'}
                filterContent={
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2.5">
                      <Checkbox
                        id="lock-all"
                        checked={filters.lockStatus === 'all'}
                        onCheckedChange={() => onFilterChange({ ...filters, lockStatus: 'all' })}
                      />
                      <Label htmlFor="lock-all" className="font-normal cursor-pointer">{t.common.all}</Label>
                    </div>

                    {availableLockOptions.hasLocked && (
                      <div className="flex items-center space-x-2.5">
                        <Checkbox
                          id="lock-yes"
                          checked={filters.lockStatus === 'locked'}
                          onCheckedChange={() => onFilterChange({ ...filters, lockStatus: 'locked' })}
                        />
                        <Label htmlFor="lock-yes" className="font-normal cursor-pointer">{t.filters.locked}</Label>
                      </div>
                    )}

                    {availableLockOptions.hasUnlocked && (
                      <div className="flex items-center space-x-2.5">
                        <Checkbox
                          id="lock-no"
                          checked={filters.lockStatus === 'unlocked'}
                          onCheckedChange={() => onFilterChange({ ...filters, lockStatus: 'unlocked' })}
                        />
                        <Label htmlFor="lock-no" className="font-normal cursor-pointer">{t.filters.unlocked}</Label>
                      </div>
                    )}

                    {!availableLockOptions.hasLocked && !availableLockOptions.hasUnlocked && (
                      <div className="text-xs text-muted-foreground py-1">{t.common.none}</div>
                    )}
                  </div>
                }
              />
            </TableHead>

            {showActions && <TableHead className="text-center font-medium text-muted-foreground">{t.common.actions}</TableHead>}
          </TableRow>
        </TableHeader>

        <TableBody>
          {sortedRecords.map((record) => (
            <TableRow
              key={record.id}
              className={cn(
                "group hover:bg-muted/30 transition-colors border-border",
                record.isLocked && 'bg-muted/10 opacity-70'
              )}
            >
              {/* Table Rows Content (rovnaké ako predtým) */}
              <TableCell className="whitespace-nowrap font-medium text-foreground">{formatDate(record.date)}</TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">{record.absenceType}</TableCell>
              <TableCell className="font-mono text-sm">{record.project ?? '—'}</TableCell>
              <TableCell className="text-muted-foreground">{record.productivityType ?? '—'}</TableCell>
              <TableCell className="text-muted-foreground">{record.workType ?? '—'}</TableCell>
              <TableCell className="whitespace-nowrap font-mono text-sm">{formatTime(record.startTime)}</TableCell>
              <TableCell className="whitespace-nowrap font-mono text-sm">
                <div className="flex items-center gap-2">
                  {formatTime(record.endTime)}
                  {record.isOvernightShift && <Moon className="h-3.5 w-3.5 text-blue-500" />}
                </div>
              </TableCell>
              <TableCell className="text-right font-mono font-medium">{record.hours.toFixed(2)}</TableCell>
              <TableCell className="max-w-[200px] truncate text-muted-foreground" title={record.description || ''}>{record.description || '—'}</TableCell>
              <TableCell className="text-right font-mono text-sm">{record.km}</TableCell>
              <TableCell className="text-center">
                {record.isTripFlag ? <Badge variant="outline" className="bg-blue-50/50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">{t.common.yes}</Badge> : <span className="text-muted-foreground text-xs">-</span>}
              </TableCell>
              <TableCell className="text-center">
                {record.isLocked && <Lock className="h-3.5 w-3.5 text-destructive mx-auto" />}
              </TableCell>
              {showActions && (
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onCopy && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => onCopy(record)}>
                        <CopyPlus className="h-4 w-4" />
                      </Button>
                    )}
                    {!record.isLocked && onEdit && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onEdit(record)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {!record.isLocked && onDelete && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(record)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}