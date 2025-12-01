'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { workRecordSchema, WorkRecordFormData } from '@/lib/validations/work-record-schema';
import { roundToNearest30Minutes, isOvernightShift } from '@/lib/utils/time-utils';
import { format } from 'date-fns';
import { CalendarIcon, MoonIcon } from 'lucide-react';
import { useTranslations } from '@/contexts/dictionary-context';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export interface WorkRecordFormProps {
  initialValues?: Partial<WorkRecordFormData>;
  onSubmit: (data: WorkRecordFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  catalogData: {
    absenceTypes: Array<{ id: string; alias: string }>;
    projects: Array<{ id: string; number: string }>;
    productivityTypes: Array<{ id: string; hourType: string }>;
    workTypes: Array<{ id: string; hourType: string }>;
  };
  keepSameDate?: boolean;
  onKeepSameDateChange?: (checked: boolean) => void;
}

export function WorkRecordForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  catalogData,
  keepSameDate = false,
  onKeepSameDateChange,
}: WorkRecordFormProps) {
  const form = useForm<WorkRecordFormData>({
    resolver: zodResolver(workRecordSchema),
    defaultValues: {
      employeeId: initialValues?.employeeId || 1,
      date: initialValues?.date || format(new Date(), 'yyyy-MM-dd'),
      absenceTypeId: initialValues?.absenceTypeId || undefined,
      projectId: initialValues?.projectId || undefined,
      productivityTypeId: initialValues?.productivityTypeId || undefined,
      workTypeId: initialValues?.workTypeId || undefined,
      startTime: initialValues?.startTime || '08:00',
      endTime: initialValues?.endTime || '16:00',
      description: initialValues?.description || '',
      km: initialValues?.km || 0,
      isTripFlag: initialValues?.isTripFlag || false,
    },
  });

  const t = useTranslations();

  const startTime = form.watch('startTime');
  const endTime = form.watch('endTime');
  const showOvernightHelper = React.useMemo(
    () => isOvernightShift(startTime, endTime),
    [startTime, endTime]
  );

  const description = form.watch('description') || '';
  const remainingChars = 500 - description.length;

  const handleTimeBlur = (field: 'startTime' | 'endTime') => (e: React.FocusEvent<HTMLInputElement>) => {
    const roundedTime = roundToNearest30Minutes(e.target.value);
    form.setValue(field, roundedTime);
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      form.setValue('date', format(date, 'yyyy-MM-dd'));
    }
  };

  const selectedDate = form.watch('date');
  const dateValue = selectedDate ? new Date(selectedDate) : null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Date Field with Keep Same Date Checkbox */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.workRecordDialog.date}</FormLabel>
              <FormControl>
                <DatePicker
                  value={dateValue}
                  onChange={handleDateChange}
                  placeholder={t.workRecords.pickDate}
                />
              </FormControl>
              {onKeepSameDateChange && (
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="keepSameDate"
                    checked={keepSameDate}
                    onCheckedChange={(checked) => onKeepSameDateChange(checked === true)}
                  />
                  <label
                    htmlFor="keepSameDate"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t.workRecordDialog.keepSameDateAsPrevious}
                  </label>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Absence Type */}
        <FormField
          control={form.control}
          name="absenceTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.workRecordDialog.absenceType} *</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value, 10))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t.workRecordDialog.selectAbsence} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {catalogData.absenceTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.alias}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Project */}
        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.workRecordDialog.project} *</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value, 10))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t.workRecordDialog.selectProject} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {catalogData.projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Productivity Type */}
        <FormField
          control={form.control}
          name="productivityTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.workRecordDialog.productivityType} *</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value, 10))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t.workRecordDialog.selectProductivity} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {catalogData.productivityTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.hourType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Work Type */}
        <FormField
          control={form.control}
          name="workTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.workRecordDialog.workType} *</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value, 10))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t.workRecordDialog.selectWorkType} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {catalogData.workTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.hourType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Time Selection Row */}
        <div className="grid grid-cols-2 gap-4">
        {/* Start Time */}
        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.workRecordDialog.startTime} *</FormLabel>
              <FormControl>
                  <TimePicker
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={() => handleTimeBlur('startTime')({ target: { value: field.value } } as any)}
                    placeholder={t.workRecordDialog.selectTime || "Select time"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* End Time */}
        <FormField
          control={form.control}
          name="endTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.workRecordDialog.endTime} *</FormLabel>
              <FormControl>
                  <TimePicker
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={() => handleTimeBlur('endTime')({ target: { value: field.value } } as any)}
                    placeholder={t.workRecordDialog.selectTime || "Select time"}
                />
              </FormControl>
              {showOvernightHelper && (
                <FormDescription className="flex items-center gap-1 text-blue-600">
                  <MoonIcon className="h-4 w-4" />
                  {t.workRecordDialog.overnightShift}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.workRecordDialog.description}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t.workRecordDialog.enterDescription}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {remainingChars} {t.workRecordDialog.charactersRemaining}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* KM */}
        <FormField
          control={form.control}
          name="km"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.workRecordDialog.kilometers}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Trip Flag */}
        <FormField
          control={form.control}
          name="isTripFlag"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{t.workRecordDialog.tripFlag}</FormLabel>
                <FormDescription>{t.workRecordDialog.markBusinessTrip}</FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {t.common.cancel}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t.common.saving : t.common.save}
          </Button>
        </div>
      </form>
    </Form>
  );
}
