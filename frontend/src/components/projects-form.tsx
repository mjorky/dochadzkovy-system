"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { type ProjectFormData, projectFormSchema } from "@/lib/validations/project-schema"
import { type Project, type Country as CountryType, type Employee as EmployeeType } from "@/graphql/queries/projects"
import { Form, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/contexts/dictionary-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => void;
  initialData?: Project | null
  isSubmitting?: boolean
  countries: CountryType[]
  employees: EmployeeType[]
}

export function ProjectForm({ onSubmit, initialData, isSubmitting = false, countries, employees }: ProjectFormProps) {
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    mode: "onChange",
    defaultValues: initialData
      ? {
        number: initialData.number,
        name: initialData.name,
        description: initialData.description ?? "",
        countryCode: initialData.country?.countryCode ?? "",
        managerId: initialData.manager?.id ?? "",
        active: initialData.active,
      }
      : {
        number: "",
        name: "",
        description: "",
        countryCode: "",
        managerId: "",
        active: true,
      },
  })

  const t = useTranslations()

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="number" render={({ field }) => (
          <FormItem>
            <FormLabel>{t.projects.number} *</FormLabel>
            <Input placeholder={t.projects.numberPlaceholder} {...field} />
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>{t.projects.name} *</FormLabel>
            <Input placeholder={t.projects.namePlaceholder} {...field} />
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>{t.common.description}</FormLabel>
            <Textarea placeholder={t.projects.descriptionPlaceholder} {...field} />
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="countryCode" render={({ field }) => (
          <FormItem>
            <FormLabel>{t.projects.country} *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger><SelectValue placeholder={t.projects.selectCountry} /></SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.countryCode} value={country.countryCode}>
                    {country.name || country.countryCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="managerId" render={({ field }) => (
          <FormItem>
            <FormLabel>{t.projects.manager} *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger><SelectValue placeholder={t.projects.selectManager} /></SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="active" render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-4">
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            <div className="space-y-1 leading-none">
              <FormLabel>{t.projects.activeProject}</FormLabel>
              <FormDescription>{t.projects.activeDescription}</FormDescription>
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