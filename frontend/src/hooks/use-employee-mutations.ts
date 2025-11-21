import { useMutation } from "@apollo/client"
import { CREATE_EMPLOYEE, UPDATE_EMPLOYEE, DELETE_EMPLOYEE } from "@/graphql/mutations/employees"
import { EMPLOYEES_QUERY } from "@/graphql/queries/employees"
import { type EmployeeFormData } from "@/lib/validations/employee-schema"

export function useCreateEmployee() {
  const [mutate, { loading, error }] = useMutation(CREATE_EMPLOYEE, {
    refetchQueries: [{ query: EMPLOYEES_QUERY }],
  })

  const createEmployee = async (data: EmployeeFormData) => {
    try {
      const result = await mutate({
        variables: {
          createEmployeeInput: data,
        },
      })
      return { success: true, data: result.data }
    } catch (e) {
      return { success: false, error: e }
    }
  }

  return { createEmployee, loading, error }
}

export function useUpdateEmployee() {
  const [mutate, { loading, error }] = useMutation(UPDATE_EMPLOYEE, {
    refetchQueries: [{ query: EMPLOYEES_QUERY }],
  })

  const updateEmployee = async (id: string, data: EmployeeFormData) => {
    try {
      const result = await mutate({
        variables: {
          updateEmployeeInput: {
            id,
            ...data,
          },
        },
      })
      return { success: true, data: result.data }
    } catch (e) {
      return { success: false, error: e }
    }
  }

  return { updateEmployee, loading, error }
}

export function useDeleteEmployee() {
  const [mutate, { loading, error }] = useMutation(DELETE_EMPLOYEE, {
    refetchQueries: [{ query: EMPLOYEES_QUERY }],
  })

  const deleteEmployee = async (id: string) => {
    try {
      const result = await mutate({
        variables: { id },
      })
      return { success: true, data: result.data }
    } catch (e) {
      return { success: false, error: e }
    }
  }

  return { deleteEmployee, loading, error }
}

