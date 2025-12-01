'use client';

import { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Filter,
  Search,
  Check,
  Edit2,
  Trash2,
  Loader2
} from 'lucide-react';
import { useTranslations } from '@/contexts/dictionary-context';
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
import { type Project, type Country } from "@/graphql/queries/projects";

type SortColumn = 'number' | 'name' | 'country' | 'manager' | 'active';
type SortDirection = 'asc' | 'desc';

export interface ProjectFilters {
  searchText: string;
  selectedCountries: string[];
  selectedManagers: string[];
  activeStatus: 'all' | 'active' | 'inactive';
}

export interface ProjectsTableProps {
  projects: Project[];
  countries: Country[];
  managers: { id: string, fullName: string }[];
  // NOVÉ: Informácia o tom, aké statusy sú dostupné
  availableStatuses: { hasActive: boolean; hasInactive: boolean };
  filters: ProjectFilters;
  onFilterChange: (filters: ProjectFilters) => void;
  isLoading?: boolean;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

// ... ColumnFilterHeader a getSortValue ostávajú nezmenené ...
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
        className="-ml-3 h-8 font-medium text-muted-foreground hover:text-foreground data-[state=open]:bg-accent"
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
            <span className="sr-only">Filter {title}</span>
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

const getSortValue = (project: Project, column: SortColumn): any => {
  switch (column) {
    case 'country':
      return project.country?.name || project.country?.countryCode || '';
    case 'manager':
      return project.manager.fullName || '';
    case 'active':
      return project.active;
    default:
      return project[column];
  }
}

export function ProjectsTable({
  projects,
  countries,
  managers,
  availableStatuses, // NOVÉ
  filters,
  onFilterChange,
  isLoading = false,
  onEdit,
  onDelete
}: ProjectsTableProps) {
  const t = useTranslations();

  const [sortColumn, setSortColumn] = useState<SortColumn>('number');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }

  const sortedProjects = [...projects].sort((a, b) => {
    const aValue = getSortValue(a, sortColumn);
    const bValue = getSortValue(b, sortColumn);

    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
    if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      return sortDirection === 'asc'
        ? Number(bValue) - Number(aValue)
        : Number(aValue) - Number(bValue);
    }

    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    return sortDirection === 'asc'
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });

  const toggleSelection = (currentIds: string[], id: string) => {
    return currentIds.includes(id)
      ? currentIds.filter(item => item !== id)
      : [...currentIds, id];
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="rounded-md border border-border max-h-[600px] overflow-y-auto relative bg-background flex flex-col">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {/* NUMBER */}
            <TableHead className="w-[120px]">
              <Button
                variant="ghost" size="sm" className="-ml-3 h-8 font-medium text-muted-foreground hover:text-foreground"
                onClick={() => handleSort('number')}
              >
                {t.projects.number}
                {sortColumn === 'number' && (sortDirection === 'asc' ? <ChevronUp className="ml-2 h-3.5 w-3.5 text-primary" /> : <ChevronDown className="ml-2 h-3.5 w-3.5 text-primary" />)}
              </Button>
            </TableHead>

            {/* NAME + SEARCH */}
            <TableHead className="min-w-[200px]">
              <ColumnFilterHeader
                title={t.projects.name}
                column="name"
                currentSort={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                isActive={filters.searchText.length > 0}
                filterContent={
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t.projects.searchPlaceholder}
                        value={filters.searchText}
                        onChange={(e) => onFilterChange({ ...filters, searchText: e.target.value })}
                        className="pl-8 h-9"
                        autoFocus
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

            {/* COUNTRY */}
            <TableHead className="w-[180px]">
              <ColumnFilterHeader
                title={t.projects.country}
                column="country"
                currentSort={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                isActive={filters.selectedCountries.length > 0}
                filterContent={
                  <div className="space-y-3">
                    <ScrollArea className="h-[200px] pr-3">
                      <div className="space-y-2">
                        {countries.length > 0 ? countries.map((country) => (
                          <div key={country.id} className="flex items-center space-x-2.5">
                            <Checkbox
                              id={`country-${country.id}`}
                              checked={filters.selectedCountries.includes(country.id)}
                              onCheckedChange={() => {
                                const newSelection = toggleSelection(filters.selectedCountries, country.id);
                                onFilterChange({ ...filters, selectedCountries: newSelection });
                              }}
                            />
                            <Label htmlFor={`country-${country.id}`} className="text-sm font-normal leading-none cursor-pointer">
                              {country.name} <span className="text-xs text-muted-foreground ml-1">({country.countryCode})</span>
                            </Label>
                          </div>
                        )) : <div className="text-xs text-muted-foreground py-2">{t.projects.noCountriesAvailable}</div>}
                      </div>
                    </ScrollArea>
                    <Button
                      variant="outline" size="sm" className="w-full text-xs h-8"
                      onClick={() => onFilterChange({ ...filters, selectedCountries: [] })}
                      disabled={filters.selectedCountries.length === 0}
                    >
                      {t.filters.removeFilter}
                    </Button>
                  </div>
                }
              />
            </TableHead>

            {/* MANAGER */}
            <TableHead className="w-[200px]">
              <ColumnFilterHeader
                title={t.projects.manager}
                column="manager"
                currentSort={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                isActive={filters.selectedManagers.length > 0}
                filterContent={
                  <div className="space-y-3">
                    <ScrollArea className="h-[200px] pr-3">
                      <div className="space-y-2">
                        {managers.length > 0 ? managers.map((manager) => (
                          <div key={manager.id} className="flex items-center space-x-2.5">
                            <Checkbox
                              id={`mgr-${manager.id}`}
                              checked={filters.selectedManagers.includes(manager.id)}
                              onCheckedChange={() => {
                                const newSelection = toggleSelection(filters.selectedManagers, manager.id);
                                onFilterChange({ ...filters, selectedManagers: newSelection });
                              }}
                            />
                            <Label htmlFor={`mgr-${manager.id}`} className="text-sm font-normal leading-none cursor-pointer">
                              {manager.fullName}
                            </Label>
                          </div>
                        )) : <div className="text-xs text-muted-foreground py-2">{t.projects.noManagersAvailable}</div>}
                      </div>
                    </ScrollArea>
                    <Button
                      variant="outline" size="sm" className="w-full text-xs h-8"
                      onClick={() => onFilterChange({ ...filters, selectedManagers: [] })}
                      disabled={filters.selectedManagers.length === 0}
                    >
                      {t.filters.removeFilter}
                    </Button>
                  </div>
                }
              />
            </TableHead>

            {/* ACTIVE (STATUS) - UPRAVENÉ */}
            <TableHead className="w-[120px]">
              <ColumnFilterHeader
                title={t.common.status}
                column="active"
                currentSort={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                isActive={filters.activeStatus !== 'all'}
                filterContent={
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2.5">
                        <Checkbox
                          id="status-all"
                          checked={filters.activeStatus === 'all'}
                          onCheckedChange={() => onFilterChange({ ...filters, activeStatus: 'all' })}
                        />
                        <Label htmlFor="status-all" className="font-normal cursor-pointer">{t.common.all}</Label>
                      </div>

                      {/* Zobrazíme ACTIVE len ak existuje nejaký aktívny projekt v aktuálnom kontexte */}
                      {availableStatuses.hasActive && (
                        <div className="flex items-center space-x-2.5">
                          <Checkbox
                            id="status-active"
                            checked={filters.activeStatus === 'active'}
                            onCheckedChange={() => onFilterChange({ ...filters, activeStatus: 'active' })}
                          />
                          <Label htmlFor="status-active" className="font-normal cursor-pointer">{t.projects.active}</Label>
                        </div>
                      )}

                      {/* Zobrazíme INACTIVE len ak existuje nejaký neaktívny projekt v aktuálnom kontexte */}
                      {availableStatuses.hasInactive && (
                        <div className="flex items-center space-x-2.5">
                          <Checkbox
                            id="status-inactive"
                            checked={filters.activeStatus === 'inactive'}
                            onCheckedChange={() => onFilterChange({ ...filters, activeStatus: 'inactive' })}
                          />
                          <Label htmlFor="status-inactive" className="font-normal cursor-pointer">{t.projects.inactive}</Label>
                        </div>
                      )}

                      {!availableStatuses.hasActive && !availableStatuses.hasInactive && (
                        <div className="text-xs text-muted-foreground py-1">{t.common.none}</div>
                      )}
                    </div>
                  </div>
                }
              />
            </TableHead>

            <TableHead className="w-[80px] text-right font-medium text-muted-foreground">{t.common.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProjects.map((project) => (
            <TableRow key={project.id} className="group">
              <TableCell className="font-semibold">{project.number}</TableCell>
              <TableCell className="font-medium text-foreground">{project.name}</TableCell>
              <TableCell className="text-muted-foreground">{project.country?.name || project.country?.countryCode}</TableCell>
              <TableCell className="text-muted-foreground">{project.manager.fullName}</TableCell>

              <TableCell>
                {project.active ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 font-normal">
                    {t.projects.active}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="font-normal text-muted-foreground">
                    {t.projects.inactive}
                  </Badge>
                )}
              </TableCell>

              <TableCell>
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => onEdit?.(project)}
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => onDelete?.(project)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {sortedProjects.length === 0 && !isLoading && (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                {t.table.noResults}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="p-2 border-t border-border bg-muted/20 text-xs text-muted-foreground text-center shrink-0">
        {t.workRecords.showing} {sortedProjects.length} {t.projects.countSuffix}
      </div>
    </div>
  )
}