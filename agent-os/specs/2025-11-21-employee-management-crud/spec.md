# Specification: Employee Management CRUD

## Goal
Enable administrators to manage the employee lifecycle (Create, Update, Delete) directly from the web interface. This includes handling the complex database requirement of creating, renaming, and managing dedicated work record tables (`t_{Name}_{Surname}`) for each employee, while ensuring the user experience mirrors the Project Management features for consistency.

## User Stories
- As an administrator, I want to **add new employees** via a simple form so that they can start logging time in the system.
- As an administrator, I want to **edit employee details** (like vacation balance or admin status) to keep records up to date.
- As an administrator, I want to **rename employees** and be warned about the database impact so that I can correct typos or name changes safely.
- As an administrator, I want to **delete employees** who no longer work for the company to keep the list clean.

## Specific Requirements

**1. Employee Dialog (Create/Edit)**
- Replicate the `ProjectDialog` pattern (`frontend/src/components/project-dialog.tsx`).
- **Fields:**
  - First Name (Text, Required)
  - Last Name (Text, Required)
  - Title Prefix (Text, Optional)
  - Title Suffix (Text, Optional)
  - Employment Type (Dropdown: Zamestnanec, SZCO, Študent, Brigádnik) - fetch values if dynamic or hardcode based on `ZamestnanecTyp` table logic.
  - Vacation Days (Number, Required)
  - Is Admin (Checkbox)
- **Validation:** Client-side validation using Zod (required fields, reasonable lengths).

**2. Name Change Warning System**
- In `EmployeeDialog` (Edit mode only):
- Detect if "First Name" or "Last Name" values differ from initial data.
- If changed, display a prominent warning alert within the dialog: *"Changing the name will rename the employee's work record table. This is a significant operation."*
- This ensures the user understands the backend side-effect (renaming `t_{Name}_{Surname}`).

**3. Backend Mutations**
- **Create Employee (`createEmployee`)**:
  - Input: `CreateEmployeeInput` (DTO matching form fields).
  - Logic:
    1. Insert into `Zamestnanci` table.
    2. Create table `t_{FirstName}_{LastName}` (sanitize/strip diacritics for table name).
    3. Refresh `AllTData` view.
    4. Return created `Employee`.
- **Update Employee (`updateEmployee`)**:
  - Input: `UpdateEmployeeInput` (ID + partial fields).
  - Logic:
    1. Update `Zamestnanci` table.
    2. **IF Name Changed**:
       - Check if old table exists (`t_{OldFirst}_{OldLast}`).
       - Rename table to `t_{NewFirst}_{NewLast}` using raw SQL (`ALTER TABLE ... RENAME TO ...`).
       - Refresh `AllTData` view.
    3. Return updated `Employee`.
- **Delete Employee (`deleteEmployee`)**:
  - Input: `id` (ID).
  - Logic:
    1. Drop table `t_{Name}_{Surname}`.
    2. Delete from `Zamestnanci`.
    3. Refresh `AllTData` view.
    4. Return success boolean/ID.

**4. Employee Table Updates**
- Update `frontend/src/app/admin/employees/page.tsx` and `frontend/src/components/employee-table.tsx`.
- Add "Actions" column to `EmployeeTable` (Right-aligned).
- Add "Edit" (Pencil icon) and "Delete" (Trash icon) buttons.
- "Edit" opens `EmployeeDialog` in "edit" mode.
- "Delete" shows a standard confirmation alert (browser `confirm` or custom dialog) before calling mutation.

## Visual Design
No visual assets provided.
- **Layout**: Follows `frontend/src/app/admin/projects/page.tsx`.
- **Colors/Typography**: Use standard `shadcn/ui` components (Dialog, Form, Button, Input, Select, Checkbox).
- **Icons**: Use `lucide-react` (Pencil, Trash, Plus, AlertTriangle for warning).

## Existing Code to Leverage

**`frontend/src/components/project-dialog.tsx`**
- Direct reference for `EmployeeDialog` structure.
- Reuse `Dialog`, `DialogContent`, `Form` components.
- Reuse `useCreateProject` / `useUpdateProject` hook patterns for `useCreateEmployee` / `useUpdateEmployee`.

**`frontend/src/components/projects-table.tsx`**
- Direct reference for `EmployeeTable` updates.
- Copy "Actions" column rendering logic.
- Reuse sorting logic structure.

**`backend/src/projects/projects.service.ts`**
- Reference for CRUD service structure.
- Note: Employee service will be more complex due to `t_{Name}_{Surname}` table management (raw SQL execution).

**`backend/src/work-records/work-records.service.ts`**
- Contains `constructTableName` helper logic (or similar) that might be reusable or worth extracting to a shared util for consistent table naming (stripping diacritics).

## Out of Scope
- **Authentication**: Managing passwords, login credentials, or roles (Phase 11).
- **Signature Upload**: `Podpis` field handling.
- **Lock Attendance Logic**: Setting `ZamknuteK` date (display only for now).
- **Overtime Calculation**: Modifying `Nadcasy` logic.

