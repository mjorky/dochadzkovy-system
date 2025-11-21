"use client"
import { useMutation } from "@apollo/client/react"
import { toast } from "sonner"
import { CREATE_EMPLOYEE, EMPLOYEES_QUERY, type Employee } from "@/graphql/queries/employees"
import type { EmployeeFormData } from "@/lib/validations/employee-schema"

interface CreateEmployeeData {
  createEmployee: Employee;
}

interface CreateEmployeeVariables {
  createEmployeeInput: EmployeeFormData;
}

export function useCreateEmployee() {
  const [createEmployeeMutation, { loading }] = useMutation<CreateEmployeeData, CreateEmployeeVariables>(CREATE_EMPLOYEE, {
    refetchQueries: [{ query: EMPLOYEES_QUERY }],
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const createEmployee = async (data: EmployeeFormData) => {
    try {
      const response = await createEmployeeMutation({
        variables: { createEmployeeInput: data },
      })
      
      if (response.data) {
        toast.success("Employee created successfully")
        return { success: true, data: response.data.createEmployee }
      }
      throw new Error("Mutation succeeded but no data was returned.")
    } catch (error) {
      console.error("Failed to create employee:", error)
      return { success: false, error: (error as Error).message }
    }
  }

  return { createEmployee, loading }
}

