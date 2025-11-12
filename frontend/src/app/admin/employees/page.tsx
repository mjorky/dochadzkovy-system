'use client';

import { useState, useMemo, useDeferredValue } from 'react';
import { useQuery } from '@apollo/client/react';
import { Loader2, XCircle, Users } from 'lucide-react';
import { EMPLOYEES_QUERY, EmployeesData, Employee } from '@/graphql/queries/employees';
import { EmployeeTable } from '@/components/employee-table';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FilterControls } from '@/components/ui/filter-controls';
import { SearchInput } from '@/components/ui/search-input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FilterState {
  searchText: string;
  adminFilter: 'all' | 'admin' | 'non-admin';
  employeeTypeFilter: string;
}

export default function EmployeesPage() {
  const { loading, error, data, refetch } = useQuery<EmployeesData>(EMPLOYEES_QUERY);
  
  const [filters, setFilters] = useState<FilterState>({
    searchText: '',
    adminFilter: 'all',
    employeeTypeFilter: 'all',
  });

  const deferredSearchText = useDeferredValue(filters.searchText);

  const filteredEmployees = useMemo(() => {
    if (!data?.employees) return [];
    return data.employees.filter((employee: Employee) => {
      if (deferredSearchText && !employee.fullName.toLowerCase().includes(deferredSearchText.toLowerCase())) {
        return false;
      }
      if (filters.adminFilter === 'admin' && !employee.isAdmin) {
        return false;
      }
      if (filters.adminFilter === 'non-admin' && employee.isAdmin) {
        return false;
      }
      if (filters.employeeTypeFilter !== 'all' && employee.employeeType !== filters.employeeTypeFilter) {
        return false;
      }
      return true;
    });
  }, [data?.employees, deferredSearchText, filters.adminFilter, filters.employeeTypeFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md border-destructive">
          <CardContent className="flex flex-col items-center gap-4 text-center p-6">
            <XCircle className="h-12 w-12 text-destructive" />
            <CardHeader className="p-0">
              <CardTitle>Failed to load employees</CardTitle>
              <CardDescription>{error.message || 'An unexpected error occurred'}</CardDescription>
            </CardHeader>
            <Button onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data?.employees || data.employees.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4 text-center">
          <Users className="h-16 w-16 text-muted-foreground" />
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No employees found</h2>
            <p className="text-sm text-muted-foreground">Add your first employee to get started</p>
          </div>
        </div>
      </div>
    );
  }

  const hasActiveFilters =
    filters.searchText !== '' ||
    filters.adminFilter !== 'all' ||
    filters.employeeTypeFilter !== 'all';

  return (
    <div className="p-8">
      <Breadcrumb className="mb-2">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="/admin">Admin</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Employees</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold text-foreground mb-6">Employees</h1>

      <FilterControls>
        <SearchInput
          label="Search"
          placeholder="Search by name..."
          value={filters.searchText}
          onChange={(value) => setFilters(prev => ({ ...prev, searchText: value }))}
        />
        <div className="min-w-[180px]">
          <Label className="block text-sm font-medium text-foreground mb-1">
            Admin Status
          </Label>
          <Select
            value={filters.adminFilter}
            onValueChange={(value) => setFilters(prev => ({ ...prev, adminFilter: value as FilterState['adminFilter'] }))}
          >
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="admin">Admin Only</SelectItem>
              <SelectItem value="non-admin">Non-Admin Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[180px]">
          <Label className="block text-sm font-medium text-foreground mb-1">
            Employee Type
          </Label>
          <Select
            value={filters.employeeTypeFilter}
            onValueChange={(value) => setFilters(prev => ({ ...prev, employeeTypeFilter: value }))}
          >
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Zamestnanec">Zamestnanec</SelectItem>
              <SelectItem value="SZCO">SZCO</SelectItem>
              <SelectItem value="Študent">Študent</SelectItem>
              <SelectItem value="Brigádnik">Brigádnik</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FilterControls>

      {filteredEmployees.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground" />
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No employees match your filters</h2>
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters
                ? 'Try adjusting your filters to see more results'
                : 'No employees found in the database'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredEmployees.length} of {data.employees.length} employees
          </div>
          <EmployeeTable employees={filteredEmployees} />
        </>
      )}
    </div>
  );
}