'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { Loader2, XCircle, Users } from 'lucide-react';
import { EMPLOYEES_QUERY, EmployeesData, Employee } from '@/graphql/queries/employees';
import { EmployeeTable } from '@/components/employee-table';
import { FilterControls, FilterState } from '@/components/filter-controls';
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

export default function EmployeesPage() {
  const { loading, error, data, refetch } = useQuery<EmployeesData>(EMPLOYEES_QUERY);
  const [filters, setFilters] = useState<FilterState>({
    searchText: '',
    adminFilter: 'all',
    employeeTypeFilter: 'all',
  });

  // Client-side filtering logic (Task 4.6)
  const filteredEmployees = useMemo(() => {
    if (!data?.employees) return [];

    return data.employees.filter((employee: Employee) => {
      // Text search filter
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        if (!employee.fullName.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Admin filter
      if (filters.adminFilter === 'admin' && !employee.isAdmin) {
        return false;
      }
      if (filters.adminFilter === 'non-admin' && employee.isAdmin) {
        return false;
      }

      // Employee type filter
      if (
        filters.employeeTypeFilter !== 'all' &&
        employee.employeeType !== filters.employeeTypeFilter
      ) {
        return false;
      }

      return true;
    });
  }, [data?.employees, filters]);

  // Loading state (Task 5.3)
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

  // Error state (Task 5.4)
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md border-destructive">
          <CardContent className="flex flex-col items-center gap-4 text-center">
            <XCircle className="h-12 w-12 text-destructive" />
            <CardHeader className="p-0">
              <CardTitle>Failed to load employees</CardTitle>
              <CardDescription>
                {error.message || 'An unexpected error occurred'}
              </CardDescription>
            </CardHeader>
            <Button onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state (Task 5.5)
  if (!data?.employees || data.employees.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4 text-center">
          <Users className="h-16 w-16 text-muted-foreground" />
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No employees found
            </h2>
            <p className="text-sm text-muted-foreground">
              Add your first employee to get started
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state with filters (Task 5.6, 5.7)
  const hasActiveFilters =
    filters.searchText !== '' ||
    filters.adminFilter !== 'all' ||
    filters.employeeTypeFilter !== 'all';

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
            <BreadcrumbPage>Employees</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page title */}
      <h1 className="text-3xl font-bold text-foreground mb-6">Employees</h1>

      {/* Filter controls */}
      <FilterControls onFilterChange={setFilters} />

      {/* Empty state after filtering */}
      {filteredEmployees.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground" />
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No employees match your filters
            </h2>
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters
                ? 'Try adjusting your filters to see more results'
                : 'No employees found in the database'}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Employee count */}
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredEmployees.length} of {data.employees.length} employees
          </div>

          {/* Employee table */}
          <EmployeeTable employees={filteredEmployees} />
        </>
      )}
    </div>
  );
}
