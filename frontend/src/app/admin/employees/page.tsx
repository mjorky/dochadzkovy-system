'use client';

import { AdminGuard } from "@/components/admin-guard";
import { useState, useMemo, useDeferredValue } from 'react';
import { useQuery } from '@apollo/client/react';
import { Loader2, XCircle, Users, Plus } from 'lucide-react';
import { EMPLOYEES_QUERY, EmployeesData, Employee } from '@/graphql/queries/employees';
import { EmployeeTable } from '@/components/employee-table';
import { EmployeeDialog } from '@/components/employee-dialog';
import { ResetPasswordDialog } from '@/components/reset-password-dialog';
import { useDeleteEmployee } from '@/hooks/use-delete-employee';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FilterControls } from '@/components/ui/filter-controls';
import { SearchInput } from '@/components/ui/search-input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface FilterState {
  searchText: string;
  adminFilter: 'all' | 'admin' | 'non-admin';
  employeeTypeFilter: string;
}

export default function EmployeesPage() {
  const { loading, error, data, refetch } = useQuery<EmployeesData>(EMPLOYEES_QUERY);
  const { deleteEmployee } = useDeleteEmployee();
  
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "reset-password" | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  const handleCreate = () => {
    setSelectedEmployee(null);
    setDialogMode("create");
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDialogMode("edit");
  };

  const handleResetPassword = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDialogMode("reset-password");
  };

  const handleDelete = (employee: Employee) => {
    setDeleteId(employee.id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteEmployee(deleteId);
      setDeleteId(null);
    }
  };

  const handleSuccess = () => {
    setDialogMode(null);
  };

  if (loading) {
    return (
      <AdminGuard>
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
      </AdminGuard>
    );
  }

  if (error) {
    return (
      <AdminGuard>
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
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
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

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">Employees</h1>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

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
              <SelectItem value="SZČO">SZČO</SelectItem>
              <SelectItem value="Študent">Študent</SelectItem>
              <SelectItem value="Brigádnik">Brigádnik</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FilterControls>

      {!data?.employees || data.employees.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground" />
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No employees found</h2>
            <p className="text-sm text-muted-foreground">Add your first employee to get started</p>
          </div>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground" />
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No employees match your filters</h2>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters to see more results
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredEmployees.length} of {data.employees.length} employees
          </div>
          <EmployeeTable 
            employees={filteredEmployees} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            onResetPassword={handleResetPassword}
          />
        </>
      )}

      <EmployeeDialog
        open={dialogMode === 'create' || dialogMode === 'edit'}
        onOpenChange={(open) => !open && setDialogMode(null)}
        mode={(dialogMode === 'create' || dialogMode === 'edit') ? dialogMode : 'create'}
        initialData={selectedEmployee}
        onSuccess={handleSuccess}
      />

      <ResetPasswordDialog
        open={dialogMode === 'reset-password'}
        onOpenChange={(open) => !open && setDialogMode(null)}
        employee={selectedEmployee}
      />

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee
              and all their work records from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </AdminGuard>
  );
}
