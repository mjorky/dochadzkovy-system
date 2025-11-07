# Task Breakdown: Work Records CRUD Operations (Phase 3)

## Overview

This task breakdown implements complete Create, Read, Update, Delete (CRUD) operations for work records following a 3-step implementation plan:
1. **Create Dialog + Mutation** - Build reusable form component and create mutation
2. **Update Dialog + Mutation** - Reuse form component for edit functionality
3. **Delete Dialog + Mutation** - Add delete confirmation dialog

**Total Task Groups:** 4 (3 implementation steps + 1 test review)

**Key Features:**
- Next workday calculation with Slovak holidays
- 30-minute time increment enforcement
- Lock mechanism enforcement (hide edit/delete for locked records)
- Overnight shift detection and helper text
- Last-used field defaults
- "Keep same date" checkbox for multiple entries same day
- Toast notifications + immediate table refresh

---

## Step 1: Create Dialog + Mutation

### Task Group 1.1: Backend - Create Work Record Mutation
**Dependencies:** None

- [ ] 1.1.0 Complete backend Create mutation implementation
  - [ ] 1.1.1 Write 2-8 focused tests for createWorkRecord mutation
    - Test critical behaviors: successful creation, lock validation, overnight shift support
    - File: `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/work-records.service.spec.ts`
    - Focus: Lock validation prevents creation on locked dates, overnight shifts calculated correctly
    - Skip: Exhaustive validation tests for all field combinations
  - [ ] 1.1.2 Create CreateWorkRecordInput DTO
    - File: `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/dto/create-work-record.input.ts`
    - Fields: employeeId, date, absenceTypeId, projectId, productivityTypeId, workTypeId, startTime, endTime, description (optional), km (optional), isTripFlag (optional)
    - Validations: @IsNotEmpty, @IsDate, @IsString, @Min(0) for km, @MaxLength(500) for description
    - Time format: HH:MM or HH:MM:SS
  - [ ] 1.1.3 Create WorkRecordMutationResponse entity
    - File: `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/entities/work-record-mutation-response.entity.ts`
    - Fields: success (Boolean), message (String), record (WorkRecord nullable)
    - Use @ObjectType decorator for GraphQL
  - [ ] 1.1.4 Implement createWorkRecord service method
    - File: `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/work-records.service.ts`
    - Fetch employee from Zamestnanci table (Meno, Priezvisko, ZamknuteK)
    - Construct dynamic table name using `constructTableName()`
    - Validate date > employee.ZamknuteK (lock check)
    - Validate time format and range (allow overnight if endTime < startTime)
    - Insert into per-user table with Lock=false
    - Return WorkRecordMutationResponse with created record
    - Error handling: NotFoundException (employee), ForbiddenException (locked date), BadRequestException (validation)
  - [ ] 1.1.5 Add createWorkRecord mutation resolver
    - File: `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/work-records.resolver.ts`
    - Add @Mutation decorator
    - Accept CreateWorkRecordInput
    - Call service method
    - Return WorkRecordMutationResponse
  - [ ] 1.1.6 Ensure backend Create mutation tests pass
    - Run ONLY the 2-8 tests written in 1.1.1
    - Verify lock validation works
    - Verify overnight shifts handled correctly
    - Do NOT run entire test suite

**Acceptance Criteria:**
- The 2-8 tests written in 1.1.1 pass
- CreateWorkRecordInput DTO validates all required fields
- Service method successfully creates records in dynamic per-user tables
- Lock validation prevents creation on locked dates
- Overnight shifts (endTime < startTime) are accepted
- GraphQL mutation returns proper success/error responses

---

### Task Group 1.2: Backend - Next Workday Calculator Utility
**Dependencies:** None (can run in parallel with 1.1)

