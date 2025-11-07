import { z } from 'zod';

/**
 * Zod validation schema for work record form.
 * Mirrors the backend CreateWorkRecordInput DTO structure.
 */
export const workRecordSchema = z.object({
  employeeId: z.number().int().positive('Employee ID is required'),

  date: z.string().min(1, 'Date is required'),

  absenceTypeId: z.number().int().positive('Absence type is required'),

  projectId: z.number().int().positive('Project is required'),

  productivityTypeId: z.number().int().positive('Productivity type is required'),

  workTypeId: z.number().int().positive('Work type is required'),

  startTime: z
    .string()
    .min(1, 'Start time is required')
    .regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:MM format')
    .refine(
      (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return minutes % 30 === 0;
      },
      'Start time must be in 30-minute increments (e.g., 08:00, 08:30, 09:00)'
    ),

  endTime: z
    .string()
    .min(1, 'End time is required')
    .regex(/^\d{2}:\d{2}$/, 'End time must be in HH:MM format')
    .refine(
      (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return minutes % 30 === 0;
      },
      'End time must be in 30-minute increments (e.g., 16:00, 16:30, 17:00)'
    ),

  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),

  km: z
    .number()
    .int()
    .min(0, 'KM must be a non-negative number')
    .optional()
    .default(0),

  isTripFlag: z.boolean().optional().default(false),
});

export type WorkRecordFormData = z.infer<typeof workRecordSchema>;
