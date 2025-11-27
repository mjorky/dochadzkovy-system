'use client';

import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { EMPLOYEES_QUERY, EmployeesData } from '@/graphql/queries/employees';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/providers/auth-provider';
import { useTranslations } from '@/contexts/dictionary-context';

interface EmployeeSelectorProps {
  currentEmployeeId: string;
  onEmployeeChange: (employeeId: string) => void;
  isAdmin?: boolean;
  isManager?: boolean;
  label?: string;
  placeholder?: string;
}

export function EmployeeSelectorI18n({
  currentEmployeeId,
  onEmployeeChange,
  isAdmin = false,
  isManager = false,
  label,
  placeholder,
}: EmployeeSelectorProps) {
  const { user } = useAuth();
  const t = useTranslations();

  // Use translations with fallback to prop values
  const labelText = label || t.workRecords.selectEmployee;
  const placeholderText = placeholder || t.workRecords.selectEmployee;

  const { data: employeesData } = useQuery<EmployeesData>(EMPLOYEES_QUERY, {
    skip: !isAdmin && !isManager,
  });

  const employees = React.useMemo(() => {
    if (!employeesData?.employees) return [];

    if (isAdmin) {
      return employeesData.employees;
    }

    if (isManager && user?.managedEmployees) {
      return employeesData.employees.filter((emp) =>
        user.managedEmployees?.includes(emp.id)
      );
    }

    return [];
  }, [employeesData, isAdmin, isManager, user]);

  // If user can't see other employees, show only their own name
  if (!isAdmin && !isManager && user) {
    return (
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {labelText}
        </Label>
        <div className="h-10 px-3 py-2 border border-input bg-muted/50 rounded-md text-sm">
          {user.fullName}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {labelText}
      </Label>
      <Select value={currentEmployeeId} onValueChange={onEmployeeChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholderText} />
        </SelectTrigger>
        <SelectContent>
          {employees.map((emp) => (
            <SelectItem key={emp.id} value={emp.id}>
              {emp.employeeNumber} - {emp.fullName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