- [ ] 1.2.0 Complete next workday calculator utility
  - [ ] 1.2.1 Write 2-8 focused tests for workday calculator
    - Test critical cases: skips weekends, skips Slovak holidays, handles edge cases (Friday to Monday)
    - File: `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/utils/workday-calculator.spec.ts`
    - Focus: Weekend skipping, holiday detection, multi-day gaps
    - Skip: All possible holiday combinations, timezone edge cases
  - [ ] 1.2.2 Create workday calculator utility
    - File: `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/utils/workday-calculator.ts`
    - Function: `calculateNextWorkday(lastRecordDate: Date, employeeId: bigint): Promise<Date>`
    - Query Holidays table for dates between lastRecordDate and today
    - Skip Saturdays (weekday === 6), Sundays (weekday === 0)
    - Skip dates present in Holidays table
    - Return next valid workday Date
    - Handle edge case: if last record is today, return today
  - [ ] 1.2.3 Integrate workday calculator into service
    - File: `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/work-records.service.ts`
    - Add `getNextWorkday` service method
    - Fetch last record date from per-user table (ORDER BY StartDate DESC LIMIT 1)
    - Call `calculateNextWorkday()` utility
    - Return Date for frontend pre-fill
  - [ ] 1.2.4 Add getNextWorkday query resolver
    - File: `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/work-records.resolver.ts`
    - Add @Query decorator
    - Accept employeeId parameter
    - Return Date scalar
  - [ ] 1.2.5 Ensure workday calculator tests pass
    - Run ONLY the 2-8 tests written in 1.2.1
    - Verify weekends skipped correctly
    - Verify Slovak holidays respected
    - Do NOT run entire test suite

**Acceptance Criteria:**
- The 2-8 tests written in 1.2.1 pass
- Utility correctly skips weekends (Saturday/Sunday)
- Utility queries Holidays table and skips Slovak public holidays
- Service method fetches last record date and returns next workday
- GraphQL query available for frontend consumption

---

### Task Group 1.3: Frontend - Reusable Work Record Form Component
**Dependencies:** Task Group 1.1 (needs CreateWorkRecordInput schema), Task Group 1.2 (needs getNextWorkday query)

- [ ] 1.3.0 Complete reusable work record form component
  - [ ] 1.3.1 Write 2-8 focused tests for form component
    - Test critical behaviors: form submission, validation errors, overnight shift helper text display
    - File: `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/work-record-form.test.tsx`
    - Focus: Required field validation, time increment rounding, overnight shift detection UI
    - Skip: All edge cases, accessibility tests, loading states
  - [ ] 1.3.2 Create Zod validation schema
    - File: `/Users/miro/Projects/dochadzkovy-system/frontend/src/lib/validations/work-record-schema.ts`
    - Mirror CreateWorkRecordInput structure
    - Required: date, absenceTypeId, projectId, productivityTypeId, workTypeId, startTime, endTime
    - Optional: description (max 500 chars), km (min 0), isTripFlag
    - Custom validation: startTime and endTime in 30-minute increments
    - Allow overnight: endTime < startTime is valid
  - [ ] 1.3.3 Create time rounding utility
    - File: `/Users/miro/Projects/dochadzkovy-system/frontend/src/lib/utils/time-utils.ts`
    - Function: `roundToNearest30Minutes(time: string): string`
    - Parse HH:MM input, round to nearest 30-minute increment
    - Return formatted HH:MM string
  - [ ] 1.3.4 Create WorkRecordForm component
    - File: `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/work-record-form.tsx`
    - Use React Hook Form with Zod schema
    - Form fields in order:
      1. Date (DatePicker) - with "Keep same date" checkbox
      2. Absence Type (Select dropdown)
      3. Project (Select dropdown)
      4. Productivity Type (Select dropdown)
      5. Work Type (Select dropdown)
      6. Start Time (Input type="time" with step="1800")
      7. End Time (Input type="time" with step="1800") - show overnight helper text if endTime < startTime
      8. Description (Textarea with character counter)
      9. KM (Number input)
      10. Trip Flag (Checkbox)
    - Display overnight shift helper text: "This is an overnight shift (adds 24 hours)" when endTime < startTime
    - Apply time rounding on blur for startTime and endTime inputs
    - Props: initialValues (optional), onSubmit, onCancel, isSubmitting
  - [ ] 1.3.5 Create GraphQL mutation definition
    - File: `/Users/miro/Projects/dochadzkovy-system/frontend/src/graphql/mutations/work-records.ts`
    - Define CREATE_WORK_RECORD mutation
    - Accept CreateWorkRecordInput variable
    - Return WorkRecordMutationResponse fields (success, message, record)
  - [ ] 1.3.6 Create useCreateWorkRecord hook
    - File: `/Users/miro/Projects/dochadzkovy-system/frontend/src/hooks/use-create-work-record.ts`
    - Use Apollo useMutation with CREATE_WORK_RECORD
    - Handle optimistic updates or refetch getWorkRecords query
    - Return mutation function, loading state, error state
  - [ ] 1.3.7 Ensure form component tests pass
    - Run ONLY the 2-8 tests written in 1.3.1
    - Verify form validates required fields
    - Verify overnight helper text displays correctly
    - Do NOT run entire frontend test suite

