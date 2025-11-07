'use client';

import { useQuery } from '@apollo/client';
import { Loader2 } from 'lucide-react';
import { EMPLOYEES_QUERY, EmployeesData } from '@/graphql/queries/employees';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EmployeeSelectorProps {
  currentEmployeeId: string;
  onEmployeeChange: (employeeId: string) => void;
  isAdmin: boolean;
  isManager: boolean;
}

/**
 * Employee selector dropdown for managers and admins
 * Allows viewing work records for any employee in the company
 * Hidden for regular employees (they can only view their own records)
 */
export function EmployeeSelector({
  currentEmployeeId,
  onEmployeeChange,
  isAdmin,
  isManager,
}: EmployeeSelectorProps) {
  const { loading, error, data } = useQuery<EmployeesData>(EMPLOYEES_QUERY);

  // Don't render for regular employees (not admin or manager)
  if (!isAdmin && !isManager) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="mb-6 p-4 bg-card rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading employees...</span>
        </div>
      </div>
    );
  }

  // Error state (show error but don't block page)
  if (error) {
    return (
      <div className="mb-6 p-4 bg-card rounded-lg border border-destructive">
        <p className="text-sm text-destructive">
          Failed to load employee list: {error.message}
        </p>
      </div>
    );
  }

  // No data
  if (!data?.employees || data.employees.length === 0) {
    return null;
  }

  // Find current employee for display
  const currentEmployee = data.employees.find((emp) => emp.id === currentEmployeeId);

  return (
    <div className="mb-6 p-4 bg-card rounded-lg border border-border">
      <label className="block text-sm font-medium text-foreground mb-2">
        View Records For
      </label>
      <Select value={currentEmployeeId} onValueChange={onEmployeeChange}>
        <SelectTrigger className="w-full md:w-auto min-w-[300px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {data.employees.map((employee) => (
            <SelectItem key={employee.id} value={employee.id}>
              {employee.fullName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {currentEmployee && (
        <p className="mt-2 text-xs text-muted-foreground">
          Currently viewing: {currentEmployee.fullName}
        </p>
      )}
    </div>
  );
}
