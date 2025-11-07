# Specification: Work Records CRUD Operations

## Goal
Enable users to create, update, and delete work records through browser-based dialogs with comprehensive validation, lock enforcement, and Slovak business rules support (overnight shifts, workday calculation with holidays).

## User Stories
- As a user, I want to add new work entries through a dialog form so that I can track my daily work without using the legacy desktop app
- As a user, I want to edit existing unlocked work entries so that I can correct mistakes or update details
- As a user, I want to delete unlocked work entries with confirmation so that I can remove incorrect entries

## Specific Requirements

**Create Work Record Dialog**
- Dialog triggered by "Add Entry" button on work records page with title "Add Work Entry"
- Date field pre-fills with next workday (skipping weekends and Slovak holidays from Holidays table)
- Checkbox "Keep same date as previous entry" allows users to add multiple entries for same day
- All dropdowns populated from catalog queries (absence types, active projects, productivity types, work types)
- Time pickers enforce 30-minute increments (08:00, 08:30, 09:00, etc.) with automatic rounding of invalid inputs
- Required fields: date, absence type, project, productivity type, work type, start time, end time
- Optional fields: description (max 500 chars), km (min 0, default 0), trip flag checkbox
- Save button submits mutation, Cancel button closes dialog without changes

**Update Work Record Dialog**
- Dialog triggered by pencil icon on unlocked table rows with title "Edit Work Entry"
- Pre-fills all fields with existing record values
- Same validation and field requirements as Create dialog
- Edit/delete icons hidden for locked records (Lock=true OR StartDate <= employee.ZamknuteK)
- Save button submits update mutation, Cancel closes without changes

**Delete Work Record Confirmation**
- Dialog triggered by trash icon on unlocked table rows with title "Delete Work Entry"
- Shows confirmation message with record summary: "Are you sure you want to delete this work entry? Date: {date}, Project: {project}, Hours: {hours}"
- Delete button (destructive styling) submits deletion, Cancel closes without action
- Delete icon hidden for locked records

**Overnight Shift Detection**
- When end time is before start time (e.g., 22:00 to 06:00), display helper text "This is an overnight shift (adds 24 hours)"
- Backend calculates hours correctly by adding 24 hours to end time before subtraction
- Frontend shows moon icon in table for overnight shifts

**Time Increment Enforcement**
- Use HTML input type="time" with step="1800" (30 minutes) for browser-native support
- Implement client-side rounding function to nearest 30-minute interval if user types invalid time
- Backend validates time format is HH:MM or HH:MM:SS

**Lock Mechanism Validation**
- Backend checks two conditions before allowing create/update/delete: Record.Lock must be false AND Record.StartDate > employee.ZamknuteK
- Frontend conditionally renders edit/delete buttons based on isLocked field from query
- Error responses: 403 "Cannot create record for locked date", "Cannot edit locked record", "Cannot delete locked record"

**Next Workday Calculation**
- Backend utility queries Holidays table for dates between last record and today
- Skip Saturdays (weekday 6), Sundays (weekday 0), and dates present in Holidays table
- Return next valid workday as Date object for form pre-fill
- Checkbox override allows keeping same date for multiple entries same day

**Field Validation Rules**
- End time >= Start time OR allow overnight (end < start with helper text)
- KM field accepts only non-negative integers
- Description limited to 500 characters with counter
- All required fields validated before submission (client-side with Zod, server-side with class-validator)

**User Feedback**
- Success: Toast notification ("Work record created/updated/deleted successfully") AND immediate table refetch
- Error: Toast notification with specific error message AND keep dialog open for correction
- Loading states: Disable save button and show spinner during mutation execution

**GraphQL Mutations**
- createWorkRecord: accepts CreateWorkRecordInput with employeeId and all form fields, returns WorkRecordMutationResponse with success flag, message, and created record
- updateWorkRecord: accepts UpdateWorkRecordInput with recordId, employeeId, and partial field updates, returns WorkRecordMutationResponse
- deleteWorkRecord: accepts recordId and employeeId, returns WorkRecordMutationResponse with success boolean

## Visual Design

No mockup files provided in planning/visuals folder. Reference existing Phase 2 table UI and shadcn dialog components for consistent styling. If posible copy shadcn components from `/Users/miro/Projects/dochadzkovy-system/shadcn-cheatsheet` and build UI using those examples.

## Existing Code to Leverage

**Backend Service Patterns**
- constructTableName() from normalize-table-name.ts constructs dynamic per-user table names (t_FirstName_LastName with diacritic removal)
- calculateHours() and isOvernightShift() from time-calculations.ts handle time arithmetic and overnight detection
- Work records service uses $queryRawUnsafe for dynamic table queries with proper LEFT JOINs for catalog tables
- Lock validation pattern already implemented in getWorkRecords() compares Lock flag and ZamknuteK date
- Error handling follows NestJS patterns with NotFoundException, BadRequestException, ForbiddenException

**Frontend Table Component**
- work-records-table.tsx displays records with sorting, formatting, lock icons, and overnight shift moon icons
- Already shows isLocked field visually with opacity-50 styling and cursor-not-allowed
- formatDate() and formatTime() utilities for consistent display
- Add action column with conditional rendering of edit/delete buttons based on isLocked prop

**UI Component Library**
- Dialog components (Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle) from @/components/ui/dialog.tsx
- Form components from React Hook Form with Zod validation schema
- DatePicker from @/components/ui/date-picker.tsx
- Select, Input, Checkbox, Button components already exist
- Badge component for trip flag display

**GraphQL Infrastructure**
- Apollo Client already configured for frontend with cache and error handling
- Backend resolver pattern established in work-records.resolver.ts with @Query and @Args decorators
- Existing queries for catalog data: getActiveProjects, getAbsenceTypes, getProductivityTypes, getWorkTypes

**Database Schema**
- Per-user tables follow t_{FirstName}_{LastName} convention with fields: ID, CinnostTypID, StartDate, ProjectID, HourTypeID, HourTypesID, StartTime, EndTime, Description, km, Lock, DlhodobaSC
- Holidays table with single column Den (DateTime Date) for Slovak public holidays
- Zamestnanci table with Meno, Priezvisko, ZamknuteK fields for employee data and lock dates

## Out of Scope
- CSV export functionality (Phase 4, Item 15)
- Record copy feature for duplicating entries to multiple dates (Phase 4, Item 14)
- Advanced next workday UI hints and suggestions (Phase 4, Item 13 - basic logic implemented, advanced UI deferred)
- Authentication and role-based access control (Phase 11, Items 34-36)
- Bilingual Slovak/English support (Phase 12, Item 37)
- Automatic overnight overtime calculation (Phase 12, Item 41)
- Mobile responsive optimizations (Phase 12, Item 39)
- Advanced error boundaries and loading skeletons (Phase 12, Item 38)
- Performance optimizations like pagination and lazy loading (Phase 12, Item 40)
- E2E testing suite (Phase 13, Item 42)
