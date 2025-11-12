# Phase 4: Smart Features & Usability - Implementation Context

This document provides comprehensive context for implementing Phase 4 features. It captures all key decisions, clarifications, and context from the requirements gathering session.

## Project Overview

### Tech Stack
- **Backend:** NestJS with GraphQL API
- **Frontend:** Next.js 14+ with TypeScript, App Router
- **UI Framework:** TailwindCSS + shadcn/ui components
- **Database:** PostgreSQL with existing fixed schema
- **ORM:** Prisma (or Drizzle, check project)
- **State Management:** React hooks, possibly Zustand
- **Form Handling:** React Hook Form with Zod validation
- **Icons:** lucide-react

### Project Structure
```
dochadzkovy-system/
├── apps/
│   ├── backend/          # NestJS GraphQL API
│   └── frontend/         # Next.js 14+ app
├── shadcn-cheatsheet/    # Reference repo with all shadcn components
└── agent-os/
    └── specs/
        ├── 2025-11-05-work-records-read-display/  # Phase 2/3 reference
        └── 2025-11-08-phase4-smart-features/      # Current spec
```

## Previous Phase Implementations

### Phase 1: Foundation
- Employee overview screen
- GraphQL API setup
- Next.js frontend foundation
- Database connection

### Phase 2: Work Records Read & Display
- Work records table with columns: Date, Absence, Project, Productivity, Work Type, Start, End, Hours, Description, KM, Trip, Lock
- Date range filtering (from/to dates)
- Search and filter functionality
- Actions column with Edit (pencil) and Delete (trash) icons
- Record count display
- Responsive table design

### Phase 3: Work Records CRUD Operations
- **Add Entry dialog:** Full form with all fields, validation, next working day pre-fill
- **Edit dialog:** Modify existing records with validation
- **Delete dialog:** Confirmation before deletion
- **Toast notifications:** Success/error feedback system
- **Validation:** Duplicate detection, locked date validation
- **Next working day calculation:** Already implemented and working in Add Entry dialog

### Key Existing Components (Reuse These!)
- `WorkRecordDialog` - The Add Entry / Edit dialog component
- `WorkRecordsTable` - Main table with Actions column
- `useCreateWorkRecord` - Hook for creating work records
- Toast/Toaster - Notification system (already working)
- Date picker components - Used in filters and dialogs

## Phase 4: What We're Building

Two features with **maximum code reuse**:

### Feature 1: Record Copy (SIMPLIFIED APPROACH)
**Priority:** M (Medium)

### Feature 2: CSV Export
**Priority:** S (Small)

### What's Already Done (DO NOT IMPLEMENT)
- ✅ Item #13: Next Workday Suggestion - **FULLY IMPLEMENTED, TESTED, AND WORKING**
- ✅ Next working day calculation logic
- ✅ Add Entry dialog with all fields and validation
- ✅ Toast notification system
- ✅ Duplicate validation patterns
- ✅ Locked date validation

## Feature 1: Record Copy - Detailed Requirements

### Critical Implementation Approach

**THIS IS NOT A NEW DIALOG!** The copy feature reuses the existing "Add Entry" dialog.

User's exact words:
> "To my mind this copy feature can be done very easily. When I click on the CopyPlus button our already working dialog (which opens after I click 'Add Entry') should be displayed with data pre-filled from clicked record that we want to copy. The day should be shown as next work day as we are already doing when clicking 'Add Entry' button. In this way user can easily click save button and copied entry is added to table with new date. We just want to reuse 'Add Entry' functionality but pre-filled data on init of the dialog will be from record that we want to copy."

### UI Requirements

1. **CopyPlus Icon in Actions Column**
   - Add "CopyPlus" icon from lucide-react
   - Position: Actions column, alongside Edit (pencil) and Delete (trash) icons
   - State: **ALWAYS ENABLED** (even for locked records - copying locked records IS allowed)
   - Visual style: Should match existing action icons

2. **Dialog Behavior**
   - Click CopyPlus → Opens existing "Add Entry" dialog
   - Pre-fill ALL fields from selected record:
     - Project
     - Absence type
     - Productivity type
     - Work type
     - Start time
     - End time
     - Description
     - KM (kilometers)
     - Trip flag
   - **Date field:** Pre-fill with "next working day" (this calculation is ALREADY IMPLEMENTED - reuse it!)
   - User can freely edit ALL fields before saving
   - Submit uses existing save logic (no new mutation needed)

### Validation Requirements

#### 1. Duplicate Detection
- Check if an IDENTICAL record already exists
- **"Identical" means ALL fields match:**
  - Same date
  - Same project
  - Same absence type
  - Same productivity type
  - Same work type
  - Same start time
  - Same end time
  - Same description (exact match)
  - Same KM value
  - Same trip flag
- If duplicate exists: **Reject creation** and show toast warning
- Rejection toast should use existing toast system

#### 2. Locked Date Validation
- Validate that selected date is NOT in locked date range
- Example: If dates are locked up to Aug 31 2025:
  - User CANNOT create record for Aug 21 2025 (falls in locked range)
  - User CAN create record for Sep 1 2025 or later
- **Implementation approach:**
  - Do NOT prevent date selection in picker (let user select any date)
  - Validate on save attempt
  - If locked date selected: Show warning that record won't be created
  - Then show rejection toast when creation is rejected
- Check both:
  - Per-record Lock flag
  - Employee's ZamknuteK (locked until) date

### Success Handling
- Toast notification already exists for successful creation
- No changes needed to existing success flow
- Table should automatically refresh to show new entry

### Scope Boundaries
- ❌ NO bulk copy to multiple dates
- ❌ NO separate copy dialog
- ❌ NO new GraphQL mutations
- ✅ Single record copy only
- ✅ Reuse existing Add Entry dialog
- ✅ Reuse existing validation logic

## Feature 2: CSV Export - Detailed Requirements

### UI Requirements

1. **Export Button Placement**
   - Position: **LEFT side** of screen, **RIGHT of "Add Entry" button**
   - User's exact specification: "Left side of the screen, right to 'Add Entry' button"
   - Icon: Use `Download` or `FileDown` from lucide-react
   - Button text: "Export CSV" or just icon (check existing button patterns)

2. **Button Behavior**
   - Click → Immediately generate and download CSV file
   - No dialog or confirmation needed
   - Should be enabled whenever table has data

### Export Behavior

1. **Data Source**
   - Export from **already-fetched filtered records** (client-side data)
   - Frontend-only implementation - NO backend GraphQL mutation needed
   - User's exact words: "Do it on frontend side from already-fetched filtered records client-side"

2. **Filter Respect**
   - Export **ONLY** filtered/visible records
   - Respect ALL active filters:
     - Date range filter (from/to dates)
     - Search text filter
     - Selected projects filter
     - Absence types filter
     - Lock status filter
     - Trip flag filter
   - User's exact words: "the export respect ALL active filters (so users only export what they see)"

### CSV Format Specifications

1. **Columns**
   - Must exactly match the work records table display
   - Expected columns: Date, Absence, Project, Productivity, Work Type, Start, End, Hours, Description, KM, Trip, Lock
   - Column order should match table order

2. **Data Formatting**
   - **Date format:** `YYYY-MM-DD`
   - **Time format:** `HH:MM` (not HH:MM:SS)
   - **Boolean fields (Trip, Lock):** `TRUE/FALSE` (not Yes/No or 1/0)
   - **Numbers (Hours, KM):** Standard number format (e.g., 8.5, 12.75)
   - **Text fields (Description):** Properly escaped for CSV (handle commas, quotes, newlines)

3. **CSV Structure**
   - First row: Column headers
   - Subsequent rows: Data
   - Encoding: UTF-8 (to support special characters like č, š, ž)
   - Line endings: Standard CSV (CRLF or LF)

### Filename Generation

1. **Pattern**
   ```
   work-records-{employee-name}-{start-date}-to-{end-date}.csv
   ```

2. **Example**
   ```
   work-records-milan-smotlak-2025-11-01-to-2025-11-30.csv
   ```

3. **Rules**
   - Employee name: Lowercase, hyphenated (e.g., "milan-smotlak")
   - Start date: From date range filter, format YYYY-MM-DD
   - End date: To date range filter, format YYYY-MM-DD
   - User note: "There is always date filter, so those cases should not be possible" (no need to handle "all dates" case)

4. **Employee Name Source**
   - When admin viewing another employee's records: Use that employee's name
   - When employee viewing own records: Use their own name
   - Get from current context (likely stored in app state or user session)

