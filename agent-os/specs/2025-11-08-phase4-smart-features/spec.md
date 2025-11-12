# Specification: Phase 4 - Smart Features & Usability

## Goal
Enhance the work records feature with copy and export capabilities to streamline daily time tracking operations.

## User Stories
- As a user, I want to copy existing work records to quickly create similar entries for new dates without re-entering all fields
- As a user, I want to export my work records to CSV format so I can analyze or share my time tracking data externally

## Specific Requirements

**Record Copy Feature - Reuse Existing Dialog**
- Add CopyPlus icon (from lucide-react) to Actions column in work records table alongside Edit and Delete icons
- Icon enabled for ALL records (locked and unlocked) - copying locked records is allowed
- On click, open existing Add Entry dialog (`WorkRecordDialog` component in create mode)
- Pre-fill ALL form fields with data from selected record: project, absence type, productivity type, work type, start time, end time, description, km, trip flag
- Date field pre-filled with next working day using existing `GET_NEXT_WORKDAY` query logic
- User can freely edit all fields before saving (standard Add Entry behavior)
- Submit uses existing `createWorkRecord` mutation with standard validation

**Duplicate Record Validation**
- Before saving copied record, validate that an EXACT duplicate does not exist
- ALL fields must match for duplicate detection: employeeId, date, absenceTypeId, projectId, productivityTypeId, workTypeId, startTime, endTime, description, km, isTripFlag
- If duplicate found, reject creation and show toast warning: "This record already exists"
- Validation performed on backend before insertion

**Locked Date Validation**
- Validate selected date is not within locked date range (ZamknuteK field)
- Allow user to select any date in date picker (no restrictions on UI)
- On submit, if date is locked, reject creation and show toast warning: "Cannot create record for locked date"
- Validation performed on backend using existing lock date logic

**Success Handling for Copy**
- Use existing toast notification system (`sonner`)
- Show "Work record created successfully" on successful copy
- Table automatically refreshes via existing refetch logic
- Dialog closes automatically after successful save

**CSV Export Button Placement**
- Add "Export CSV" button to LEFT of screen, immediately RIGHT of "Add Entry" button
- Use Download or FileDown icon from lucide-react
- Button styling matches existing "Add Entry" button pattern
- Button always visible when records are displayed

**CSV Export Data Handling**
- Export ONLY currently filtered/visible records (respects all active filters)
- Use frontend-only generation - no backend GraphQL mutation needed
- Generate CSV from already-fetched `filteredRecords` array
- NO additional backend API calls required

**CSV Format Specification**
- Columns match work records table exactly: Date, Absence, Project, Productivity, Work Type, Start, End, Hours, Description, KM, Trip, Lock
- Date format: YYYY-MM-DD (ISO standard)
- Time format: HH:MM (24-hour, truncate seconds)
- Boolean fields: TRUE/FALSE (Trip, Lock)
- Null values: empty string
- Include header row with column names

**CSV Filename Generation**
- Pattern: `work-records-{employee-name}-{start-date}-to-{end-date}.csv`
- Example: `work-records-milan-smotlak-2025-11-01-to-2025-11-30.csv`
- Employee name from selected employee (lowercase, replace spaces with hyphens)
- Dates from current filter (always present in this phase)
- Trigger automatic browser download using Blob/URL.createObjectURL

**Error Handling**
- Toast error if CSV generation fails: "Failed to export CSV. Please try again."
- Toast warning for duplicate record: "This record already exists"
- Toast warning for locked date: "Cannot create record for locked date"
- Console logging for debugging errors
- Keep dialogs open on error for user correction

**UI Consistency**
- Match existing icon sizing in Actions column (h-4 w-4)
- Use existing Button component with ghost variant for action icons
- Follow existing color and spacing patterns
- Maintain responsive table layout
- Use existing toast notification styling

## Existing Code to Leverage

**`/Users/miro/Projects/dochadzkovy-system/frontend/src/components/work-record-dialog.tsx`**
- Complete reuse for copy feature - supports both create and edit modes
- Already implements next working day calculation via GET_NEXT_WORKDAY query
- Pre-fills form with last record data in create mode (lines 88-151)
- Handles form submission, validation, and success/error toasts
- Can pass `initialData` prop to pre-fill with copied record data instead of last record

**`/Users/miro/Projects/dochadzkovy-system/frontend/src/components/work-records-table.tsx`**
- Actions column pattern with Edit (Pencil) and Delete (Trash2) icons (lines 217-242)
- Add CopyPlus icon using same Button pattern with ghost variant
- Icon placement and sizing already established (h-4 w-4 classes)
- Conditional rendering based on lock status can be adapted for copy
- Use existing `onEdit` callback pattern to create `onCopy` handler

**`/Users/miro/Projects/dochadzkovy-system/frontend/src/app/work-records/page.tsx`**
- Export button placement near Add Entry button (line 546)
- Use existing `filteredRecords` array for CSV data (line 292)
- Employee name available from `selectedEmployeeId` state
- Date range available from `filters.fromDate` and `filters.toDate`
- Toast notification system already imported (sonner)

**`/Users/miro/Projects/dochadzkovy-system/frontend/src/hooks/use-create-work-record.ts`**
- Existing hook for work record creation mutation
- Automatically refetches GET_WORK_RECORDS and GET_NEXT_WORKDAY after creation
- Handles loading and error states
- Reuse directly for copy feature submission

**`/Users/miro/Projects/dochadzkovy-system/frontend/src/graphql/queries/work-records.ts`**
- GET_NEXT_WORKDAY query (lines 46-50) already implemented and tested
- WorkRecord interface (lines 93-108) defines all fields for CSV columns
- All necessary types and queries already available

## Out of Scope
- Bulk copy to multiple dates
- Copy multiple records at once
- Backend CSV generation endpoint
- CSV import functionality
- Custom CSV column selection
- CSV format customization options
- Scheduled or automated exports
- Email CSV functionality
- New validation rules beyond existing patterns
- Modifications to existing validation logic
