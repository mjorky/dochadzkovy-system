'use client';

import { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Lock,
  Filter,
  Search,
} from 'lucide-react';
import { useTranslations } from '@/contexts/dictionary-context';
import { Employee } from '@/graphql/queries/employees';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { Icons } from "@/lib/icons";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface EmployeeFilters {
  searchText: string;
  adminFilter: 'all' | 'admin' | 'non-admin';
  employeeTypes: string[];
}

type SortColumn = keyof Employee;
type SortDirection = 'asc' | 'desc';

interface EmployeeTableProps {
  employees: Employee[];
  filters: EmployeeFilters;
  onFilterChange: (filters: EmployeeFilters) => void;
  availableEmployeeTypes: string[];
  // NOVÉ: Informácia o dostupných admin statusoch pre dynamický filter
  availableAdminOptions: { hasAdmin: boolean; hasNonAdmin: boolean };
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
  onResetPassword?: (employee: Employee) => void;
}

const EditIcon = Icons.edit;
const TrashIcon = Icons.trash;

// ... ColumnFilterHeader ostáva nezmenený ...
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

export function EmployeeTable({
  employees,
  filters,
  onFilterChange,
  availableEmployeeTypes,
  availableAdminOptions, // Nové
  onEdit,
  onDelete,
  onResetPassword
}: EmployeeTableProps) {
  const t = useTranslations();
  const [sortColumn, setSortColumn] = useState<SortColumn>('fullName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedEmployees = [...employees].sort((a, b) => {
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const toggleEmployeeType = (type: string) => {
    const current = filters.employeeTypes;
    const next = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    onFilterChange({ ...filters, employeeTypes: next });
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent border-b border-border">
            {/* NAME + SEARCH */}
            <TableHead className="min-w-[200px]">
              <ColumnFilterHeader
                title={t.employees.fullName}
                column="fullName"
                currentSort={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                isActive={filters.searchText.length > 0}
                filterContent={
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t.employees.searchByName}
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

            {/* VACATION DAYS */}
            <TableHead className="w-[140px]">
              <Button
                variant="ghost" size="sm" className="-ml-3 h-8 font-medium text-muted-foreground hover:text-foreground"
                onClick={() => handleSort('vacationDays')}
              >
                {t.employees.vacationDays}
                {sortColumn === 'vacationDays' && (sortDirection === 'asc' ? <ChevronUp className="ml-2 h-3.5 w-3.5 text-primary" /> : <ChevronDown className="ml-2 h-3.5 w-3.5 text-primary" />)}
              </Button>
            </TableHead>

            {/* ADMIN STATUS - Dynamické Checkboxy */}
            <TableHead className="w-[120px]">
              <ColumnFilterHeader
                title={t.employees.admin}
                column="isAdmin"
                currentSort={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                isActive={filters.adminFilter !== 'all'}
                filterContent={
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2.5">
                        <Checkbox
                          id="admin-all"
                          checked={filters.adminFilter === 'all'}
                          onCheckedChange={() => onFilterChange({ ...filters, adminFilter: 'all' })}
                        />
                        <Label htmlFor="admin-all" className="font-normal cursor-pointer">{t.common.all}</Label>
                      </div>

                      {/* Zobraziť Admin možnosť len ak existujú admini v aktuálnom výbere */}
                      {availableAdminOptions.hasAdmin && (
                        <div className="flex items-center space-x-2.5">
                          <Checkbox
                            id="admin-yes"
                            checked={filters.adminFilter === 'admin'}
                            onCheckedChange={() => onFilterChange({ ...filters, adminFilter: 'admin' })}
                          />
                          <Label htmlFor="admin-yes" className="font-normal cursor-pointer">{t.employees.adminOnly}</Label>
                        </div>
                      )}

                      {/* Zobraziť Non-Admin možnosť len ak existujú non-admini v aktuálnom výbere */}
                      {availableAdminOptions.hasNonAdmin && (
                        <div className="flex items-center space-x-2.5">
                          <Checkbox
                            id="admin-no"
                            checked={filters.adminFilter === 'non-admin'}
                            onCheckedChange={() => onFilterChange({ ...filters, adminFilter: 'non-admin' })}
                          />
                          <Label htmlFor="admin-no" className="font-normal cursor-pointer">{t.employees.nonAdminOnly}</Label>
                        </div>
                      )}

                      {!availableAdminOptions.hasAdmin && !availableAdminOptions.hasNonAdmin && (
                        <div className="text-xs text-muted-foreground py-1">{t.common.none}</div>
                      )}
                    </div>
                  </div>
                }
              />
            </TableHead>

            {/* EMPLOYEE TYPE - Multi-select filter */}
            <TableHead className="w-[160px]">
              <ColumnFilterHeader
                title={t.employees.employeeType}
                column="employeeType"
                currentSort={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                isActive={filters.employeeTypes.length > 0}
                filterContent={
                  <div className="space-y-3">
                    <div className="space-y-2">
                      {availableEmployeeTypes.length > 0 ? availableEmployeeTypes.map((type) => (
                        <div key={type} className="flex items-center space-x-2.5">
                          <Checkbox
                            id={`type-${type}`}
                            checked={filters.employeeTypes.includes(type)}
                            onCheckedChange={() => toggleEmployeeType(type)}
                          />
                          <Label htmlFor={`type-${type}`} className="text-sm font-normal leading-none cursor-pointer">
                            {type}
                          </Label>
                        </div>
                      )) : <div className="text-xs text-muted-foreground py-2">{t.employees.noTypesAvailable}</div>}
                    </div>
                    <Button
                      variant="outline" size="sm" className="w-full text-xs h-8"
                      onClick={() => onFilterChange({ ...filters, employeeTypes: [] })}
                      disabled={filters.employeeTypes.length === 0}
                    >
                      {t.filters.removeFilter}
                    </Button>
                  </div>
                }
              />
            </TableHead>

            <TableHead className="font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('lastRecordDate')}>{t.employees.lastRecord}</TableHead>
            <TableHead className="font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('lockedUntil')}>{t.employees.lockedUntil}</TableHead>
            <TableHead className="font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('titlePrefix')}>{t.employees.titlePrefix}</TableHead>
            <TableHead className="font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('titleSuffix')}>{t.employees.titleSuffix}</TableHead>

            <TableHead className="w-[80px] text-right font-medium text-muted-foreground">{t.common.actions}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sortedEmployees.map((employee) => (
            <TableRow key={employee.id} className="group hover:bg-muted/30 transition-colors border-border">
              <TableCell className="font-medium text-foreground">{employee.fullName}</TableCell>
              <TableCell className="font-mono text-sm">{employee.vacationDays.toFixed(1)}</TableCell>
              <TableCell>
                {employee.isAdmin ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 font-normal">
                    {t.employees.admin}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="font-normal text-muted-foreground">{t.common.no}</Badge>
                )}
              </TableCell>
              <TableCell>{employee.employeeType}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(employee.lastRecordDate)}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(employee.lockedUntil)}</TableCell>
              <TableCell className="text-muted-foreground">{employee.titlePrefix || '—'}</TableCell>
              <TableCell className="text-muted-foreground">{employee.titleSuffix || '—'}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => onResetPassword?.(employee)} className="h-8 w-8 text-muted-foreground hover:text-foreground" title={t.employees.resetPassword}>
                    <Lock className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onEdit?.(employee)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <EditIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete?.(employee)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {sortedEmployees.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                {t.table.noResults}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}