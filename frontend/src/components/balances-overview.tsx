'use client';

import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_EMPLOYEE_BALANCES, GetEmployeeBalancesData, GetEmployeeBalancesVars } from '@/graphql/queries/balances';
import { 
  Briefcase, 
  Stethoscope, 
  UserPlus, 
  Accessibility, 
  AlertCircle 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface BalancesOverviewProps {
  employeeId: string;
  year: number;
}

export const BalancesOverview: React.FC<BalancesOverviewProps> = ({ employeeId, year }) => {
  const { loading, error, data } = useQuery<GetEmployeeBalancesData, GetEmployeeBalancesVars>(
    GET_EMPLOYEE_BALANCES,
    {
      variables: { employeeId, year },
      skip: !employeeId || !year,
    }
  );

  if (loading) {
    return (
      <Card className="w-full animate-pulse border border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="h-6 w-1/3 bg-muted rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-muted/50 rounded-xl"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-destructive/50 bg-destructive/5">
        <CardContent className="flex items-center gap-4 p-6 text-destructive">
          <AlertCircle className="h-6 w-6" />
          <div>
            <p className="font-semibold">Error loading balances</p>
            <p className="text-sm opacity-90">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.employeeBalances) {
    return (
      <Card className="w-full border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-8 text-muted-foreground">
          <Briefcase className="h-10 w-10 mb-2 opacity-20" />
          <p>No balances data available for this year.</p>
        </CardContent>
      </Card>
    );
  }

  const { vacationDays, doctorHours, accompanyingHours, accompanyingDisabledHours } = data.employeeBalances;

  return (
    <Card className="w-full border-border bg-card shadow-sm overflow-hidden animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">Annual Balances</CardTitle>
          <CardDescription className="mt-1">Remaining leave entitlements for {year}</CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          
          <BalanceItem 
            // Ikona je biela (light mode) alebo jemne modrá (dark mode)
            icon={<Briefcase className="h-5 w-5 text-white dark:text-blue-300" />}
            label="Vacation"
            value={vacationDays}
            unit="days"
            // Karta: Svetlo modrá
            bgClass="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
            // Pozadie ikony: Sýta modrá (Solid) + tieň
            iconBgClass="bg-blue-600 shadow-md shadow-blue-900/10 dark:bg-blue-900/40 dark:shadow-none"
          />

          <BalanceItem 
            icon={<Stethoscope className="h-5 w-5 text-white dark:text-emerald-300" />}
            label="Doctor"
            value={doctorHours}
            unit="hours"
            bgClass="bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
            iconBgClass="bg-emerald-600 shadow-md shadow-emerald-900/10 dark:bg-emerald-900/40 dark:shadow-none"
          />

          <BalanceItem 
            icon={<UserPlus className="h-5 w-5 text-white dark:text-amber-300" />}
            label="Accompanying"
            value={accompanyingHours}
            unit="hours"
            bgClass="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800"
            iconBgClass="bg-amber-600 shadow-md shadow-amber-900/10 dark:bg-amber-900/40 dark:shadow-none"
          />

          <BalanceItem 
            icon={<Accessibility className="h-5 w-5 text-white dark:text-purple-300" />}
            label="Disabled Child Acc."
            value={accompanyingDisabledHours}
            unit="hours"
            bgClass="bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800"
            iconBgClass="bg-purple-600 shadow-md shadow-purple-900/10 dark:bg-purple-900/40 dark:shadow-none"
          />

        </div>
      </CardContent>
    </Card>
  );
};

// --- Helper Component ---

interface BalanceItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  bgClass: string;
  iconBgClass: string;
}

function BalanceItem({ icon, label, value, unit, bgClass, iconBgClass }: BalanceItemProps) {
  const formattedValue = Number(value).toLocaleString('en-US', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 1 
  });

  return (
    <div className={cn("flex flex-col rounded-xl border p-5 transition-all hover:shadow-md hover:-translate-y-0.5 duration-200", bgClass)}>
      <div className="flex items-center justify-between mb-4">
        {/* Tmavší label pre lepšiu čitateľnosť */}
        <span className="text-sm font-bold text-foreground/70 tracking-wide uppercase text-[11px]">{label}</span>
        <div className={cn("p-2.5 rounded-lg", iconBgClass)}>
          {icon}
        </div>
      </div>
      
      <div className="mt-auto">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold tracking-tight text-foreground">
            {formattedValue}
          </span>
          <span className="text-sm font-medium text-muted-foreground/80">
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}