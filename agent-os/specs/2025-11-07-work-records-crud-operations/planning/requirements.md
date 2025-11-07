# Spec Requirements: Work Records CRUD Operations (Phase 3)

## Initial Description
[User's original spec description from raw-idea.md]

Implement complete Create, Read, Update, Delete (CRUD) operations for work records in the attendance tracking system. This builds on Phase 2 (read-only display) by adding:

1. **Create Dialog & Mutation (Items 9 & 10)** - Allow users to add new work entries via dialog form with validation
2. **Update Dialog & Mutation (Item 11)** - Allow users to edit existing work entries, respecting lock status
3. **Delete Dialog & Mutation (Item 12)** - Allow users to delete work entries with confirmation, respecting lock status

## Requirements Discussion

### First Round Questions

**Q1: Date pre-fill behavior**
**Answer:** Next workday from last record in database, considering Slovak holidays (example: if last record is Aug 28 2025, pre-fill Sep 1 2025 because Aug 29 was Slovak holiday, Aug 30 was Saturday, Aug 31 was Sunday).

**IMPORTANT EXTENSION:** Add a checkbox - when ticked, keep the date that is currently chosen for previous record (for adding multiple records on same day).

For other fields: use last-used project/productivity/work type per user.

**Q2: Time picker behavior**
**Answer:** Enforce 30-minute increments. If wrong time entered, round it appropriately. Reference: "Date and Time Picker" component from `/Users/miro/Projects/dochadzkovy-system/shadcn-cheatsheet`.

**Q3: Overnight shifts**
**Answer:** Show helper text "This is an overnight shift (adds 24 hours)" to confirm.

**Q4: Locked records UI**
**Answer:** Hide edit/delete buttons entirely.

**Q5: Required fields**
**Answer:** Required: date, absence type, start time, end time, project, productivity type, work type. Optional: description, km, trip checkbox.

**Q6: Validations**
**Answer:**
- End time must be after start time OR allow overnight (end < start)
- KM field must be >= 0
- Description max 500 characters

**Q7: Delete confirmation**
**Answer:** Show summary of record being deleted (date, project, hours).

**Q8: User feedback**
**Answer:** Both toast AND immediate table update.

**Q9: Dialog labels**
**Answer:** "Add Work Entry" / "Edit Work Entry" with "Save" / "Cancel" buttons.

**Q10: Dropdown data**
**Answer:** Assume catalog data is already cached.

**Q11: Field order in form**
**Answer:** Date → Absence Type → Project → Productivity Type → Work Type → Start Time → End Time → Description → KM → Trip checkbox.

**Q12: Scope boundaries**
**Answer:** Only exclude features planned for later phases in roadmap (`/Users/miro/Projects/dochadzkovy-system/agent-os/product/roadmap.md`).

### Existing Code to Reference

**Phase 2 Implementation (Already Complete):**
- Frontend work records table: `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/work-records-table.tsx`
- Backend service: `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/work-records.service.ts`
- Backend resolver: `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/work-records.resolver.ts`
- GraphQL queries already exist for fetching work records, active projects, absence types, productivity types, work types

**Reusable UI Components (Already in Project):**
- Dialog: `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/ui/dialog.tsx`
- DatePicker: `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/ui/date-picker.tsx`
- Select: `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/ui/select.tsx`
- Input: `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/ui/input.tsx`
- Checkbox: `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/ui/checkbox.tsx`
- Button: `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/ui/button.tsx`

**Shadcn Reference Components (Copy and Adapt):**
- Date/Time Picker Examples: `/Users/miro/Projects/dochadzkovy-system/shadcn-cheatsheet/registry/default/examples/date-picker-form.tsx`
- Form Components: `/Users/miro/Projects/dochadzkovy-system/shadcn-cheatsheet/components/ui/form.tsx`
- Dialog Examples: `/Users/miro/Projects/dochadzkovy-system/shadcn-cheatsheet/registry/default/examples/dialog-demo.tsx`

**Database & Backend Patterns:**
- Per-user table structure: `t_{FirstName}_{LastName}` (diacritics removed)
- Dynamic table name construction: `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/utils/normalize-table-name.ts`
- Overnight hours calculation: `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/utils/time-calculations.ts`
- Prisma schema: `/Users/miro/Projects/dochadzkovy-system/backend/prisma/schema.prisma`

## Visual Assets

### Files Provided:
Refer to helper repo `/Users/miro/Projects/dochadzkovy-system/shadcn-cheatsheet` and `/Users/miro/Projects/dochadzkovy-system/agent-os/specs/2025-11-05-work-records-read-display/planning/visuals`.

### Visual Insights:
Refer to helper repo `/Users/miro/Projects/dochadzkovy-system/shadcn-cheatsheet` and `/Users/miro/Projects/dochadzkovy-system/agent-os/specs/2025-11-05-work-records-read-display/planning/visuals`.

## Requirements Summary

### Functional Requirements

#### 1. Create Work Record (Dialog + Mutation)

**Dialog UI:**
- Title: "Add Work Entry"
- Open trigger: "Add Entry" button on work records page
- Form fields in order:
  1. **Date** (DatePicker) - Required
     - Default: Next workday from last record, skipping weekends and Slovak holidays
     - Checkbox: "Keep same date as previous entry" (for multiple entries on same day)
  2. **Absence Type** (Select dropdown) - Required
     - Populated from `getAbsenceTypes` query
     - Default: Last used absence type by user
  3. **Project** (Select dropdown) - Required
     - Populated from `getActiveProjects` query (AllowAssignWorkingHours = true)
     - Default: Last used project by user
  4. **Productivity Type** (Select dropdown) - Required
     - Populated from `getProductivityTypes` query
     - Default: Last used productivity type by user
  5. **Work Type** (Select dropdown) - Required
     - Populated from `getWorkTypes` query
     - Default: Last used work type by user
  6. **Start Time** (Time input) - Required
     - 30-minute increments enforced (08:00, 08:30, 09:00, etc.)
     - Round inappropriate values
  7. **End Time** (Time input) - Required
     - 30-minute increments enforced
     - Validation: End >= Start OR overnight shift (End < Start)
     - Show helper text when overnight: "This is an overnight shift (adds 24 hours)"
  8. **Description** (Textarea) - Optional
     - Max 500 characters
  9. **KM** (Number input) - Optional
     - Validation: >= 0
     - Default: 0
  10. **Trip Flag** (Checkbox) - Optional
      - Label: "Long-term business trip"
      - Maps to `DlhodobaSC` field
- Buttons: "Save" (submit), "Cancel" (close)

**Backend Mutation:**
- Name: `createWorkRecord`
- Input DTO: `CreateWorkRecordInput`
  - employeeId: BigInt (required)
  - date: Date (required)
  - absenceTypeId: BigInt (required)
  - projectId: BigInt (required)
  - productivityTypeId: BigInt (required)
  - workTypeId: BigInt (required)
  - startTime: Time (required)
  - endTime: Time (required)
  - description: String (optional, max 500 chars)
  - km: Int (optional, >= 0, default 0)
  - isTripFlag: Boolean (optional, default false)
- Business Logic:
  - Get employee Meno and Priezvisko from Zamestnanci table
  - Construct dynamic table name: `t_{FirstName}_{LastName}` (remove diacritics)
  - Validate NOT locked: Record date > employee.ZamknuteK
  - Validate times: End >= Start OR overnight allowed
  - Insert into per-user table with Lock=false
  - Return created record with computed hours field
- Error Handling:
  - Employee not found: 404
  - Date is locked: 403 with message "Cannot create record for locked date"
  - Invalid time range: 400 with message "End time must be after start time or indicate overnight shift"
  - Database error: 500

**Frontend Integration:**
- Add mutation hook: `useCreateWorkRecord()`
- On success:
  - Show toast: "Work record created successfully"
  - Refresh work records table (refetch query)
  - Close dialog
- On error:
  - Show toast with error message
  - Keep dialog open for correction

#### 2. Update Work Record (Dialog + Mutation)

**Dialog UI:**
- Title: "Edit Work Entry"
- Open trigger: Edit icon (pencil) on table row (NOT shown if locked)
- Pre-fill all fields with existing values
- Same form fields as Create
- Date picker disabled if record is locked
- Buttons: "Save" (submit), "Cancel" (close)

**Backend Mutation:**
- Name: `updateWorkRecord`
- Input DTO: `UpdateWorkRecordInput`
  - recordId: BigInt (required)
  - employeeId: BigInt (required)
  - All fields from CreateWorkRecordInput (optional for update)
- Business Logic:
  - Get employee Meno and Priezvisko from Zamestnanci table
  - Construct dynamic table name
  - Fetch existing record from per-user table
  - Validate NOT locked:
    - Record.Lock = false
    - Record.StartDate > employee.ZamknuteK
  - Validate times if changed
  - Update record in per-user table
  - Return updated record with computed hours
- Error Handling:
  - Record not found: 404
  - Record is locked: 403 with message "Cannot edit locked record"
  - Invalid validation: 400
  - Database error: 500

**Frontend Integration:**
- Add mutation hook: `useUpdateWorkRecord()`
- On success:
  - Show toast: "Work record updated successfully"
  - Refresh work records table (refetch query)
  - Close dialog
- On error:
  - Show toast with error message
  - Keep dialog open

#### 3. Delete Work Record (Confirmation Dialog + Mutation)

**Confirmation Dialog UI:**
- Title: "Delete Work Entry"
- Open trigger: Delete icon (trash) on table row (NOT shown if locked)
- Content:
  - "Are you sure you want to delete this work entry?"
  - Summary: "Date: {date}, Project: {project}, Hours: {hours}"
- Buttons: "Delete" (destructive), "Cancel"

**Backend Mutation:**
- Name: `deleteWorkRecord`
- Input:
  - recordId: BigInt (required)
  - employeeId: BigInt (required)
- Business Logic:
  - Get employee name from Zamestnanci
  - Construct dynamic table name
  - Fetch record
  - Validate NOT locked (same checks as update)
  - DELETE from per-user table
  - Return success boolean
- Error Handling:
  - Record not found: 404
  - Record is locked: 403 with message "Cannot delete locked record"
  - Database error: 500

**Frontend Integration:**
- Add mutation hook: `useDeleteWorkRecord()`
- On success:
  - Show toast: "Work record deleted successfully"
  - Refresh work records table (refetch query)
  - Close confirmation dialog
- On error:
  - Show toast with error message
  - Keep dialog open

### Reusability Opportunities

**Components to Reuse:**
- Dialog primitive from shadcn/ui (already in project)
- DatePicker component (already in project, may need time picker extension)
- Form components from React Hook Form + Zod validation
- Select dropdowns (already in project)
- Input fields (already in project)
- Checkbox component (already in project)
- Toast notifications (need to verify sonner or similar is installed)

**Backend Patterns to Follow:**
- Dynamic table name construction (already implemented in `normalize-table-name.ts`)
- Lock validation pattern (already used in `getWorkRecords`)
- GraphQL resolver pattern (already established in `work-records.resolver.ts`)
- Error handling with typed GraphQL errors

**GraphQL Queries Already Available:**
- `getWorkRecords` - for refreshing table
- `getActiveProjects` - for project dropdown
- `getAbsenceTypes` - for absence type dropdown
- `getProductivityTypes` - for productivity type dropdown
- `getWorkTypes` - for work type dropdown

### Scope Boundaries

**In Scope (Phase 3):**
- Create work record dialog with all validations
- Update work record dialog with pre-filled values
- Delete work record with confirmation
- Lock status enforcement (hide edit/delete for locked records)
- Next workday calculation with Slovak holidays
- Overnight shift detection and helper text
- 30-minute time increment enforcement
- Toast notifications on success/error
- Immediate table refresh after mutations
- Last-used field defaults (project, productivity, work type)
- "Keep same date" checkbox for multiple entries

**Out of Scope (Later Phases per Roadmap):**
- CSV export (Phase 4, Item 15)
- Record copy feature (Phase 4, Item 14)
- Next workday suggestion with holiday awareness UI (Phase 4, Item 13) - We implement the backend logic, but advanced UI hints are Phase 4
- Authentication/RBAC (Phase 11, Items 34-36)
- Bilingual support (Phase 12, Item 37)
- Automated overtime calculation (Phase 12, Item 41)

### Technical Considerations

#### Database Schema
- Per-user tables: `t_{FirstName}_{LastName}` (e.g., `t_Miroslav_Boloz`)
- Table structure from Prisma schema:
  ```prisma
  model t_{Name}_{Surname} {
    ID           BigInt     @id @default(autoincrement())
    CinnostTypID BigInt     // FK to CinnostTyp (Absence Type)
    StartDate    DateTime   @db.Date
    ProjectID    BigInt?    // FK to Projects
    HourTypeID   BigInt?    // FK to HourType (Productivity Type)
    HourTypesID  BigInt?    // FK to HourTypes (Work Type)
    StartTime    DateTime   @db.Time(6)
    EndTime      DateTime   @db.Time(6)
    Description  String?
    km           Int?       @default(0)
    Lock         Boolean    @default(false)
    DlhodobaSC   Boolean    @default(false) // Trip flag
  }
  ```

#### Lock Mechanism
Records are locked if:
1. Record.Lock = true (per-record lock), OR
2. Record.StartDate <= employee.ZamknuteK (date-based lock)

Locked records:
- Cannot be edited
- Cannot be deleted
- Edit/delete buttons hidden in UI

#### Overnight Shift Logic
If EndTime < StartTime, it's an overnight shift:
- Add 24 hours to calculation
- Display helper text: "This is an overnight shift (adds 24 hours)"
- Already implemented in backend: `/Users/miro/Projects/dochadzkovy-system/backend/src/work-records/utils/time-calculations.ts`

#### Slovak Holidays
- Holiday dates stored in `Holidays` table (model exists in Prisma schema)
- Use for next workday calculation
- Query: `SELECT Den FROM Holidays WHERE Den BETWEEN $startDate AND $endDate`
- Skip Saturdays, Sundays, and dates in Holidays table

#### Time Increments
- Enforce 30-minute steps: 08:00, 08:30, 09:00, 09:30, etc.
- Round user input to nearest 30-minute increment
- Can use HTML input type="time" with step="1800" (1800 seconds = 30 minutes)

#### Field Nullability Business Rules
Based on documentation in `/Users/miro/Projects/dochadzkovy-system/docs/db/RELATIONAL_SCHEMA_GUIDE.md`:

**Always Required:**
- CinnostTypID (Absence Type)
- StartDate
- StartTime
- EndTime

**Conditionally Required (Work Records vs Absence Records):**
- For "Prítomnosť" (Present at work): ProjectID, HourTypeID, HourTypesID REQUIRED
- For other absence types: ProjectID, HourTypeID, HourTypesID may be NULL

**Note:** Since user answers specify all fields as required, we treat this as work record creation (not absence tracking). If absence type is selected, we may need to adjust validation or disable project/productivity/work type fields.

#### GraphQL Schema Extension Needed

**New Types:**
```graphql
input CreateWorkRecordInput {
  employeeId: ID!
  date: Date!
  absenceTypeId: ID!
  projectId: ID!
  productivityTypeId: ID!
  workTypeId: ID!
  startTime: Time!
  endTime: Time!
  description: String
  km: Int
  isTripFlag: Boolean
}

input UpdateWorkRecordInput {
  recordId: ID!
  employeeId: ID!
  date: Date
  absenceTypeId: ID
  projectId: ID
  productivityTypeId: ID
  workTypeId: ID
  startTime: Time
  endTime: Time
  description: String
  km: Int
  isTripFlag: Boolean
}

input DeleteWorkRecordInput {
  recordId: ID!
  employeeId: ID!
}

type WorkRecordMutationResponse {
  success: Boolean!
  message: String
  record: WorkRecord
}
```

**New Mutations:**
```graphql
type Mutation {
  createWorkRecord(input: CreateWorkRecordInput!): WorkRecordMutationResponse!
  updateWorkRecord(input: UpdateWorkRecordInput!): WorkRecordMutationResponse!
  deleteWorkRecord(input: DeleteWorkRecordInput!): WorkRecordMutationResponse!
}
```

#### Frontend State Management
- Use React Hook Form for form state
- Use Zod for validation schema
- Use Apollo Client for GraphQL mutations
- Use optimistic updates for immediate UI feedback
- Toast notifications via sonner (or similar library - needs verification)

#### Validation Rules
**Frontend (Zod Schema):**
```typescript
const workRecordSchema = z.object({
  date: z.date(),
  absenceTypeId: z.string().min(1, "Absence type is required"),
  projectId: z.string().min(1, "Project is required"),
  productivityTypeId: z.string().min(1, "Productivity type is required"),
  workTypeId: z.string().min(1, "Work type is required"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  km: z.number().min(0, "KM must be >= 0").optional(),
  isTripFlag: z.boolean().optional(),
}).refine((data) => {
  // Validate end time > start time OR overnight allowed
  const start = parseTime(data.startTime);
  const end = parseTime(data.endTime);
  return end >= start || end < start; // Both regular and overnight allowed
}, {
  message: "Invalid time range",
  path: ["endTime"],
});
```

**Backend Validation:**
- DTO class-validator decorators
- Business logic validation in service layer
- Lock status check before any mutation
- Time range validation with overnight support

#### Error Messages
- User-friendly messages in English
- Specific errors:
  - "Cannot create record for locked date"
  - "Cannot edit locked record"
  - "Cannot delete locked record"
  - "End time must be after start time or indicate overnight shift"
  - "Description cannot exceed 500 characters"
  - "KM must be a positive number"
  - "Employee not found"
  - "Record not found"
  - "Database error occurred"

### Implementation Files to Create/Modify

#### Backend (NestJS)
**New Files:**
1. `/backend/src/work-records/dto/create-work-record.input.ts`
2. `/backend/src/work-records/dto/update-work-record.input.ts`
3. `/backend/src/work-records/dto/delete-work-record.input.ts`
4. `/backend/src/work-records/entities/work-record-mutation-response.entity.ts`

**Modified Files:**
1. `/backend/src/work-records/work-records.service.ts` - Add create, update, delete methods
2. `/backend/src/work-records/work-records.resolver.ts` - Add mutation resolvers
3. `/backend/src/work-records/work-record.resolver.ts` - Add field resolvers if needed

**New Utilities (if needed):**
1. `/backend/src/work-records/utils/workday-calculator.ts` - Next workday with Slovak holidays
2. `/backend/src/work-records/utils/validation-helpers.ts` - Time validation, lock checks

#### Frontend (Next.js)
**New Files:**
1. `/frontend/src/components/work-record-dialog.tsx` - Reusable dialog for Create/Edit
2. `/frontend/src/components/delete-work-record-dialog.tsx` - Delete confirmation dialog
3. `/frontend/src/components/work-record-form.tsx` - Form component with all fields
4. `/frontend/src/hooks/use-create-work-record.ts` - GraphQL mutation hook
5. `/frontend/src/hooks/use-update-work-record.ts` - GraphQL mutation hook
6. `/frontend/src/hooks/use-delete-work-record.ts` - GraphQL mutation hook
7. `/frontend/src/lib/validations/work-record-schema.ts` - Zod validation schema
8. `/frontend/src/graphql/mutations/work-records.ts` - GraphQL mutation definitions

**Modified Files:**
1. `/frontend/src/components/work-records-table.tsx` - Add Edit/Delete action buttons (conditional on lock status)
2. `/frontend/src/app/work-records/page.tsx` - Add "Add Entry" button and dialog state management

**UI Components (may need new):**
1. Time picker component (extend existing DatePicker or create new)
2. Toast provider setup (if not already present)

### Testing Considerations
**Backend Tests:**
- Unit tests for service methods (create, update, delete)
- Integration tests for GraphQL mutations
- Test lock validation
- Test overnight shift validation
- Test time increment rounding
- Test dynamic table name construction
- Test Slovak holiday awareness

**Frontend Tests:**
- Component tests for dialogs
- Form validation tests
- Integration tests for mutation flows
- Mock GraphQL responses
- Test toast notifications
- Test optimistic updates

### Documentation Needed
- Update API documentation with new mutations
- Add usage examples for work record CRUD
- Document validation rules
- Document lock mechanism for developers

### Performance Considerations
- Use optimistic updates for immediate UI feedback
- Cache catalog data (projects, absence types, etc.) in Apollo Client
- Debounce form validation
- Lazy load dialog components
- Index per-user tables for fast queries on StartDate

### Accessibility Requirements
- Keyboard navigation in dialogs
- ARIA labels for all form fields
- Focus management (focus first field on dialog open)
- Error messages announced to screen readers
- Toast notifications accessible

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Time input with 30-minute steps support
- Date picker fallback for older browsers

---

## Implementation Priority

### Priority 1 (Highest)
1. Backend: Create mutation with validation
2. Backend: Update mutation with lock checks
3. Backend: Delete mutation with lock checks
4. Frontend: Work record dialog component (shared for create/edit)
5. Frontend: Create mutation hook and integration

### Priority 2
1. Frontend: Update mutation hook and integration
2. Frontend: Delete confirmation dialog and mutation hook
3. Frontend: Time picker with 30-minute increments
4. Frontend: Next workday calculation UI

### Priority 3
1. Backend: Next workday calculator with Slovak holidays
2. Frontend: "Keep same date" checkbox logic
3. Frontend: Last-used field defaults
4. Frontend: Overnight shift helper text
5. Toast notifications setup

### Priority 4 (Polish)
1. Validation error messages refinement
2. Loading states and spinners
3. Accessibility improvements
4. Integration tests
5. Documentation

---

## Critical Success Factors

1. **Lock enforcement**: Must prevent editing/deleting locked records
2. **Data integrity**: Mutations must write to correct per-user table
3. **Validation**: All business rules enforced on backend
4. **User experience**: Immediate feedback (toast + table update)
5. **Overnight shifts**: Correctly handled in both UI and backend
6. **Slovak holidays**: Next workday calculation accurate
7. **Time increments**: 30-minute steps enforced consistently

---

## Questions for Spec Writer

1. **Toast library**: Verify if sonner or similar is already installed, or choose one
2. **Time picker**: Confirm approach - extend DatePicker, use native input with step, or create custom component
3. **Last-used defaults**: Where to store user's last selections? (Local storage, backend user preferences table, or always query latest record?)
4. **Error handling**: Should validation errors show inline (per field) AND in toast, or just inline?
5. **Loading states**: Should dialog show spinner during save, or disable save button?
6. **Employee ID**: Where does the current user's employeeId come from? (Auth context, session, hardcoded for now?)
7. **Optimistic updates**: Should we use Apollo optimistic updates or just refetch after mutation?

---

*Requirements gathered: 2025-11-07*
*Ready for spec writing and implementation planning*
