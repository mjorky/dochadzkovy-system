# Task Breakdown: Employee Management CRUD

## Overview
Total Tasks: 3 Task Groups (12 Sub-tasks)

## Task List

### API Layer

#### Task Group 1: Backend Mutations
**Dependencies:** None

- [x] 1.0 Implement Employee CRUD Mutations
  - [x] 1.1 Write 2-8 focused tests for Employee mutations
    - Test `createEmployee`: Verify it creates `Zamestnanci` record AND `t_{Name}_{Surname}` table
    - Test `updateEmployee`: Verify basic update works
    - Test `updateEmployee` with name change: Verify it renames `t_{Name}_{Surname}` table
    - Test `deleteEmployee`: Verify it drops table and deletes record
  - [x] 1.2 Implement `createEmployee` mutation
    - Inputs: `CreateEmployeeInput`
    - Logic: Create `Zamestnanci`, create personal table (sanitize name), refresh view
    - Handle table creation error gracefully
  - [x] 1.3 Implement `updateEmployee` mutation
    - Inputs: `UpdateEmployeeInput`
    - Logic: Update `Zamestnanci` fields
    - **Name Change Logic**: If name changes, rename existing table, refresh view
    - Ensure atomic transaction if possible (or safe rollback)
  - [x] 1.4 Implement `deleteEmployee` mutation
    - Inputs: ID
    - Logic: Drop personal table, delete `Zamestnanci` record, refresh view
  - [x] 1.5 Ensure Mutation tests pass
    - Run ONLY the tests from 1.1

**Acceptance Criteria:**
- Can create employee and corresponding work record table
- Can update employee details
- Can rename employee and their work record table automatically renames
- Can delete employee and their table
- `AllTData` view remains valid after operations

### Frontend Components

#### Task Group 2: Employee Dialog & Form
**Dependencies:** Task Group 1

- [x] 2.0 Build Employee Create/Edit UI
  - [x] 2.1 Write 2-8 focused tests for Employee Dialog
    - Test form rendering with empty state (Create mode)
    - Test form rendering with initial data (Edit mode)
    - Test "Name Change Warning" appearance when name fields modified
    - Test form validation (required fields)
  - [x] 2.2 Create `EmployeeDialog` component
    - Base on `frontend/src/components/project-dialog.tsx`
    - Reuse `Dialog`, `DialogContent` components
    - Manage `create` vs `edit` mode
  - [x] 2.3 Implement `EmployeeForm` inside dialog
    - Fields: First Name, Last Name, Titles, Type (Select), Vacation, Is Admin
    - Use `react-hook-form` + `zod` validation
    - **Warning Feature**: Watch name fields; show Alert if values differ from `initialData`
  - [x] 2.4 Connect mutations to Form
    - Use `useCreateEmployee` and `useUpdateEmployee` hooks (create if needed)
    - Handle success/error states
    - Trigger `refetch` on success
  - [x] 2.5 Ensure UI tests pass
    - Run ONLY the tests from 2.1

**Acceptance Criteria:**
- Dialog opens in correct mode
- Form validates input correctly
- Warning appears when changing name of existing employee
- Submitting calls correct GraphQL mutation

#### Task Group 3: Employee List Integration
**Dependencies:** Task Group 2

- [x] 3.0 Integrate Actions into Employee List
  - [x] 3.1 Write 2-4 focused tests for Employee Table Actions
    - Test "Edit" button click opens dialog
    - Test "Delete" button triggers confirmation
  - [x] 3.2 Update `EmployeeTable` columns
    - Add "Actions" column (right-aligned)
    - Add Edit (Pencil) and Delete (Trash) buttons
    - Match style of `ProjectsTable`
  - [x] 3.3 Update `EmployeesPage` (Page Controller)
    - Add state for `dialogMode` and `selectedEmployee`
    - Implement `handleEdit` (open dialog)
    - Implement `handleDelete` (confirm -> mutation -> refetch)
    - Connect `EmployeeDialog` to page state
  - [x] 3.4 Ensure Integration tests pass
    - Run ONLY the tests from 3.1

**Acceptance Criteria:**
- Can click Edit to open dialog with employee data
- Can click Delete to remove employee (with confirmation)
- List refreshes automatically after Create/Update/Delete

## Execution Order
1. Backend Mutations (Task Group 1) - *Foundation for data changes*
2. Employee Dialog & Form (Task Group 2) - *Main UI complexity*
3. Employee List Integration (Task Group 3) - *Connecting it all together*
