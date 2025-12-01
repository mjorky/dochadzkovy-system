'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from '@/contexts/dictionary-context';
import {
  GET_PROJECT_STATISTICS,
  ProjectStatisticsResponse,
  ProjectStatisticsInput,
} from '@/graphql/queries/project-statistics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { EmployeeSelector } from '@/components/employee-selector';
import { ProjectStatisticsTable, ProjectStatsFilters } from '@/components/project-statistics-table';

interface ProjectStatisticsSectionProps {
  employeeId: string;
  isAdmin: boolean;
  isManager: boolean;
}

export function ProjectStatisticsSection({
  employeeId,
  isAdmin,
  isManager,
}: ProjectStatisticsSectionProps) {
  const t = useTranslations();

  // State for selected employee (for admin/manager)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employeeId);

  // State for date range - default to last 30 days
  const defaultFromDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  }, []);
  const defaultToDate = useMemo(() => new Date(), []);

  const [fromDate, setFromDate] = useState<Date | undefined>(defaultFromDate);
  const [toDate, setToDate] = useState<Date | undefined>(defaultToDate);

  // State for table filters
  const [tableFilters, setTableFilters] = useState<ProjectStatsFilters>({
    selectedProjectNumbers: [],
    projectNameSearch: '',
  });

  // GraphQL query
  const [fetchStatistics, { data, loading, error }] = useLazyQuery<
    ProjectStatisticsResponse,
    { input: ProjectStatisticsInput }
  >(GET_PROJECT_STATISTICS, {
    fetchPolicy: 'cache-and-network',
  });

  // Update selected employee when prop changes
  useEffect(() => {
    setSelectedEmployeeId(employeeId);
  }, [employeeId]);

  // Fetch data when filters change
  useEffect(() => {
    const effectiveEmployeeId = selectedEmployeeId || employeeId;
    if (effectiveEmployeeId && fromDate && toDate) {
      fetchStatistics({
        variables: {
          input: {
            employeeId: parseInt(effectiveEmployeeId),
            fromDate: fromDate.toISOString().split('T')[0],
            toDate: toDate.toISOString().split('T')[0],
          },
        },
      });
      // Reset table filters when data changes
      setTableFilters({
        selectedProjectNumbers: [],
        projectNameSearch: '',
      });
    }
  }, [selectedEmployeeId, employeeId, fromDate, toDate, fetchStatistics]);

  const items = data?.getProjectStatistics?.items || [];

  // Format date for display
  const formatDateLabel = (date: Date | undefined) => {
    if (!date) return '';
    return date.toLocaleDateString('sk-SK');
  };

  return (
    <Card className="w-full border-border bg-card shadow-sm overflow-hidden animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            {t.projectStatistics?.title || 'Project Statistics'}
          </CardTitle>
          <CardDescription className="mt-1">
            {t.projectStatistics?.description || 'Overview of hours worked per project'}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Employee selector - only for admin/manager */}
          {(isAdmin || isManager) && (
            <div className="w-full sm:w-auto sm:min-w-[250px]">
              <EmployeeSelector
                currentEmployeeId={selectedEmployeeId}
                onEmployeeChange={(id) => setSelectedEmployeeId(id)}
                isAdmin={isAdmin}
                isManager={isManager}
                label={t.employees?.employee || 'Employee'}
                placeholder={t.employees?.selectEmployee || 'Select employee...'}
              />
            </div>
          )}

          {/* Date range */}
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label>{t.projectStatistics?.fromDate || 'From'}</Label>
              <DatePicker
                value={fromDate}
                onChange={setFromDate}
                placeholder={t.projectStatistics?.fromDate || 'From'}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.projectStatistics?.toDate || 'To'}</Label>
              <DatePicker
                value={toDate}
                onChange={setToDate}
                placeholder={t.projectStatistics?.toDate || 'To'}
              />
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-4 p-4 mb-4 rounded-lg border border-destructive/50 bg-destructive/5 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-semibold">{t.common?.error || 'Error'}</p>
              <p className="text-sm opacity-90">{error.message}</p>
            </div>
          </div>
        )}

        {/* Table */}
        <ProjectStatisticsTable
          items={items}
          isLoading={loading}
          filters={tableFilters}
          onFilterChange={setTableFilters}
        />
      </CardContent>
    </Card>
  );
}

