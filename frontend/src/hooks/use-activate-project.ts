"use client"
import { useMutation } from "@apollo/client/react"
import { toast } from "sonner"
import { TOGGLE_PROJECT_ACTIVE } from "@/graphql/queries/projects"

export function useActivateProject() {
  const [toggleActiveMutation, { loading }] = useMutation(TOGGLE_PROJECT_ACTIVE, {
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // `currentStatus` nepotrebujeme, pretože backend očakáva finálny stav `active`
  const toggleActive = async (id: string, newStatus: boolean) => {
    try {
      await toggleActiveMutation({
        variables: { id, active: newStatus },
      })
      const statusText = newStatus ? "activated" : "deactivated"
      toast.success(`Project ${statusText} successfully`)
      return { success: true }
    } catch (error) {
      console.error("Failed to toggle project status:", error)
      return { success: false, error: (error as Error).message }
    }
  }

  return { toggleActive, loading }
}