"use client"
import { useMutation } from "@apollo/client/react"
import { toast } from "sonner"
import { UPDATE_PROJECT, GET_PROJECTS, type Project } from "@/graphql/queries/projects"
import type { ProjectFormData } from "@/lib/validations/project-schema"

// Typy pre odpoveď a premenné mutácie
interface UpdateProjectData {
  updateProject: Project;
}

interface UpdateProjectVariables {
  updateProjectInput: { id: string } & ProjectFormData;
}

// Typ pre filtre, ktorý budeme prijímať
interface CurrentFilters {
  active?: boolean;
  search?: string;
}

export function useUpdateProject() {
  const [updateProjectMutation, { loading }] = useMutation<UpdateProjectData, UpdateProjectVariables>(UPDATE_PROJECT, {
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // 1. Upravíme funkciu, aby prijímala filtre ako tretí argument
  const updateProject = async (id: string, data: ProjectFormData, currentFilters: CurrentFilters) => {
    try {
      const response = await updateProjectMutation({
        variables: { 
          updateProjectInput: { id, ...data } 
        },
        // 2. Pridáme `refetchQueries` s dynamickými premennými
        refetchQueries: [{
          query: GET_PROJECTS,
          variables: {
            active: currentFilters.active ? true : undefined,
            search: currentFilters.search || undefined,
          }
        }],
      })

      if (response.data) {
        toast.success("Project updated successfully")
        return { success: true, data: response.data.updateProject }
      }
      
      throw new Error("Mutation succeeded but no data was returned.")
    } catch (error) {
      console.error("Failed to update project:", error)
      return { success: false, error: (error as Error).message }
    }
  }

  return { updateProject, loading }
}