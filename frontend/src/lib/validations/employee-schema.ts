import { z } from "zod"

export const employeeFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  titlePrefix: z.string().optional(),
  titleSuffix: z.string().optional(),
  employmentType: z.string().min(1, "Employee type is required"),
  vacationDays: z.number().min(0, "Vacation days must be 0 or greater"),
  isAdmin: z.boolean().default(false),
})

export type EmployeeFormData = z.infer<typeof employeeFormSchema>
