"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ProjectForm } from "@/components/projects-form"
import { useCreateProject } from "@/hooks/use-create-project"
import { useUpdateProject } from "@/hooks/use-update-project"
import type { ProjectFormData } from "@/lib/validations/project-schema"
import type { Project, Country, Employee } from "@/graphql/queries/projects"
import { Icons } from "@/lib/icons"

export interface ProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  initialData?: Project | null
  onSuccess?: () => void
  countries: Country[]
  employees: Employee[]
  isLoadingData?: boolean
  currentFilters: { active?: boolean, search?: string };
}

// Priradíme komponent do premennej s veľkým začiatočným písmenom
const LoaderIcon = Icons.loader

export function ProjectDialog({ open, onOpenChange, mode, initialData, onSuccess, countries, employees, isLoadingData, currentFilters }: ProjectDialogProps) {
  const { createProject, loading: isCreating } = useCreateProject()
  const { updateProject, loading: isUpdating } = useUpdateProject()

  const handleSubmit = async (data: ProjectFormData) => {
    let result
    if (mode === "create") {
      result = await createProject(data, currentFilters) 
    } else if (mode === "edit" && initialData) {
      result = await updateProject(initialData.id, data, currentFilters) 
    }

    if (result?.success) {
      onSuccess?.()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New Project" : "Edit Project"}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? "Fill in the details for the new project." : `Editing project: ${initialData?.name}`}
          </DialogDescription>
        </DialogHeader>
        {isLoadingData ? (
          <div className="flex items-center justify-center p-8">
            {/* Použijeme premennú ako komponent a pridáme jej triedy */}
            <LoaderIcon className="h-8 w-8" />
          </div>
        ) : (
          <ProjectForm 
            onSubmit={handleSubmit} 
            initialData={initialData} 
            isSubmitting={isCreating || isUpdating}
            countries={countries}
            employees={employees}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}