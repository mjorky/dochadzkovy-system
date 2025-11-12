"use client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDeleteProject } from "@/hooks/use-delete-project"
import type { Project } from "@/graphql/queries/projects"

export interface DeleteProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
  onSuccess?: () => void
}

export function DeleteProjectDialog({ open, onOpenChange, project, onSuccess }: DeleteProjectDialogProps) {
  const { deleteProject, loading } = useDeleteProject()

  const handleDelete = async () => {
    if (!project) return

    const result = await deleteProject(project.id)
    if (result.success) {
      onOpenChange(false)
      onSuccess?.()
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Project</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{project?.name}</strong> ({project?.number})? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-3">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive">
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteProjectDialog
