# Spec Requirements: Employee Management CRUD

## Initial Description
I would like to continue with Phase 6. The screen is partially working, list of employees and filtering of them is working properly. We want to mimic and reuse creating, editing and managing projects from already finished Phase 5 Project Management screen. We want creating and managing employees done with as much similarity as it is on Projects management screen in order to have unified UI experience and make code clean.

## Requirements Discussion

### First Round Questions

**Q1:** I assume the form will need fields for: First Name, Last Name, Title Prefix, Title Suffix, Employment Type (dropdown), Vacation Days (number), and an "Is Admin" checkbox. Does this cover all editable fields, or are there others (like specific salary info or email)?
**Answer:** Yes, your proposal covers all editable fields in create/edit dialog.

**Q2:** The database schema includes a `Podpis` (signature) field. Should the Create/Edit form include a file uploader for the employee's signature image in this phase?
**Answer:** No we will not add signature in this phase.

**Q3:** Changing an employee's name triggers backend operations (renaming their personal table `t_{Name}_{Surname}`). Should the UI include a specific warning/confirmation when the name fields are modified, or just show a standard loading state?
**Answer:** Include specific warning/confirmation when the name fields are modified.

**Q4:** For Employees screen, the Lock feature is included only as information. We want to see the date to which the attendace records are locked. There is no other functionality. So you need to find a way how to obtain this date. Other than that we are not doing any additional things with Lock feature.
**Answer:** For Employees screen, the Lock feature is included only as information. We want to see the date to which the attendace records are locked. There is no other functionality.

**Q5:** Since Authentication is scheduled for Phase 11, I assume we **do not** need to manage passwords or login credentials in this Create/Edit form yet. Is that correct?
**Answer:** Yes, this is correct, we are not managing Authetication yet.

### Additional User Requests
- "We also want to see date of last work record for each employee in the table. Double check if this feature is already implemented."
- "for the Project Management screen, I think reference `frontend/src/app/admin/projects/` should be fine, but just to be sure check the whole froned components, we want to reuse from application as much as possible."
- "We are using shadcn components on everything so if you need to use new component that you cannot find within our project and reuse it then I copied repo with perfect examples in folder `/Users/miro/Projects/dochadzkovy-system/shadcn-cheatsheet` so use this one as reference then."

### Follow-up Questions

**Q1:** I see `lastRecordDate` is already in the `EmployeeTable` columns. Does the backend `EMPLOYEES_QUERY` currently fetch this field?
**Answer:** This feature is already implemented so do not redo it! it is working.

**Q2:** Similarly, I see `lockedUntil` in the table.
**Answer:** This feature is already implemented so do not redo it! it is working.

**Q3:** The `ProjectsPage` uses a `ProjectDialog` that handles both Create and Edit modes. I will replicate this pattern with an `EmployeeDialog` component.
**Answer:** Yes do it like that.

**Q4:** Warning on Name Change: I will implement a client-side check in the `EmployeeDialog`.
**Answer:** Do you need info from me about this point? (Implicitly confirmed need for warning).

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
No visual assets provided.

## Requirements Summary

### Functional Requirements
- **Employee Management Screen**:
  - Maintain existing list and filtering (confirmed working).
  - Add "Create Employee" button opening a dialog.
  - Add "Edit" action to table rows opening the same dialog with pre-filled data.
- **Employee Dialog (Create/Edit)**:
  - **Fields**:
    - First Name (Text)
    - Last Name (Text)
    - Title Prefix (Text, optional)
    - Title Suffix (Text, optional)
    - Employment Type (Dropdown: Zamestnanec, SZCO, Študent, Brigádnik)
    - Vacation Days (Number)
    - Is Admin (Checkbox)
  - **Validation**: Required fields (Names, Type, Vacation).
  - **Warning System**: 
    - When editing an existing employee, if First Name or Last Name is modified, display a warning/confirmation message inside the dialog (e.g., "Changing the name will rename the employee's work record table. This is a significant operation.").
- **Display Columns** (Existing, to be preserved):
  - Full Name, Vacation Days, Admin status, Employee Type, Last Record Date, Locked Until, Titles.
- **Delete Action**:
  - While not explicitly detailed in Phase 6 checklist, standard CRUD implies Delete. `ProjectsTable` has delete. Will check if `EmployeeTable` needs this (implied by "managing"). *Decision: Include Delete action to implement and mimics Projects, but focus on Create/Update as priority.*

### Reusability Opportunities
- **Pattern**: Replicate `frontend/src/app/admin/projects/page.tsx` structure.
- **Component**: Create `EmployeeDialog` following `frontend/src/components/project-dialog.tsx`.
- **Component**: Update `EmployeeTable` to include actions column (Edit/Delete) similar to `ProjectsTable`.
- **Library**: Use `shadcn-cheatsheet` for any missing UI components.

### Scope Boundaries
**In Scope:**
- Creating new employees.
- Editing existing employees.
- Warning on name change.
- UI updates to `EmployeeTable` (adding actions).
- Backend mutations for Create/Update (if not already present - likely need to be hooked up).

**Out of Scope:**
- Signature upload (`Podpis`).
- Authentication/Password management.
- "Lock Attendance" functionality (setting the lock date) - pure display only.
- Re-implementing `lastRecordDate` or `lockedUntil` logic (already working).

### Technical Considerations
- **Backend Mutations**: Ensure `createEmployee` and `updateEmployee` mutations are available and handle the `t_{Name}_{Surname}` table lifecycle (creation/renaming) as described in tech stack.
- **Frontend State**: Use `useState` for dialog mode (create/edit) and selected employee, similar to `ProjectsPage`.
- **Refetching**: Ensure `refetch` is called after successful mutations to update the list.

