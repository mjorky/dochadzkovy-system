"use client";

import * as React from "react";
import { useQuery } from "@apollo/client/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "@/contexts/dictionary-context";
import { WorkRecordForm } from "./work-record-form";
import { useCreateWorkRecord } from "@/hooks/use-create-work-record";
import { useUpdateWorkRecord } from "@/hooks/use-update-work-record";
import { WorkRecordFormData } from "@/lib/validations/work-record-schema";
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
} from "@/graphql/queries/work-records";
import { format } from "date-fns";
import { toast } from "sonner";

export interface WorkRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialData?: WorkRecord | null;
  copyFromRecord?: WorkRecord | null;
  employeeId: number;
}

export function WorkRecordDialog({
  open,
  onOpenChange,
  mode,
  initialData,
  copyFromRecord,
  employeeId,
}: WorkRecordDialogProps) {
  const [keepSameDate, setKeepSameDate] = React.useState(false);

  // Reset checkbox when dialog opens
  React.useEffect(() => {
    if (open && mode === "create") {
      setKeepSameDate(false);
    }
  }, [open, mode]);

  // Fetch catalog data
  const { data: absenceTypesData } =
    useQuery<AbsenceTypesData>(GET_ABSENCE_TYPES);
  const { data: projectsData } =
    useQuery<ActiveProjectsData>(GET_ACTIVE_PROJECTS);
  const { data: productivityTypesData } = useQuery<ProductivityTypesData>(
    GET_PRODUCTIVITY_TYPES,
  );
  const { data: workTypesData } = useQuery<WorkTypesData>(GET_WORK_TYPES);

  // Fetch next workday for date pre-fill
  const { data: nextWorkdayData } = useQuery<NextWorkdayData>(
    GET_NEXT_WORKDAY,
    {
      variables: { employeeId },
      skip: mode === "edit", // Always fetch next workday in create mode
    },
  );

  // Fetch last work record for default field values
  const { data: lastRecordData } = useQuery<WorkRecordsData>(GET_WORK_RECORDS, {
    variables: {
      employeeId,
      fromDate: format(
        new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        "yyyy-MM-dd",
      ),
      toDate: format(new Date(), "yyyy-MM-dd"),
      limit: 1,
      offset: 0,
      sortOrder: "DESC", // Always get the most recent record
    },
    skip: mode === "edit",
  });

  const { createWorkRecord, loading: isCreating } = useCreateWorkRecord();
  const { updateWorkRecord, loading: isUpdating } = useUpdateWorkRecord();
  const t = useTranslations();

  const catalogData = {
    absenceTypes: absenceTypesData?.getAbsenceTypes || [],
    projects: projectsData?.getActiveProjects || [],
    productivityTypes: productivityTypesData?.getProductivityTypes || [],
    workTypes: workTypesData?.getWorkTypes || [],
  };

  // Prepare initial form values
  const initialFormValues = React.useMemo(() => {
    if (mode === "edit" && initialData) {
      // Edit mode: use existing record data
      return {
        employeeId,
        date: initialData.date.split("T")[0],
        absenceTypeId: parseInt(
          catalogData.absenceTypes.find(
            (t) => t.alias === initialData.absenceType,
          )?.id || "0",
          10,
        ),
        projectId: initialData.project
          ? parseInt(
              catalogData.projects.find((p) => p.number === initialData.project)
                ?.id || "0",
              10,
            )
          : undefined,
        productivityTypeId: initialData.productivityType
          ? parseInt(
              catalogData.productivityTypes.find(
                (t) => t.hourType === initialData.productivityType,
              )?.id || "0",
              10,
            )
          : undefined,
        workTypeId: initialData.workType
          ? parseInt(
              catalogData.workTypes.find(
                (t) => t.hourType === initialData.workType,
              )?.id || "0",
              10,
            )
          : undefined,
        startTime: initialData.startTime.substring(0, 5),
        endTime: initialData.endTime.substring(0, 5),
        description: initialData.description || "",
        km: initialData.km || 0,
        isTripFlag: initialData.isTripFlag || false,
      };
    }

    // Create mode: use copyFromRecord if provided, otherwise use defaults from last record + next workday
    const sourceRecord =
      copyFromRecord || lastRecordData?.getWorkRecords.records[0];
    const nextWorkday = nextWorkdayData?.getNextWorkday
      ? new Date(nextWorkdayData.getNextWorkday).toISOString().split("T")[0]
      : format(new Date(), "yyyy-MM-dd");

    return {
      employeeId,
      date:
        keepSameDate && sourceRecord
          ? sourceRecord.date.split("T")[0]
          : nextWorkday,
      absenceTypeId: sourceRecord
        ? parseInt(
            catalogData.absenceTypes.find(
              (t) => t.alias === sourceRecord.absenceType,
            )?.id || "0",
            10,
          )
        : undefined,
      projectId: sourceRecord?.project
        ? parseInt(
            catalogData.projects.find((p) => p.number === sourceRecord.project)
              ?.id || "0",
            10,
          )
        : undefined,
      productivityTypeId: sourceRecord?.productivityType
        ? parseInt(
            catalogData.productivityTypes.find(
              (t) => t.hourType === sourceRecord.productivityType,
            )?.id || "0",
            10,
          )
        : undefined,
      workTypeId: sourceRecord?.workType
        ? parseInt(
            catalogData.workTypes.find(
              (t) => t.hourType === sourceRecord.workType,
            )?.id || "0",
            10,
          )
        : undefined,
      startTime: sourceRecord?.startTime.substring(0, 5) || "08:00",
      endTime: sourceRecord?.endTime.substring(0, 5) || "16:00",
      description: sourceRecord?.description || "",
      km: sourceRecord?.km || 0,
      isTripFlag: sourceRecord?.isTripFlag || false,
    };
  }, [
    mode,
    initialData,
    copyFromRecord,
    employeeId,
    catalogData,
    lastRecordData,
    nextWorkdayData,
    keepSameDate,
  ]);

  const handleSubmit = async (data: WorkRecordFormData) => {
    try {
      if (mode === "create") {
        await createWorkRecord({
          variables: {
            input: data,
          },
        });
        // Success - close dialog
        onOpenChange(false);
        toast.success(t.toast.success);
      } else {
        // Edit mode - call update mutation
        if (!initialData) {
          throw new Error("No initial data provided for edit mode");
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
        toast.success(t.toast.success);
      }
    } catch (error: any) {
      // Error handling - keep dialog open
      console.error("Failed to save work record:", error);
      // Extract error message from GraphQL error
      const errorMessage =
        error?.graphQLErrors?.[0]?.message || error?.message || t.toast.error;
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const dialogTitle =
    mode === "create"
      ? t.workRecordDialog.createTitle
      : t.workRecordDialog.editTitle;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <WorkRecordForm
          key={`${mode}-${open}-${keepSameDate}`}
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
