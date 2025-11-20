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
  currentEmployeeId: string | null;
  onEmployeeChange: (employeeId: string) => void;
  isAdmin: boolean;
  isManager: boolean;
  placeholder?: string;
}

export function EmployeeSelector({
  currentEmployeeId,
  onEmployeeChange,
  isAdmin,
  isManager,
  placeholder = "Select an employee...",
}: EmployeeSelectorProps) {
  const { loading, error, data } = useQuery<EmployeesData>(EMPLOYEES_QUERY);

  // Ak nie je admin/manažér, nezobrazíme nič
  if (!isAdmin && !isManager) {
    return null;
  }

  // Loading state - zjednodušený, aby nerozbil layout
  if (loading) {
    return (
      <div className="w-full h-10 px-3 py-2 border rounded-md flex items-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading employees...</span>
      </div>
    );
  }

  // Error state - zjednodušený
  if (error) {
    return (
      <div className="text-sm text-destructive">
        Failed to load: {error.message}
      </div>
    );
  }

  if (!data?.employees || data.employees.length === 0) {
    return <div className="text-sm text-muted-foreground">No employees found.</div>;
  }

  return (
    // 1. Odstránil som vonkajší div s paddingom a borderom (karta v karte)
    // 2. Odstránil som <label>, lebo rodičovský komponent ho už má
    <div className="w-full">
      <Select value={currentEmployeeId || ''} onValueChange={onEmployeeChange}>
        {/* 
           3. ZMENA: 'w-full' namiesto 'min-w-[300px]'
           Toto zabezpečí, že sa select prispôsobí šírke rodiča a nebude pretekať.
        */}
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {data.employees.map((employee) => (
            <SelectItem key={employee.id} value={employee.id}>
              {/* Pridané truncate pre veľmi dlhé mená */}
              <span className="truncate block max-w-[250px] md:max-w-[350px]">
                {employee.fullName}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}