**Acceptance Criteria:**
- The 2-8 tests written in 1.3.1 pass
- Zod schema validates all required fields and enforces 500 char limit on description
- Time rounding utility rounds to nearest 30-minute increment
- WorkRecordForm renders all fields in correct order
- Overnight shift helper text appears when endTime < startTime
- Form accepts both regular shifts and overnight shifts
- Character counter shows remaining characters for description field

---

### Task Group 1.4: Frontend - Create Work Record Dialog
**Dependencies:** Task Group 1.3 (needs WorkRecordForm component)

- [ ] 1.4.0 Complete Create Work Record dialog implementation
  - [ ] 1.4.1 Write 2-8 focused tests for Create dialog
    - Test critical flows: dialog opens, form submits successfully, error handling
    - File: `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/work-record-dialog.test.tsx`
    - Focus: Dialog state management, success toast, table refetch after success
    - Skip: All form validation tests (covered in 1.3.1), loading states, accessibility
  - [ ] 1.4.2 Create WorkRecordDialog component
    - File: `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/work-record-dialog.tsx`
    - Props: open, onOpenChange, mode ("create" | "edit"), initialData (optional), employeeId
    - Dialog title: "Add Work Entry" for create mode
    - Render WorkRecordForm inside DialogContent
    - Handle form submission:
      - Call useCreateWorkRecord mutation
      - On success: show toast "Work record created successfully", refetch getWorkRecords query, close dialog
      - On error: show toast with error message, keep dialog open
    - Loading state: disable Save button and show spinner during submission
  - [ ] 1.4.3 Fetch default field values from last record
    - Use getWorkRecords query with limit=1, order by date DESC
    - Extract last-used absenceTypeId, projectId, productivityTypeId, workTypeId
    - Store in local state for form initialValues
  - [ ] 1.4.4 Fetch next workday for date pre-fill
    - Call getNextWorkday query with employeeId
    - Pre-fill date field with returned workday
    - Handle "Keep same date" checkbox:
      - When checked, disable date field and keep current value
      - When unchecked, re-enable date field
  - [ ] 1.4.5 Fetch catalog data for dropdowns
    - Use existing queries: getActiveProjects, getAbsenceTypes, getProductivityTypes, getWorkTypes
    - Populate Select dropdowns with fetched data
    - Cache data in Apollo Client for reuse
  - [ ] 1.4.6 Add "Add Entry" button to work records page
    - File: `/Users/miro/Projects/dochadzkovy-system/frontend/src/app/work-records/page.tsx`
    - Add button to page header
    - Manage dialog open state with useState
    - Trigger WorkRecordDialog with mode="create"
  - [ ] 1.4.7 Ensure Create dialog tests pass
    - Run ONLY the 2-8 tests written in 1.4.1
    - Verify dialog opens and closes correctly
    - Verify success flow: toast shown, query refetched, dialog closed
    - Do NOT run entire frontend test suite

**Acceptance Criteria:**
- The 2-8 tests written in 1.4.1 pass
- WorkRecordDialog renders with correct title "Add Work Entry"
- Date field pre-fills with next workday (skips weekends and holidays)
- "Keep same date" checkbox controls date field enable/disable
- Dropdowns populated with catalog data from GraphQL queries
- Last-used field values pre-filled for absenceType, project, productivityType, workType
- On successful creation: toast notification shown, table refreshed, dialog closed
- On error: toast with error message shown, dialog remains open
- "Add Entry" button on work records page opens Create dialog

---

## Step 2: Update Dialog + Mutation

### Task Group 2.1: Backend - Update Work Record Mutation
**Dependencies:** Task Group 1.1 (reuses CreateWorkRecordInput structure)

