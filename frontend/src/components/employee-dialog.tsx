"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { EmployeeForm } from "@/components/employee-form"
import { useCreateEmployee } from "@/hooks/use-create-employee"
import { useUpdateEmployee } from "@/hooks/use-update-employee"
import type { EmployeeFormData } from "@/lib/validations/employee-schema"
import type { Employee } from "@/graphql/queries/employees"
import { Icons } from "@/lib/icons"

export interface EmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  initialData?: Employee | null
  onSuccess?: () => void
}

const LoaderIcon = Icons.loader

export function EmployeeDialog({ open, onOpenChange, mode, initialData, onSuccess }: EmployeeDialogProps) {
  const { createEmployee, loading: isCreating } = useCreateEmployee()
  const { updateEmployee, loading: isUpdating } = useUpdateEmployee()

  const handleSubmit = async (data: EmployeeFormData) => {
    let result
    if (mode === "create") {
      result = await createEmployee(data) 
    } else if (mode === "edit" && initialData) {
      result = await updateEmployee(initialData.id, data) 
    }

    if (result?.success) {
      onSuccess?.()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New Employee" : "Edit Employee"}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? "Fill in the details for the new employee." : `Editing employee: ${initialData?.fullName}`}
          </DialogDescription>
        </DialogHeader>
        
        <EmployeeForm 
          onSubmit={handleSubmit} 
          initialData={initialData} 
          isSubmitting={isCreating || isUpdating}
        />
      </DialogContent>
    </Dialog>
  )
}
