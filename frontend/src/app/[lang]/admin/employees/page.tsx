"use client";

import { AdminGuard } from "@/components/admin-guard";
import { useState, useMemo } from "react";
import { useTranslations } from "@/contexts/dictionary-context";
import { useQuery } from "@apollo/client/react";
import { Loader2, XCircle, Users, Plus } from "lucide-react";
import {
  EMPLOYEES_QUERY,
  EmployeesData,
  Employee,
} from "@/graphql/queries/employees";
import {
  EmployeeTable,
  type EmployeeFilters,
} from "@/components/employee-table";
import { EmployeeDialog } from "@/components/employee-dialog";
import { ResetPasswordDialog } from "@/components/reset-password-dialog";
import { useDeleteEmployee } from "@/hooks/use-delete-employee";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function EmployeesPage() {
  const { loading, error, data, refetch } =
    useQuery<EmployeesData>(EMPLOYEES_QUERY);
  const { deleteEmployee } = useDeleteEmployee();
  const t = useTranslations();

  const [dialogMode, setDialogMode] = useState<
    "create" | "edit" | "reset-password" | null
  >(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // State pre filtre
  const [filters, setFilters] = useState<EmployeeFilters>({
    searchText: "",
    adminFilter: "all",
    employeeTypes: [], // Empty means "All"
  });

  const allEmployees = useMemo(() => data?.employees || [], [data?.employees]);

  // --- FACETED SEARCH LOGIC ---

  // 1. BASE: Filtrujeme podľa Search Textu (základ pre ostatné)
  const baseEmployees = useMemo(() => {
    return allEmployees.filter((employee) => {
      if (filters.searchText) {
        return employee.fullName
          .toLowerCase()
          .includes(filters.searchText.toLowerCase());
      }
      return true;
    });
  }, [allEmployees, filters.searchText]);

  // 2. Vypočítame dostupné EMPLOYEE TYPES
  // Berieme do úvahy Search a Admin filter (ale ignorujeme Employee Type filter)
  const availableEmployeeTypes = useMemo(() => {
    const relevantEmployees = baseEmployees.filter((emp) => {
      if (filters.adminFilter === "admin" && !emp.isAdmin) return false;
      if (filters.adminFilter === "non-admin" && emp.isAdmin) return false;
      return true;
    });

    // Extract unique types
    const types = new Set(
      relevantEmployees.map((e) => e.employeeType).filter(Boolean),
    );
    return Array.from(types).sort();
  }, [baseEmployees, filters.adminFilter]);

  // 3. NOVÉ: Vypočítame dostupné ADMIN STATUSY
  // Berieme do úvahy Search a Employee Type filter (ale ignorujeme Admin filter)
  const availableAdminOptions = useMemo(() => {
    const relevantEmployees = baseEmployees.filter((emp) => {
      if (filters.employeeTypes.length > 0) {
        if (!filters.employeeTypes.includes(emp.employeeType)) return false;
      }
      return true;
    });

    return {
      hasAdmin: relevantEmployees.some((e) => e.isAdmin),
      hasNonAdmin: relevantEmployees.some((e) => !e.isAdmin),
    };
  }, [baseEmployees, filters.employeeTypes]);

  // 4. FINAL FILTERED EMPLOYEES
  const filteredEmployees = useMemo(() => {
    return baseEmployees.filter((employee) => {
      // Admin Filter
      if (filters.adminFilter === "admin" && !employee.isAdmin) return false;
      if (filters.adminFilter === "non-admin" && employee.isAdmin) return false;

      // Employee Type Filter
      if (filters.employeeTypes.length > 0) {
        if (!filters.employeeTypes.includes(employee.employeeType))
          return false;
      }

      return true;
    });
  }, [baseEmployees, filters.adminFilter, filters.employeeTypes]);

  // Handlers
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
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t.common.loading}</p>
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
                <CardTitle>{t.employees.failedToLoad}</CardTitle>
                <CardDescription>
                  {error.message || t.workRecords.unexpectedError}
                </CardDescription>
              </CardHeader>
              <Button onClick={() => refetch()}>{t.common.retry}</Button>
            </CardContent>
          </Card>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={handleCreate} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            {t.employees.addEmployee}
          </Button>
        </div>

        {!data?.employees || data.employees.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center border-2 border-dashed border-muted rounded-xl bg-muted/5">
            <Users className="h-12 w-12 text-muted-foreground/50" />
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                {t.employees.noEmployeesFound}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t.employees.noEmployeesDescription}
              </p>
            </div>
            <Button onClick={handleCreate} variant="outline">
              {t.employees.addEmployee}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-end items-center mb-2">
              <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                {t.workRecords.showing} {filteredEmployees.length} {t.workRecords.of} {allEmployees.length}{" "}
                {t.employees.countSuffix}
              </span>
            </div>

            <EmployeeTable
              employees={filteredEmployees}
              filters={filters}
              onFilterChange={setFilters}
              availableEmployeeTypes={availableEmployeeTypes}
              availableAdminOptions={availableAdminOptions} // Posielame nove options
              onEdit={handleEdit}
              onDelete={handleDelete}
              onResetPassword={handleResetPassword}
            />
          </>
        )}

        <EmployeeDialog
          open={dialogMode === "create" || dialogMode === "edit"}
          onOpenChange={(open) => !open && setDialogMode(null)}
          mode={
            dialogMode === "create" || dialogMode === "edit"
              ? dialogMode
              : "create"
          }
          initialData={selectedEmployee}
          onSuccess={handleSuccess}
        />

        <ResetPasswordDialog
          open={dialogMode === "reset-password"}
          onOpenChange={(open) => !open && setDialogMode(null)}
          employee={selectedEmployee}
        />

        <AlertDialog
          open={deleteId !== null}
          onOpenChange={(open) => !open && setDeleteId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.employees.deleteConfirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {t.employees.deleteConfirmDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t.common.delete}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminGuard>
  );
}
