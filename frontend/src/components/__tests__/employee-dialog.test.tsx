import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { EmployeeDialog } from '../employee-dialog'
import { MockedProvider } from '@apollo/client/testing'
import React from 'react'

// Mock hooks
vi.mock('@/hooks/use-create-employee', () => ({
  useCreateEmployee: () => ({
    createEmployee: vi.fn().mockResolvedValue({ success: true }),
    loading: false
  })
}))

vi.mock('@/hooks/use-update-employee', () => ({
  useUpdateEmployee: () => ({
    updateEmployee: vi.fn().mockResolvedValue({ success: true }),
    loading: false
  })
}))

// Mock Icons - FIX: Icons is an object with properties, not a component
vi.mock('@/lib/icons', () => ({
  Icons: {
    loader: () => <div data-testid="loader" />,
    plus: () => <div data-testid="plus-icon" />,
    edit: () => <div data-testid="edit-icon" />,
    trash: () => <div data-testid="trash-icon" />,
  }
}))

// Mock Dialog components to avoid accessibility errors in test environment and ensure rendering
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode, open: boolean }) => open ? <div>{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}))

// Mock AlertTriangle from lucide-react used in employee-form.tsx
vi.mock('lucide-react', () => ({
  AlertTriangle: () => <div data-testid="alert-triangle" />,
  XIcon: () => <div data-testid="x-icon" />,
  ChevronUp: () => <div data-testid="chevron-up" />,
  ChevronDown: () => <div data-testid="chevron-down" />,
  Loader2: () => <div data-testid="loader-2" />,
  XCircle: () => <div data-testid="x-circle" />,
  Users: () => <div data-testid="users" />,
  Check: () => <div data-testid="check" />,
}))

describe('EmployeeDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    mode: 'create' as const,
    onSuccess: vi.fn(),
  }

  it('renders create form correctly', () => {
    render(
      <MockedProvider>
        <EmployeeDialog {...defaultProps} />
      </MockedProvider>
    )

    expect(screen.getByRole('heading', { name: 'Create New Employee' })).toBeInTheDocument()
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/vacation days/i)).toBeInTheDocument()
  })

  it('renders edit form with initial data', () => {
    const initialData = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      titlePrefix: '',
      titleSuffix: '',
      email: 'john@example.com',
      vacationDays: 20,
      employeeType: 'Zamestnanec',
      isAdmin: false,
      lastRecordDate: null,
      lockedUntil: null
    }

    render(
      <MockedProvider>
        <EmployeeDialog 
          {...defaultProps} 
          mode="edit" 
          initialData={initialData}
        />
      </MockedProvider>
    )

    expect(screen.getByRole('heading', { name: 'Edit Employee' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('John')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('20')).toBeInTheDocument()
  })

  it('shows warning when name changes in edit mode', async () => {
    const initialData = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      titlePrefix: '',
      titleSuffix: '',
      email: 'john@example.com',
      vacationDays: 20,
      employeeType: 'Zamestnanec',
      isAdmin: false,
      lastRecordDate: null,
      lockedUntil: null
    }

    render(
      <MockedProvider>
        <EmployeeDialog 
          {...defaultProps} 
          mode="edit" 
          initialData={initialData}
        />
      </MockedProvider>
    )

    const firstNameInput = screen.getByLabelText(/first name/i)
    fireEvent.change(firstNameInput, { target: { value: 'Johnny' } })

    await waitFor(() => {
      expect(screen.getByText(/changing the name will rename/i)).toBeInTheDocument()
    })
  })

  it('validates required fields', async () => {
    render(
      <MockedProvider>
        <EmployeeDialog {...defaultProps} />
      </MockedProvider>
    )

    const submitButton = screen.getByRole('button', { name: /create employee/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument()
    })
  })
})
