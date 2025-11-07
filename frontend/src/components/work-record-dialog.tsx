'use client';

import * as React from 'react';
import { useQuery } from '@apollo/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WorkRecordForm } from './work-record-form';
import { useCreateWorkRecord } from '@/hooks/use-create-work-record';
import { useUpdateWorkRecord } from '@/hooks/use-update-work-record';
import { WorkRecordFormData } from '@/lib/validations/work-record-schema';
import {
  GET_ABSENCE_TYPES,
  GET_ACTIVE_PROJECTS,
  GET_PRODUCTIVITY_TYPES,
  GET_WORK_TYPES,
  GET_NEXT_WORKDAY,
  GET_WORK_RECORDS,
  type AbsenceTypesData,
  type ActiveProjectsData,
  type ProductivityTypesData,
  type WorkTypesData,
  type NextWorkdayData,
  type WorkRecordsData,
  type WorkRecord,
} from '@/graphql/queries/work-records';
import { format } from 'date-fns';

export interface WorkRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialData?: WorkRecord | null;
  employeeId: number;
}

export function WorkRecordDialog({
  open,
  onOpenChange,
  mode,
  initialData,
  employeeId,
}: WorkRecordDialogProps) {
  const [keepSameDate, setKeepSameDate] = React.useState(false);

  // Fetch catalog data
  const { data: absenceTypesData } = useQuery<AbsenceTypesData>(GET_ABSENCE_TYPES);
  const { data: projectsData } = useQuery<ActiveProjectsData>(GET_ACTIVE_PROJECTS);
  const { data: productivityTypesData } = useQuery<ProductivityTypesData>(GET_PRODUCTIVITY_TYPES);
  const { data: workTypesData } = useQuery<WorkTypesData>(GET_WORK_TYPES);

  // Fetch next workday for date pre-fill
  const { data: nextWorkdayData } = useQuery<NextWorkdayData>(GET_NEXT_WORKDAY, {
    variables: { employeeId },
    skip: mode === 'edit' || keepSameDate,
  });

  // Fetch last work record for default field values
  const { data: lastRecordData } = useQuery<WorkRecordsData>(GET_WORK_RECORDS, {
    variables: {
      employeeId,
      fromDate: format(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      toDate: format(new Date(), 'yyyy-MM-dd'),
      limit: 1,
      offset: 0,
    },
    skip: mode === 'edit',
  });

  const { createWorkRecord, loading: isCreating } = useCreateWorkRecord();
  const { updateWorkRecord, loading: isUpdating } = useUpdateWorkRecord();

  const catalogData = {
    absenceTypes: absenceTypesData?.getAbsenceTypes || [],
    projects: projectsData?.getActiveProjects || [],
    productivityTypes: productivityTypesData?.getProductivityTypes || [],
    workTypes: workTypesData?.getWorkTypes || [],
  };

  // Prepare initial form values
  const initialFormValues = React.useMemo(() => {
    if (mode === 'edit' && initialData) {
      // Edit mode: use existing record data
      return {
        employeeId,
        date: initialData.date.split('T')[0],
        absenceTypeId: parseInt(
          catalogData.absenceTypes.find((t) => t.alias === initialData.absenceType)?.id || '0',
          10
        ),
        projectId: initialData.project
          ? parseInt(catalogData.projects.find((p) => p.number === initialData.project)?.id || '0', 10)
          : undefined,
        productivityTypeId: initialData.productivityType
          ? parseInt(
              catalogData.productivityTypes.find((t) => t.hourType === initialData.productivityType)?.id || '0',
              10
            )
          : undefined,
        workTypeId: initialData.workType
          ? parseInt(catalogData.workTypes.find((t) => t.hourType === initialData.workType)?.id || '0', 10)
          : undefined,
        startTime: initialData.startTime.substring(0, 5),
        endTime: initialData.endTime.substring(0, 5),
        description: initialData.description || '',
        km: initialData.km || 0,
        isTripFlag: initialData.isTripFlag || false,
      };
    }

    // Create mode: use defaults from last record + next workday
    const lastRecord = lastRecordData?.getWorkRecords.records[0];
    const nextWorkday = nextWorkdayData?.getNextWorkday
      ? new Date(nextWorkdayData.getNextWorkday).toISOString().split('T')[0]
      : format(new Date(), 'yyyy-MM-dd');

    return {
      employeeId,
      date: keepSameDate && lastRecord ? lastRecord.date.split('T')[0] : nextWorkday,
      absenceTypeId: lastRecord
        ? parseInt(
            catalogData.absenceTypes.find((t) => t.alias === lastRecord.absenceType)?.id || '0',
            10
          )
        : undefined,
      projectId: lastRecord?.project
        ? parseInt(catalogData.projects.find((p) => p.number === lastRecord.project)?.id || '0', 10)
        : undefined,
      productivityTypeId: lastRecord?.productivityType
        ? parseInt(
            catalogData.productivityTypes.find((t) => t.hourType === lastRecord.productivityType)?.id || '0',
            10
          )
        : undefined,
      workTypeId: lastRecord?.workType
        ? parseInt(catalogData.workTypes.find((t) => t.hourType === lastRecord.workType)?.id || '0', 10)
        : undefined,
      startTime: '08:00',
      endTime: '16:00',
      description: '',
      km: 0,
      isTripFlag: false,
    };
  }, [
    mode,
    initialData,
    employeeId,
    catalogData,
    lastRecordData,
    nextWorkdayData,
    keepSameDate,
  ]);

  const handleSubmit = async (data: WorkRecordFormData) => {
    try {
      if (mode === 'create') {
        await createWorkRecord({
          variables: {
            input: data,
          },
        });
        // Success - close dialog
        onOpenChange(false);
        // TODO: Replace with toast notification
        console.log('Work record created successfully');
      } else {
        // Edit mode - call update mutation
        if (!initialData) {
          throw new Error('No initial data provided for edit mode');
        }
        await updateWorkRecord({
          variables: {
            input: {
              recordId: parseInt(initialData.id, 10),
              employeeId: data.employeeId,
              date: data.date,
              absenceTypeId: data.absenceTypeId,
              projectId: data.projectId,
              productivityTypeId: data.productivityTypeId,
              workTypeId: data.workTypeId,
              startTime: data.startTime,
              endTime: data.endTime,
              description: data.description,
              km: data.km,
              isTripFlag: data.isTripFlag,
            },
          },
        });
        // Success - close dialog
        onOpenChange(false);
        // TODO: Replace with toast notification
        console.log('Work record updated successfully');
      }
    } catch (error) {
      // Error handling - keep dialog open
      console.error('Failed to save work record:', error);
      // TODO: Replace with toast notification
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const dialogTitle = mode === 'create' ? 'Add Work Entry' : 'Edit Work Entry';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <WorkRecordForm
          initialValues={initialFormValues}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isCreating || isUpdating}
          catalogData={catalogData}
          keepSameDate={keepSameDate}
          onKeepSameDateChange={setKeepSameDate}
        />
      </DialogContent>
    </Dialog>
  );
}
