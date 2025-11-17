'use client';

import { useQuery } from '@apollo/client/react';
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
  currentEmployeeId: string | null; // Allow null for initial state
  onEmployeeChange: (employeeId: string) => void;
  isAdmin: boolean;
  isManager: boolean;
  placeholder?: string; // Add placeholder prop
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
  placeholder = "Select an employee...", // Default placeholder
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

  return (
    <div className="mb-6 p-4 bg-card rounded-lg border border-border">
      <label className="block text-sm font-medium text-foreground mb-2">
        Generate report for
      </label>
      <Select value={currentEmployeeId || ''} onValueChange={onEmployeeChange}>
        <SelectTrigger className="w-full md:w-auto min-w-[300px]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {data.employees.map((employee) => (
            <SelectItem key={employee.id} value={employee.id}>
              {employee.fullName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
