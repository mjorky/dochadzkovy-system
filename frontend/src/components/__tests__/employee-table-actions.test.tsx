import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { EmployeeTable } from '../employee-table'
import React from 'react'

// Mock Icons
vi.mock('@/lib/icons', () => ({
  Icons: {
    edit: () => <div data-testid="edit-icon" />,
    trash: () => <div data-testid="trash-icon" />,
  }
}))

describe('EmployeeTable Actions', () => {
  const mockEmployees = [
    {
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
      lastRecordDate: '2024-01-01',
      lockedUntil: null
    }
  ]

  it('renders edit and delete buttons for each employee', () => {
    render(
      <EmployeeTable 
        employees={mockEmployees} 
        onEdit={vi.fn()} 
        onDelete={vi.fn()} 
      />
    )

    expect(screen.getByTestId('edit-icon')).toBeInTheDocument()
    expect(screen.getByTestId('trash-icon')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn()
    render(
      <EmployeeTable 
        employees={mockEmployees} 
        onEdit={onEdit} 
        onDelete={vi.fn()} 
      />
    )

    const editButton = screen.getByTestId('edit-icon').parentElement
    fireEvent.click(editButton!)

    expect(onEdit).toHaveBeenCalledWith(mockEmployees[0])
  })

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn()
    render(
      <EmployeeTable 
        employees={mockEmployees} 
        onEdit={vi.fn()} 
        onDelete={onDelete} 
      />
    )

    const deleteButton = screen.getByTestId('trash-icon').parentElement
    fireEvent.click(deleteButton!)

    expect(onDelete).toHaveBeenCalledWith(mockEmployees[0])
  })
})