### Technical Implementation Notes

1. **CSV Generation Approaches**
   - Option A: Use library like `papaparse` or `csv-stringify`
   - Option B: Manual CSV generation with proper escaping
   - Choose based on what's already in project dependencies

2. **Browser Download**
   - Create Blob with CSV content
   - Create temporary download link
   - Trigger download programmatically
   - Clean up temporary resources

3. **Performance Considerations**
   - Should handle 100s of records without issue
   - Records already fetched, so no additional API call
   - CSV generation is fast (milliseconds for typical datasets)

### Scope Boundaries
- ❌ NO CSV import functionality
- ❌ NO custom format options (Excel, JSON, etc.)
- ❌ NO column selection/customization
- ❌ NO backend export endpoint
- ✅ Frontend-only generation
- ✅ Standard CSV format only
- ✅ All columns, fixed format

## Design & UX Patterns to Follow

### Existing Design Reference
- Mockups available at: `/Users/miro/Projects/dochadzkovy-system/agent-os/specs/2025-11-05-work-records-read-display/planning/visuals/`
- These are **already implemented** in the app
- **Maintain consistent design style** with existing implementation

### Component Library Reference
- Path: `/Users/miro/Projects/dochadzkovy-system/shadcn-cheatsheet`
- Contains working examples of all shadcn/ui components
- Copy and adapt components as needed
- Do NOT reinvent components - reuse from this reference

### UI/UX Consistency
- Action icons should match existing style (pencil, trash)
- Buttons should follow existing button patterns
- Dialogs should use existing dialog styling
- Toast notifications should use existing toast styling
- Colors, spacing, typography should match existing patterns

## Database Schema Notes

### Work Records Table Structure
Key fields (refer to actual schema for complete list):
- `Datum` (Date) - Record date
- `Projekt` (Project) - Foreign key to projects
- `NeprítomnosťTyp` (Absence Type) - Foreign key
- `VýkonnosťTyp` (Productivity Type) - Foreign key
- `PrácaTyp` (Work Type) - Foreign key
- `Od` (Start) - Start time
- `Do` (End) - End time
- `Popis` (Description) - Text description
- `Km` - Kilometers driven
- `Cesta` (Trip) - Boolean trip flag
- `Zámok` (Lock) - Boolean lock flag
- Employee reference - Links to employee (Zamestnanec table)
- `ZamknuteK` - Locked until date (on employee record)

### Important Schema Constraints
- Database schema is **fixed and cannot be modified**
- Slovak language field names (use existing GraphQL types)
- Relationships already established
- Constraints and validations already in place

## Testing Approach

### User Profile
- Non-technical users
- Will test in browser (not running automated tests themselves)
- Need clear visual feedback
- Expect intuitive UI

### Testing Strategy
- **During development:** 2-8 tests per task group
- **Gap filling:** Maximum 5 additional tests
- **Total expected:** 15-40 tests for entire phase
- **Test runs:** Feature-specific (not entire suite each time)

### Key Test Scenarios

#### Record Copy Feature
1. Copy a simple record with all fields populated
2. Copy a record, modify fields before saving
3. Try to create duplicate (should reject)
4. Try to copy to a locked date (should reject)
5. Copy from a locked record (should succeed)
6. Verify next working day calculation
7. Verify toast notifications appear correctly

#### CSV Export Feature
1. Export with all records visible
2. Export with date range filter applied
3. Export with search filter applied
4. Verify CSV format (columns, data types)
5. Verify filename includes employee name and dates
6. Verify boolean fields show TRUE/FALSE
7. Verify date/time formatting
8. Test with special characters in description

## Code Organization & Conventions

### File Structure (Typical Next.js + NestJS)
```
apps/
├── backend/
│   ├── src/
│   │   ├── work-records/
│   │   │   ├── work-records.resolver.ts
│   │   │   ├── work-records.service.ts
│   │   │   └── dto/
│   │   └── employees/
│   └── test/
└── frontend/
    ├── app/
    │   └── (authenticated)/
    │       └── work-records/
    │           └── page.tsx
    ├── components/
    │   ├── ui/              # shadcn components
    │   └── work-records/    # Feature-specific components
    ├── lib/
    │   ├── graphql/
    │   └── utils/
    └── hooks/
```