- [ ] 2.1.0 Complete backend Update mutation implementation
  - [ ] 2.1.1 Write 2-8 focused tests for updateWorkRecord mutation
    - Test critical behaviors: successful update, lock validation prevents editing, record not found error
    - File: `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/work-records.service.spec.ts`
    - Focus: Lock checks (Record.Lock=true OR StartDate <= ZamknuteK), partial updates work
    - Skip: All field validation combinations, edge cases
  - [ ] 2.1.2 Create UpdateWorkRecordInput DTO
    - File: `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/dto/update-work-record.input.ts`
    - Fields: recordId (required), employeeId (required), all CreateWorkRecordInput fields (optional)
    - Use @IsOptional for all update fields except recordId and employeeId
    - Reuse validation decorators from CreateWorkRecordInput
  - [ ] 2.1.3 Implement updateWorkRecord service method
    - File: `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/work-records.service.ts`
    - Fetch employee from Zamestnanci (Meno, Priezvisko, ZamknuteK)
    - Construct dynamic table name
    - Fetch existing record from per-user table by recordId
    - Throw NotFoundException if record doesn't exist
    - Validate NOT locked: Record.Lock === false AND Record.StartDate > employee.ZamknuteK
    - Throw ForbiddenException with message "Cannot edit locked record" if locked
    - Update record with provided fields (partial update)
    - Return WorkRecordMutationResponse with updated record
  - [ ] 2.1.4 Add updateWorkRecord mutation resolver
    - File: `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/work-records.resolver.ts`
    - Add @Mutation decorator
    - Accept UpdateWorkRecordInput
    - Call service method
    - Return WorkRecordMutationResponse
  - [ ] 2.1.5 Ensure backend Update mutation tests pass
    - Run ONLY the 2-8 tests written in 2.1.1
    - Verify lock validation prevents editing locked records
    - Verify partial updates work (only changed fields updated)
    - Do NOT run entire test suite

**Acceptance Criteria:**
- The 2-8 tests written in 2.1.1 pass
- UpdateWorkRecordInput DTO supports partial updates (all fields optional except recordId/employeeId)
- Service method fetches existing record and validates lock status
- Lock validation prevents updates when Record.Lock=true OR StartDate <= ZamknuteK
- ForbiddenException thrown with clear message when attempting to edit locked record
- Mutation returns updated record with all fields

---

### Task Group 2.2: Frontend - Update Work Record Dialog
**Dependencies:** Task Group 1.3 (reuses WorkRecordForm), Task Group 1.4 (reuses WorkRecordDialog), Task Group 2.1 (needs updateWorkRecord mutation)

- [ ] 2.2.0 Complete Update Work Record dialog implementation
  - [ ] 2.2.1 Write 2-8 focused tests for Update dialog
    - Test critical flows: dialog opens with pre-filled data, form submits update successfully, error handling
    - File: `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/work-record-dialog.test.tsx` (extend existing tests)
    - Focus: Pre-fill form fields from record data, success toast "updated", table refetch
    - Skip: Form validation (covered in 1.3.1), all edge cases
  - [ ] 2.2.2 Create GraphQL UPDATE_WORK_RECORD mutation
    - File: `/Users/miro/Projects/dochadzkovy-system/frontend/src/graphql/mutations/work-records.ts` (add to existing)
    - Accept UpdateWorkRecordInput variable
    - Return WorkRecordMutationResponse
  - [ ] 2.2.3 Create useUpdateWorkRecord hook
    - File: `/Users/miro/Projects/dochadzkovy-system/frontend/src/hooks/use-update-work-record.ts`
    - Use Apollo useMutation with UPDATE_WORK_RECORD
    - Handle refetch of getWorkRecords query on success
    - Return mutation function, loading, error
  - [ ] 2.2.4 Extend WorkRecordDialog for edit mode
    - File: `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/work-record-dialog.tsx` (modify existing)
    - When mode="edit", change title to "Edit Work Entry"
    - Accept initialData prop with WorkRecord to pre-fill form
    - Pass initialData to WorkRecordForm as initialValues
    - On submit in edit mode:
      - Call useUpdateWorkRecord mutation
      - On success: toast "Work record updated successfully", refetch, close dialog
      - On error: toast error message, keep dialog open
  - [ ] 2.2.5 Add Edit action to work records table
    - File: `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/work-records-table.tsx`
    - Add new "Actions" TableHead column
    - Add TableCell with Edit button (pencil icon)
    - Conditionally render: hide Edit button if record.isLocked === true
    - On click: emit callback to parent with record data
  - [ ] 2.2.6 Connect Edit action to dialog in page
    - File: `/Users/miro/Projects/dochadzkovy-system/frontend/src/app/work-records/page.tsx`
    - Add state for selectedRecord
    - Pass handleEdit callback to WorkRecordsTable
    - Open WorkRecordDialog with mode="edit" and initialData=selectedRecord
  - [ ] 2.2.7 Ensure Update dialog tests pass
    - Run ONLY the 2-8 tests written in 2.2.1
    - Verify dialog opens with pre-filled form values
    - Verify success flow: toast shown, query refetched, dialog closed
    - Do NOT run entire frontend test suite

**Acceptance Criteria:**
- The 2-8 tests written in 2.2.1 pass
- WorkRecordDialog supports mode="edit" with title "Edit Work Entry"
- Form pre-fills all fields with existing record data
- Edit button (pencil icon) appears in table Actions column for unlocked records
- Edit button hidden for locked records (isLocked === true)
- On successful update: toast "Work record updated successfully", table refreshed, dialog closed
- On error: toast with error message, dialog remains open

---

## Step 3: Delete Dialog + Mutation

### Task Group 3.1: Backend - Delete Work Record Mutation
**Dependencies:** Task Group 1.1 (reuses error handling patterns)

- [ ] 3.1.0 Complete backend Delete mutation implementation
  - [ ] 3.1.1 Write 2-8 focused tests for deleteWorkRecord mutation
    - Test critical behaviors: successful deletion, lock validation prevents deletion, record not found error
    - File: `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/work-records.service.spec.ts`
    - Focus: Lock checks prevent deletion, DELETE query executes correctly
    - Skip: Edge cases, cascading deletes (not applicable)
  - [ ] 3.1.2 Create DeleteWorkRecordInput DTO
    - File: `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/dto/delete-work-record.input.ts`
    - Fields: recordId (required), employeeId (required)
    - Simple DTO with @IsNotEmpty validators
  - [ ] 3.1.3 Implement deleteWorkRecord service method
    - File: `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/work-records.service.ts`
    - Fetch employee from Zamestnanci (Meno, Priezvisko, ZamknuteK)
    - Construct dynamic table name
    - Fetch existing record to validate lock status
    - Throw NotFoundException if record doesn't exist
    - Validate NOT locked: Record.Lock === false AND Record.StartDate > employee.ZamknuteK
    - Throw ForbiddenException with message "Cannot delete locked record" if locked
    - Execute DELETE query on per-user table
    - Return WorkRecordMutationResponse with success=true
  - [ ] 3.1.4 Add deleteWorkRecord mutation resolver
    - File: `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/work-records.resolver.ts`
    - Add @Mutation decorator
    - Accept DeleteWorkRecordInput
    - Call service method
    - Return WorkRecordMutationResponse
  - [ ] 3.1.5 Ensure backend Delete mutation tests pass
    - Run ONLY the 2-8 tests written in 3.1.1
    - Verify lock validation prevents deleting locked records
    - Verify DELETE executes successfully for unlocked records
    - Do NOT run entire test suite

**Acceptance Criteria:**
- The 2-8 tests written in 3.1.1 pass
- DeleteWorkRecordInput accepts recordId and employeeId
- Service method validates lock status before deletion
- ForbiddenException thrown with message "Cannot delete locked record" when locked
- DELETE query executes on correct per-user table
- Mutation returns success response

---

### Task Group 3.2: Frontend - Delete Work Record Confirmation Dialog
**Dependencies:** Task Group 3.1 (needs deleteWorkRecord mutation)

- [ ] 3.2.0 Complete Delete confirmation dialog implementation
  - [ ] 3.2.1 Write 2-8 focused tests for Delete dialog
    - Test critical flows: dialog shows record summary, deletion succeeds, cancellation works
    - File: `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/delete-work-record-dialog.test.tsx`
    - Focus: Confirmation message displays correctly, success toast, table refetch after deletion
    - Skip: Edge cases, loading states
  - [ ] 3.2.2 Create GraphQL DELETE_WORK_RECORD mutation
    - File: `/Users/miro/Projects/dochadzkovy-system/frontend/src/graphql/mutations/work-records.ts` (add to existing)
    - Accept DeleteWorkRecordInput variable
    - Return WorkRecordMutationResponse
  - [ ] 3.2.3 Create useDeleteWorkRecord hook
    - File: `/Users/miro/Projects/dochadzkovy-system/frontend/src/hooks/use-delete-work-record.ts`
    - Use Apollo useMutation with DELETE_WORK_RECORD
    - Handle refetch of getWorkRecords query on success
    - Return mutation function, loading, error
  - [ ] 3.2.4 Create DeleteWorkRecordDialog component
    - File: `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/delete-work-record-dialog.tsx`
    - Props: open, onOpenChange, record, employeeId
    - Dialog title: "Delete Work Entry"
    - Content: "Are you sure you want to delete this work entry?"
    - Summary: "Date: {date}, Project: {project}, Hours: {hours}"
    - Buttons: "Delete" (destructive variant), "Cancel"
    - On Delete click:
      - Call useDeleteWorkRecord mutation with recordId and employeeId
      - On success: toast "Work record deleted successfully", refetch getWorkRecords, close dialog
      - On error: toast error message, keep dialog open
    - Loading state: disable Delete button during mutation
  - [ ] 3.2.5 Add Delete action to work records table
    - File: `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/work-records-table.tsx`
    - Add Delete button (trash icon) to Actions column
    - Conditionally render: hide Delete button if record.isLocked === true
    - On click: emit callback to parent with record data
  - [ ] 3.2.6 Connect Delete action to dialog in page
    - File: `/Users/miro/Projects/dochadzkovy-system/frontend/src/app/work-records/page.tsx`
    - Add state for recordToDelete
    - Pass handleDelete callback to WorkRecordsTable
    - Render DeleteWorkRecordDialog with recordToDelete
  - [ ] 3.2.7 Ensure Delete dialog tests pass
    - Run ONLY the 2-8 tests written in 3.2.1
    - Verify confirmation message shows record details
    - Verify success flow: toast shown, query refetched, dialog closed
    - Do NOT run entire frontend test suite

**Acceptance Criteria:**
- The 2-8 tests written in 3.2.1 pass
- DeleteWorkRecordDialog displays clear confirmation message
- Summary shows Date, Project, and Hours for record being deleted
- Delete button (trash icon) appears in table Actions column for unlocked records
- Delete button hidden for locked records (isLocked === true)
- On successful deletion: toast "Work record deleted successfully", table refreshed, dialog closed
- On error: toast with error message, dialog remains open
- Cancel button closes dialog without action

---

## Step 4: Testing & Validation

### Task Group 4.1: Test Review & Gap Analysis
**Dependencies:** Task Groups 1.1-3.2 (all feature implementation complete)

- [ ] 4.1.0 Review existing tests and fill critical gaps only
  - [ ] 4.1.1 Review tests from Task Groups 1-3
    - Review backend tests (1.1.1, 1.2.1, 2.1.1, 3.1.1) - approximately 8-32 tests
    - Review frontend tests (1.3.1, 1.4.1, 2.2.1, 3.2.1) - approximately 8-32 tests
    - Total existing tests: approximately 16-64 tests for this feature
  - [ ] 4.1.2 Analyze test coverage gaps for THIS feature only
    - Identify critical user workflows lacking coverage
    - Focus on integration points: GraphQL mutations → service methods → database
    - Prioritize end-to-end workflows over unit test gaps
    - DO NOT assess entire application test coverage
    - Example gaps to look for:
      - Complete create → table refresh flow
      - Edit locked record rejection flow
      - Delete locked record rejection flow
      - Next workday calculation with consecutive holidays
      - Overnight shift hours calculation accuracy
  - [ ] 4.1.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new integration/E2E tests IF needed
    - Focus on critical user journeys for this feature:
      - Create work record → verify appears in table
      - Update work record → verify changes reflected
      - Delete work record → verify removed from table
      - Attempt edit/delete on locked record → verify error
      - Create overnight shift → verify hours calculated correctly
    - Files:
      - Backend integration: `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/work-records.integration.spec.ts`
      - Frontend E2E: `/Users/miro/Projects/dochadzkovy-system/frontend/src/__tests__/work-records-crud.e2e.test.tsx`
    - Skip: Performance tests, accessibility audits, edge cases (unless business-critical)
  - [ ] 4.1.4 Run feature-specific tests only
    - Backend: Run work-records service and resolver tests
    - Frontend: Run work-record form, dialog, and hook tests
    - Expected total: approximately 16-74 tests maximum (16-64 from dev + up to 10 gap tests)
    - DO NOT run entire application test suite
    - Verify all critical workflows pass
    - Fix any failures before marking feature complete

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 16-74 tests total)
- Critical user workflows covered: create, update, delete work records
- Lock enforcement validated in tests
- Overnight shift calculation accuracy verified
- Next workday calculation with holidays tested
- No more than 10 additional tests added when filling gaps
- Testing focused exclusively on Phase 3 Work Records CRUD feature

