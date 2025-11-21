"use client"
import { useMutation } from "@apollo/client/react"
import { toast } from "sonner"
import { UPDATE_EMPLOYEE, EMPLOYEES_QUERY, type Employee } from "@/graphql/queries/employees"
import type { EmployeeFormData } from "@/lib/validations/employee-schema"

interface UpdateEmployeeData {
  updateEmployee: Employee;
}

interface UpdateEmployeeVariables {
  updateEmployeeInput: { id: string } & EmployeeFormData;
}

export function useUpdateEmployee() {
  const [updateEmployeeMutation, { loading }] = useMutation<UpdateEmployeeData, UpdateEmployeeVariables>(UPDATE_EMPLOYEE, {
    refetchQueries: [{ query: EMPLOYEES_QUERY }],
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const updateEmployee = async (id: string, data: EmployeeFormData) => {
    try {
      const response = await updateEmployeeMutation({
        variables: { 
          updateEmployeeInput: { id, ...data } 
        },
      })

      if (response.data) {
        toast.success("Employee updated successfully")
        return { success: true, data: response.data.updateEmployee }
      }
      
      throw new Error("Mutation succeeded but no data was returned.")
    } catch (error) {
      console.error("Failed to update employee:", error)
      return { success: false, error: (error as Error).message }
    }
  }

  return { updateEmployee, loading }
}