### Naming Conventions
- **Components:** PascalCase (e.g., `WorkRecordDialog`)
- **Files:** kebab-case (e.g., `work-record-dialog.tsx`)
- **Hooks:** camelCase with 'use' prefix (e.g., `useCreateWorkRecord`)
- **GraphQL:** UPPER_SNAKE_CASE for queries/mutations (e.g., `CREATE_WORK_RECORD`)

### TypeScript Conventions
- Use interfaces for data structures
- Use type for unions/intersections
- Avoid `any` - use proper types
- Use Zod schemas for validation

### Code Style
- Use Prettier for formatting (likely already configured)
- ESLint for linting (likely already configured)
- Functional components with hooks (not class components)
- Destructure props
- Use const over let when possible

## Important Gotchas & Reminders

### DO NOT
- ❌ Create new dialogs - reuse existing Add Entry dialog
- ❌ Create new GraphQL mutations for copy feature
- ❌ Implement next working day calculation (already exists)
- ❌ Create new toast system (already exists)
- ❌ Prevent locked records from being copied (they CAN be copied)
- ❌ Prevent date selection in date picker (validate on submit)
- ❌ Create backend CSV export endpoint (frontend only)
- ❌ Include Item #13 (Next Workday Suggestion - already done)

### DO
- ✅ Reuse WorkRecordDialog for copy feature
- ✅ Pre-fill dialog with data from selected record
- ✅ Reuse existing next working day logic
- ✅ Reuse existing toast notification system
- ✅ Allow locked records to be copied
- ✅ Validate duplicate detection on ALL fields
- ✅ Validate locked date range on submission
- ✅ Generate CSV on frontend from filtered records
- ✅ Follow existing design patterns
- ✅ Use shadcn components from reference repo

### Critical Success Factors
1. **Maximum code reuse** - Don't reinvent what exists
2. **Simple implementation** - Both features are straightforward
3. **Consistent UX** - Match existing patterns
4. **Proper validation** - Duplicate and locked date checks
5. **Clear feedback** - Toast notifications for all actions

## Questions to Resolve During Implementation

If you encounter ambiguity, refer to these clarifications:

### Copy Feature
- **Q:** Should copy icon be disabled for locked records?
  - **A:** NO - enabled even for locked records

- **Q:** Can users edit fields before copying?
  - **A:** YES - full editing allowed before save

- **Q:** Multiple date selection for bulk copy?
  - **A:** NO - single record copy only

- **Q:** New dialog for copy?
  - **A:** NO - reuse existing Add Entry dialog

### CSV Export
- **Q:** Backend or frontend generation?
  - **A:** Frontend only, from already-fetched records

- **Q:** Export all or filtered records?
  - **A:** Filtered records only (what user sees)

- **Q:** Custom format options?
  - **A:** NO - standard CSV only

## Success Criteria

### Record Copy Feature
- [ ] CopyPlus icon visible in Actions column
- [ ] Icon enabled for all records (including locked)
- [ ] Clicking icon opens Add Entry dialog with pre-filled data
- [ ] Date defaults to next working day
- [ ] All fields editable before saving
- [ ] Duplicate validation rejects exact matches
- [ ] Locked date validation rejects out-of-range dates
- [ ] Toast notifications show success/error
- [ ] Table refreshes to show new entry

### CSV Export Feature
- [ ] Export button visible next to "Add Entry" button
- [ ] Clicking button downloads CSV file immediately
- [ ] CSV contains only filtered/visible records
- [ ] CSV columns match table exactly
- [ ] Date format: YYYY-MM-DD
- [ ] Time format: HH:MM
- [ ] Boolean format: TRUE/FALSE
- [ ] Filename includes employee name and date range
- [ ] Special characters handled correctly
- [ ] UTF-8 encoding for Slovak characters

## Ready to Implement!

All requirements are clear and documented. The implementation should be straightforward given the extensive existing infrastructure. Focus on code reuse and maintaining consistency with existing patterns.

**Key files to reference during implementation:**
1. `spec.md` - Detailed specification
2. `tasks.md` - Implementation task breakdown
3. `planning/requirements.md` - Original requirements
4. `/shadcn-cheatsheet` - Component reference
5. Existing work records components - Pattern reference

Good luck with the implementation! 🚀
