"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { type ProjectFormData, projectFormSchema } from "@/lib/validations/project-schema"
import { type Project, type Country as CountryType, type Employee as EmployeeType } from "@/graphql/queries/projects"
import { Form, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="number" render={({ field }) => (
          <FormItem>
            <FormLabel>Project Number *</FormLabel>
            <Input placeholder="e.g., PRJ-001" {...field} />
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Project Name *</FormLabel>
            <Input placeholder="e.g., Enterprise Portal" {...field} />
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <Textarea placeholder="Project description..." {...field} />
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="countryCode" render={({ field }) => (
          <FormItem>
            <FormLabel>Country *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger><SelectValue placeholder="Select a country" /></SelectTrigger>
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
            <FormLabel>Manager *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger><SelectValue placeholder="Select a manager" /></SelectTrigger>
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
              <FormLabel>Active Project</FormLabel>
              <FormDescription>Allow assigning working hours.</FormDescription>
            </div>
          </FormItem>
        )} />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : initialData ? "Update Project" : "Create Project"}
        </Button>
      </form>
    </Form>
  )
}