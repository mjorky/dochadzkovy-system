"use client"
import { useMutation } from "@apollo/client/react"
import { toast } from "sonner"
import { CREATE_PROJECT, GET_PROJECTS, type Project } from "@/graphql/queries/projects"
import type { ProjectFormData } from "@/lib/validations/project-schema"

// 1. Definujeme typ pre dáta v odpovedi
interface CreateProjectData {
  createProject: Project; // Očakávame objekt `createProject`, ktorý je typu `Project`
}

// 2. Definujeme typ pre premenné posielané do mutácie
interface CreateProjectVariables {
  createProjectInput: ProjectFormData;
}

export function useCreateProject() {
  // 3. Použijeme typy v useMutation
  const [createProjectMutation, { loading }] = useMutation<CreateProjectData, CreateProjectVariables>(CREATE_PROJECT, {
    refetchQueries: [{ query: GET_PROJECTS }],
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const createProject = async (data: ProjectFormData) => {
    try {
      const response = await createProjectMutation({
        variables: { createProjectInput: data },
      })
      
      // Teraz TypeScript vie, že response.data existuje a má vlastnosť createProject
      if (response.data) {
        toast.success("Project created successfully")
        return { success: true, data: response.data.createProject }
      }
      // Ak by z nejakého dôvodu dáta neprišli
      throw new Error("Mutation succeeded but no data was returned.")
    } catch (error) {
      console.error("Failed to create project:", error)
      return { success: false, error: (error as Error).message }
    }
  }

  return { createProject, loading }
}