---

## Execution Recommendations

### Priority Order
1. **Task Group 1.1** - Backend Create mutation (foundation for all other mutations)
2. **Task Group 1.2** - Next workday calculator (can run parallel with 1.1)
3. **Task Group 1.3** - Frontend form component (depends on 1.1 schema)
4. **Task Group 1.4** - Create dialog (depends on 1.3)
5. **Task Group 2.1** - Backend Update mutation (reuses 1.1 patterns)
6. **Task Group 2.2** - Update dialog (reuses 1.3 and 1.4 components)
7. **Task Group 3.1** - Backend Delete mutation (reuses 1.1 patterns)
8. **Task Group 3.2** - Delete dialog (new component)
9. **Task Group 4.1** - Test review and gap filling (after all features complete)

### Parallel Execution Opportunities
- Task Groups 1.1 and 1.2 can run in parallel (independent utilities)
- Backend mutations (1.1, 2.1, 3.1) can be completed by backend-engineer role
- Frontend components (1.3, 1.4, 2.2, 3.2) can be completed by ui-designer role
- Final testing (4.1) should be handled by test-engineer role

### Key Dependencies to Respect
- Frontend form (1.3) needs CreateWorkRecordInput schema from backend (1.1.2)
- Update dialog (2.2) needs WorkRecordForm component (1.3)
- All dialogs need their respective backend mutations implemented first
- Test review (4.1) must wait for all feature implementation to complete

---

## Implementation Notes

### Reusability Patterns
- WorkRecordForm component is designed to be reused for both Create and Edit modes
- WorkRecordDialog component supports mode="create" | "edit" to reduce duplication
- All three mutations (create/update/delete) follow the same error handling pattern
- Time rounding utility is shared across all time inputs

### Lock Enforcement Strategy
- Backend enforces locks at service layer before any mutation
- Frontend hides Edit/Delete buttons for locked records (isLocked field from query)
- Two lock conditions: Record.Lock=true OR StartDate <= employee.ZamknuteK

### Overnight Shift Handling
- Backend accepts endTime < startTime as valid
- Backend calculates hours by adding 24 hours (1440 minutes) to endTime
- Frontend displays helper text "This is an overnight shift (adds 24 hours)"
- Frontend shows moon icon in table for overnight shifts

### Slovak Holiday Integration
- Holidays table queried to get list of public holiday dates
- Next workday calculation skips: Saturdays, Sundays, dates in Holidays table
- "Keep same date" checkbox allows bypassing next workday calculation for multiple entries same day

### Time Increment Enforcement
- HTML input type="time" with step="1800" (30 minutes) for browser-native support
- Client-side rounding function rounds invalid times to nearest 30-minute increment
- Applied on blur event for startTime and endTime fields

### User Feedback Mechanisms
- Success: Toast notification + immediate table refetch (no optimistic updates to avoid stale data)
- Error: Toast with specific error message + dialog remains open for correction
- Loading: Disable submit button and show spinner during mutation execution

### Field Default Values
- Date: Next workday from `getNextWorkday` query
- Absence Type, Project, Productivity Type, Work Type: Last-used values from latest work record
- Description: Empty
- KM: 0
- Trip Flag: false

### Testing Strategy
- Each task group writes 2-8 focused tests during development
- Test only critical behaviors, not exhaustive coverage
- Run only newly written tests during development (not entire suite)
- Final test review (4.1) adds maximum 10 integration tests if gaps exist
- Total expected tests: 16-74 tests for entire Work Records CRUD feature

---

## Files to Create/Modify

### Backend Files

