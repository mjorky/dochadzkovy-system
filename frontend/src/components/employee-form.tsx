"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "@/contexts/dictionary-context"
import { type EmployeeFormData, employeeFormSchema } from "@/lib/validations/employee-schema"
import { type Employee } from "@/graphql/queries/employees"
import { Form, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { useEffect } from "react"

export interface EmployeeFormProps {
  onSubmit: (data: EmployeeFormData) => void;
  initialData?: Employee | null
  isSubmitting?: boolean
}

const EMPLOYEE_TYPES = ["Zamestnanec", "SZČO", "Študent", "Brigádnik"]

export function EmployeeForm({ onSubmit, initialData, isSubmitting = false }: EmployeeFormProps) {
  const t = useTranslations()
  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    mode: "onChange",
    defaultValues: initialData
      ? {
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        titlePrefix: initialData.titlePrefix || "",
        titleSuffix: initialData.titleSuffix || "",
        employmentType: initialData.employeeType,
        vacationDays: initialData.vacationDays,
        isAdmin: initialData.isAdmin ?? false,
      }
      : {
        firstName: "",
        lastName: "",
        titlePrefix: "",
        titleSuffix: "",
        employmentType: "Zamestnanec",
        vacationDays: 20,
        isAdmin: false,
      },
  })

  const firstName = form.watch("firstName")
  const lastName = form.watch("lastName")

  const showNameWarning = initialData && initialData.firstName && initialData.lastName && (
    firstName !== initialData.firstName ||
    lastName !== initialData.lastName
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="titlePrefix" render={({ field }) => (
            <FormItem>
              <FormLabel>{t.employees.titlePrefix}</FormLabel>
              <Input placeholder={t.employees.titlePrefixPlaceholder} {...field} />
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="titleSuffix" render={({ field }) => (
            <FormItem>
              <FormLabel>{t.employees.titleSuffix}</FormLabel>
              <Input placeholder={t.employees.titleSuffixPlaceholder} {...field} />
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="firstName" render={({ field }) => (
            <FormItem>
              <FormLabel>{t.employees.firstName} *</FormLabel>
              <Input placeholder={t.employees.firstNamePlaceholder} {...field} />
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="lastName" render={({ field }) => (
            <FormItem>
              <FormLabel>{t.employees.lastName} *</FormLabel>
              <Input placeholder={t.employees.lastNamePlaceholder} {...field} />
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {showNameWarning && (
          <Alert variant="destructive" className="bg-amber-50 text-amber-900 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">{t.employees.nameChangeWarningTitle}</AlertTitle>
            <AlertDescription className="text-amber-700">
              {t.employees.nameChangeWarningDescription}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="employmentType" render={({ field }) => (
            <FormItem>
              <FormLabel>{t.employees.employeeType} *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EMPLOYEE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t.employeeTypes[type as keyof typeof t.employeeTypes] || type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="vacationDays" render={({ field }) => (
            <FormItem>
              <FormLabel>{t.employees.vacationDays} *</FormLabel>
              <Input
                type="number"
                step="0.5"
                {...field}
                onChange={e => field.onChange(parseFloat(e.target.value))}
              />
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="isAdmin" render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-2">
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            <div className="space-y-1 leading-none">
              <FormLabel>{t.employees.adminAccess}</FormLabel>
              <FormDescription>{t.employees.adminAccessDescription}</FormDescription>
            </div>
          </FormItem>
        )} />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? t.common.saving : initialData ? t.common.update : t.common.create}
        </Button>
      </form>
    </Form>
  )
}
