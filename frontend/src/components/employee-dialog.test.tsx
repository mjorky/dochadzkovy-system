import { render, screen, fireEvent } from '@testing-library/react'
import { EmployeeDialog } from './employee-dialog'
import { MockedProvider } from '@apollo/client/testing'
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock hooks to control loading state and submission
vi.mock('@/hooks/use-employee-mutations', () => ({
    useCreateEmployee: () => ({ createEmployee: vi.fn().mockResolvedValue({ success: true }), loading: false }),
    useUpdateEmployee: () => ({ updateEmployee: vi.fn().mockResolvedValue({ success: true }), loading: false }),
}))

const mockOnOpenChange = vi.fn()
const mockOnSuccess = vi.fn()

describe('EmployeeDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders create form correctly', () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <EmployeeDialog 
                    open={true} 
                    onOpenChange={mockOnOpenChange} 
                    mode="create" 
                    onSuccess={mockOnSuccess} 
                />
            </MockedProvider>
        )

        expect(screen.getByText('Create New Employee')).toBeInTheDocument()
        expect(screen.getByLabelText(/First Name/i)).toHaveValue('')
        expect(screen.getByText('Create Employee')).toBeInTheDocument()
    })

    it('renders edit form with initial data', () => {
        const initialData: any = {
            id: '1',
            fullName: 'John Doe',
            vacationDays: 20,
            isAdmin: true,
            employeeType: 'Zamestnanec',
            titlePrefix: 'Ing.',
            titleSuffix: '',
            lastRecordDate: null,
            lockedUntil: null,
        }

        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <EmployeeDialog 
                    open={true} 
                    onOpenChange={mockOnOpenChange} 
                    mode="edit" 
                    initialData={initialData}
                    onSuccess={mockOnSuccess} 
                />
            </MockedProvider>
        )

        expect(screen.getByText('Edit Employee')).toBeInTheDocument()
        expect(screen.getByLabelText(/First Name/i)).toHaveValue('John')
        expect(screen.getByLabelText(/Last Name/i)).toHaveValue('Doe')
        expect(screen.getByLabelText(/Vacation Days/i)).toHaveValue(20)
        expect(screen.getByLabelText(/Administrator/i)).toBeChecked()
        expect(screen.getByText('Update Employee')).toBeInTheDocument()
    })
})