**New Files:**
1. `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/dto/create-work-record.input.ts` - Create DTO
2. `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/dto/update-work-record.input.ts` - Update DTO
3. `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/dto/delete-work-record.input.ts` - Delete DTO
4. `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/entities/work-record-mutation-response.entity.ts` - Mutation response type
5. `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/utils/workday-calculator.ts` - Next workday utility
6. `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/utils/workday-calculator.spec.ts` - Workday calculator tests
7. `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/work-records.integration.spec.ts` - Integration tests (optional, Task 4.1.3)

**Modified Files:**
1. `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/work-records.service.ts` - Add create, update, delete, getNextWorkday methods
2. `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/work-records.resolver.ts` - Add mutation resolvers
3. `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/work-records.service.spec.ts` - Add mutation tests

### Frontend Files

**New Files:**
1. `/Users/miro/Projects/dochadzkovy-system/frontend/src/lib/validations/work-record-schema.ts` - Zod validation schema
2. `/Users/miro/Projects/dochadzkovy-system/frontend/src/lib/utils/time-utils.ts` - Time rounding utility
3. `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/work-record-form.tsx` - Reusable form component
4. `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/work-record-form.test.tsx` - Form tests
5. `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/work-record-dialog.tsx` - Create/Edit dialog
6. `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/work-record-dialog.test.tsx` - Dialog tests
7. `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/delete-work-record-dialog.tsx` - Delete confirmation dialog
8. `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/delete-work-record-dialog.test.tsx` - Delete dialog tests
9. `/Users/miro/Projects/dochadzkovy-system/frontend/src/graphql/mutations/work-records.ts` - GraphQL mutation definitions
10. `/Users/miro/Projects/dochadzkovy-system/frontend/src/hooks/use-create-work-record.ts` - Create mutation hook
11. `/Users/miro/Projects/dochadzkovy-system/frontend/src/hooks/use-update-work-record.ts` - Update mutation hook
12. `/Users/miro/Projects/dochadzkovy-system/frontend/src/hooks/use-delete-work-record.ts` - Delete mutation hook
13. `/Users/miro/Projects/dochadzkovy-system/frontend/src/__tests__/work-records-crud.e2e.test.tsx` - E2E tests (optional, Task 4.1.3)

**Modified Files:**
1. `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/work-records-table.tsx` - Add Actions column with Edit/Delete buttons
2. `/Users/miro/Projects/dochadzkovy-system/frontend/src/app/work-records/page.tsx` - Add "Add Entry" button, manage dialog state

---

## Critical Success Factors

1. **Lock enforcement**: Must prevent editing/deleting locked records at both backend and frontend levels
2. **Data integrity**: Mutations must write to correct per-user dynamic table names
3. **Validation consistency**: Business rules enforced on both client (Zod) and server (class-validator)
4. **User experience**: Immediate feedback with toast notifications + table refresh
5. **Overnight shifts**: Correctly handled in UI (helper text) and backend (hours calculation)
6. **Slovak holidays**: Next workday calculation accurately queries Holidays table
7. **Time increments**: 30-minute steps enforced with client-side rounding and browser-native step attribute
8. **Reusability**: WorkRecordForm and WorkRecordDialog components minimize code duplication
9. **Error handling**: Clear error messages for lock violations, validation failures, not found errors
10. **Testing discipline**: Write only 2-8 focused tests per task group, add maximum 10 gap tests at end

---

## Out of Scope (Deferred to Later Phases)

- CSV export functionality (Phase 4, Item 15)
- Record copy feature for duplicating entries to multiple dates (Phase 4, Item 14)
- Advanced next workday UI hints and suggestions (Phase 4, Item 13)
- Authentication and role-based access control (Phase 11, Items 34-36)
- Bilingual Slovak/English support (Phase 12, Item 37)
- Automatic overnight overtime calculation (Phase 12, Item 41)
- Mobile responsive optimizations (Phase 12, Item 39)
- Advanced error boundaries and loading skeletons (Phase 12, Item 38)
- Performance optimizations like pagination and lazy loading (Phase 12, Item 40)
- E2E testing suite with Playwright/Cypress (Phase 13, Item 42)

---

**Tasks List Created:** 2025-11-07
**Total Tasks:** 47 sub-tasks across 9 task groups
**Estimated Complexity:** High (full-stack CRUD with complex business rules)
**Recommended Team:** Backend engineer, Frontend engineer, Test engineer
