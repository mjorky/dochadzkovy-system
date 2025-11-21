"use client"
import { useMutation } from "@apollo/client/react"
import { toast } from "sonner"
import { DELETE_EMPLOYEE, EMPLOYEES_QUERY } from "@/graphql/queries/employees"

interface DeleteEmployeeData {
  deleteEmployee: boolean;
}

interface DeleteEmployeeVariables {
  id: string;
}

export function useDeleteEmployee() {
  const [deleteEmployeeMutation, { loading }] = useMutation<DeleteEmployeeData, DeleteEmployeeVariables>(DELETE_EMPLOYEE, {
    refetchQueries: [{ query: EMPLOYEES_QUERY }],
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const deleteEmployee = async (id: string) => {
    try {
      const response = await deleteEmployeeMutation({
        variables: { id },
      })
      
      if (response.data?.deleteEmployee) {
        toast.success("Employee deleted successfully")
        return { success: true }
      }
      throw new Error("Failed to delete employee")
    } catch (error) {
      console.error("Failed to delete employee:", error)
      return { success: false, error: (error as Error).message }
    }
  }

  return { deleteEmployee, loading }
}

