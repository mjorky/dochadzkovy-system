# Spec Requirements: Work Records - Read & Display

## Initial Description
Implement Phase 2 from the roadmap (items 6-8):

### Item 6: Work Records Read Query
Create GraphQL query that reads from per-user tables (t_{Name}_{Surname}), joins with Projects, CinnostTyp, HourType, HourTypes catalog tables, calculates hours (including overnight spans), and returns formatted work records.

### Item 7: Data Screen - Table Display
Build "Data" screen with table showing work records: date, absence type, project, productivity type, work type, start time, end time, hours, description, km, trip flag. Default filter: last 31 days. Display lock icon for locked records.

### Item 8: Date Range Filter
Add date picker filter (from date, to date) above table with "Last 31 days" default and "Show whole month" checkbox toggle that expands to full calendar month of start date. Filter updates table without page reload.

### Additional Requirements
User wants advanced filtering capabilities for the work records table beyond basic date range filtering.

## Requirements Discussion

### First Round Questions

**Q1: Column Display Requirements**
What columns should be displayed in the work records table?

**Answer:** Display all columns from per-user tables.Only calculated colum should be Hours from EndTime and StartTime. This is not part of the table.

**Q2: Overnight Shift Indicator**
How should the system indicate overnight shifts (where EndTime < StartTime)?

**Answer:** Calculate hours (EndTime - StartTime, +24h if overnight), show moon icon for overnight shifts

**Q3: Locked Row Visual Treatment**
How should locked work records be visually distinguished in the table?

**Answer:** Grayed out entire row + lock icon to signal read-only

**Q4: Column Sorting**
Which columns should be sortable, and what should be the default sort order?

**Answer:** All columns sortable, default sort by date (oldest first)

**Q5: Pagination Strategy**
How should pagination work for large record sets?

**Answer:** Use infinite scroll (load more as user scrolls down)

**Q6: Advanced Filtering Requirements**
What advanced filters should be available beyond date range?

**Answer:** Project, Absence Type, Productivity Type, Work Type, Lock Status (locked/unlocked/all), Trip Flag (yes/no/all) - all multi-select dropdowns

**Q7: Search Functionality**
Should there be a text search box? If yes, which fields should it search?

**Answer:** Real-time search-as-you-type for Description field, with "X" clear button (same as Employees screen)

**Q8: Filter Persistence**
Should filter selections persist when user navigates away and returns?

**Answer:** Reset to defaults on page load

**Q9: Clear Filters Feature**
Should there be a way to clear all filters at once?

**Answer:** "Clear all filters" button + ability to remove individual filter chips

**Q10: Maximum Shift Length**
What's the maximum allowed work shift duration (for validation)?

**Answer:** 24 hours maximum

**Q11: Hours Format**
How should hours be displayed? (e.g., decimal 8.5 vs time format 8:30)

**Answer:** Decimal (8.5)

**Q12: Mandatory Fields Clarification**
Which fields are mandatory for a work record to exist? (affects NULL handling)

**Answer:** Date, StartTime/EndTime, Absence Type, Project, Productivity type, Work type are all mandatory (record cannot be created without them)

**Q13: Default View - User Context**
Should managers/admins see their own records by default, or all records?

**Answer:** Managers/admins see their own records by default + employee selector dropdown to view others

**Q14: Show Whole Month Implementation**
Should "show whole month" be a checkbox that auto-expands the date range, or a separate button action?

**Answer:** Must be implemented (expand date range to full calendar month)

**Q15: Row Actions**
Are there any row-level actions needed in this phase (edit, delete, copy) or just read-only display?

**Answer:** Hide until Phase 3

**Q16: Expected Data Volume**
Approximately how many records should the table handle efficiently? (affects pagination strategy)

**Answer:** ~60-100 records per month (default view), max ~8000 records per oldest employee (10 years × 254 working days × 3 records/day). Infinite scroll should handle this.

### Follow-Up Clarifications

**Follow-Up Q1: Data Fetching Strategy**
Should we fetch all fields upfront in the GraphQL query (Option A), or fetch summary data first with detail view on row expansion (Option B)?

**Answer:** Option A - Fetch ALL fields upfront in GraphQL query (Date, Project, Description, StartTime, EndTime, Hours, km, Trip Flag, Lock Status, Absence Type, Productivity Type, Work Type). Display everything in table inline.

**Follow-Up Q2: Date Range Picker UI**
Should we use two separate date pickers (from/to) or a single range picker component?

**Answer:** Option A - Two separate date pickers side by side (From: [picker] To: [picker])

**Follow-Up Q3: Absence Records Time Handling**
For absence records without work hours (Vacation, Sick Leave), what should Hours column show? Do they have dummy start/end times?

**Answer:** Absence records (Vacation, Sick Leave, Doctor, etc.) have dummy times 8:00-16:00 for 8 hours. So StartTime/EndTime are truly mandatory for all records, and Hours calculation works the same way.

**Follow-Up Q4: Employee Selector for Managers**
Should employee selector show all employees, or just direct reports for managers? Admin sees all, but manager sees...?

**Answer:** Managers see ALL employees in the company in the dropdown (same as admins). No restriction to direct reports.

**Follow-Up Q5: Multi-Filter Logic**
Should filters apply cumulatively (AND logic between categories, OR within category)?

**Answer:** OR within category, AND between categories
- Example: (Project=A OR Project=B) AND (Type=Productive OR Type=Non-Productive) AND (Locked=Yes)
- Within each filter category (Project, Type, etc.), selections are OR'd
- Between different filter categories, conditions are AND'd

### Existing Code to Reference

**Similar Features Identified:**

The application already has a working Employee Overview screen that demonstrates key patterns we should reuse:

- **Filter Controls Pattern:** `/frontend/src/components/filter-controls.tsx`
  - Real-time search field with "X" clear button (Search icon from lucide-react)
  - Multi-select dropdown filters (Admin Status, Employee Type)
  - Debounced search using `useDeferredValue` hook
  - Clean FilterState interface pattern
  - Proper filter state management

- **Table Component Pattern:** `/frontend/src/components/employee-table.tsx`
  - Column sorting with visual indicators (ChevronUp/ChevronDown icons)
  - Sort direction toggle (asc/desc)
  - Proper TypeScript typing for sortable columns
  - Responsive table layout with shadcn/ui styling
  - Null value handling in sorting logic

- **Page Integration Pattern:** `/frontend/src/app/employees/page.tsx`
  - Apollo Client GraphQL query integration (`useQuery` hook)
  - Client-side filtering with `useMemo` for performance
  - Loading states (Loader2 icon with spinner animation)
  - Error states with retry functionality (XCircle icon)
  - Empty states (Users icon with helpful messaging)
  - Filter count display ("Showing X of Y")

**Additional Technical Details:**
- No existing date picker components found in codebase - will need to add shadcn/ui date picker
- Infinite scroll pattern not yet implemented - will need to implement using intersection observer or similar
- Multi-select dropdown components not yet in codebase - will need to add (possibly shadcn/ui multi-select or custom implementation)

## Visual Assets

### Files Provided:
No visual mockup/wireframe files found.

However, the following theme reference files are available:
- `shadcn-config-file.txt`: shadcn/ui Tangerine theme configuration
- `tweakcn — Theme Generator for shadcn_ui - Cards.html`: Card component examples with Tangerine theme
- `tweakcn — Theme Generator for shadcn_ui - Color Palette.html`: Tangerine color palette reference
- `tweakcn — Theme Generator for shadcn_ui - Dashboard.html`: Dashboard layout with Tangerine theme
- `tweakcn — Theme Generator for shadcn_ui - Mail.html`: Complex layout example
- `tweakcn — Theme Generator for shadcn_ui - Typography.html`: Typography styles for Tangerine theme

### Visual Insights:
- Use shadcn/ui Tangerine theme consistently across all new components
- Follow the established pattern from Employee Overview screen (similar table layout, filter controls positioning)
- Match existing UI patterns: search fields, dropdown selects, table styling, loading/error states

## Requirements Summary

### Functional Requirements

**Core Data Display:**
- Display work records from per-user tables (`t_{FirstName}_{LastName}`)
- Show columns: ID, Date, Absence Type (CinnostTyp), Project, Productivity Type (HourType), Work Type (HourTypes), Start Time, End Time, Hours (calculated), Description, KM, Trip Flag (DlhodobaSC), Lock Status
- Calculate hours correctly including overnight spans (EndTime < StartTime: add 24 hours)
- Display hours in decimal format (e.g., 8.5 hours)
- Default view shows last 31 days of records
- Default sort by Date (oldest first)
- Support sorting on all columns with visual indicators

**Visual Indicators:**
- Moon icon for overnight shifts (EndTime < StartTime)
- Lock icon for locked records (Lock=true or date <= ZamknuteK)
- Gray out entire row for locked records to signal read-only state

**Filtering Capabilities:**
- Date range filter with two separate date pickers (From: [picker] To: [picker])
- "Show whole month" checkbox to expand date range to full calendar month
- Text search box for Description field (real-time search-as-you-type with "X" clear button)
- Multi-select dropdown filters:
  - Project (from Projects table where AllowAssignWorkingHours=true)
  - Absence Type (from CinnostTyp table)
  - Productivity Type (from HourType table)
  - Work Type (from HourTypes table)
  - Lock Status: locked/unlocked/all
  - Trip Flag: yes/no/all
- Filter logic: OR within category, AND between categories
  - Example: (Project=A OR Project=B) AND (Type=Productive OR Type=Non-Productive) AND (Locked=Yes)
- Individual filter chips that can be removed
- "Clear all filters" button
- Filter state resets to defaults on page load (no persistence)

**User Context:**
- Managers/admins see their own records by default
- Employee selector dropdown allows viewing ALL employees' records (for managers/admins)
- Regular employees only see their own records

**Pagination:**
- Infinite scroll implementation (load more records as user scrolls)
- Handle up to ~8000 records per employee efficiently
- Default view typically shows ~60-100 records (one month)

**Data Fetching:**
- Fetch ALL fields upfront in GraphQL query (no row expansion)
- JOIN with catalog tables: Projects, CinnostTyp, HourType, HourTypes
- Include calculated hours field
- GraphQL query from NestJS backend using Prisma ORM

### Reusability Opportunities

**Frontend Components to Reuse:**
- Search field with clear button pattern from `filter-controls.tsx`
- Debounced search using `useDeferredValue` hook
- Column sorting logic and visual indicators from `employee-table.tsx`
- Apollo Client integration patterns from `employees/page.tsx`
- Loading/error/empty state components with lucide-react icons
- shadcn/ui table, button, select components

**Backend Patterns to Reference:**
- GraphQL query pattern for employee data (extend for work records)
- Prisma ORM queries for joining catalog tables
- Field resolvers for computed values (hours calculation)

**New Components Needed:**
- shadcn/ui date picker component (not yet in codebase)
- Multi-select dropdown component (not yet in codebase)
- Infinite scroll implementation using intersection observer
- Filter chips component for active filters
- Moon icon component for overnight indicator
- Employee selector dropdown (for manager/admin view)

### Scope Boundaries

**In Scope:**
- Read-only display of work records table
- All filtering capabilities (date range, advanced filters, text search)
- Column sorting on all fields
- Visual indicators (lock, overnight, grayed rows)
- Infinite scroll pagination
- Employee context switching for managers/admins
- GraphQL query with joined catalog data
- Hours calculation including overnight logic
- Default "last 31 days" filter
- "Show whole month" date expansion
- Responsive table layout with shadcn/ui Tangerine theme

**Out of Scope:**
- Row actions (edit, delete, copy) - deferred to Phase 3
- Creating new work records - deferred to Phase 3
- Work record validation - deferred to Phase 3
- Export to CSV - mentioned in roadmap Phase 4
- Record copying across days - mentioned in roadmap Phase 4
- Next workday suggestion - mentioned in roadmap Phase 4
- Authentication/authorization (already completed in Phase 1)

### Technical Considerations

**Database Schema:**
- Per-user tables: `t_{FirstName}_{LastName}` with columns:
  - ID (BigInt, primary key)
  - CinnostTypID (BigInt, FK to CinnostTyp) - MANDATORY
  - StartDate (DateTime/Date) - MANDATORY
  - ProjectID (BigInt?, FK to Projects) - MANDATORY
  - HourTypeID (BigInt?, FK to HourType) - MANDATORY
  - HourTypesID (BigInt?, FK to HourTypes) - MANDATORY
  - StartTime (DateTime/Time) - MANDATORY (dummy 8:00 for absence records)
  - EndTime (DateTime/Time) - MANDATORY (dummy 16:00 for absence records)
  - Description (String?)
  - km (Int?, default 0)
  - Lock (Boolean, default false)
  - DlhodobaSC (Boolean, default false - this is the Trip Flag)

**Catalog Tables to JOIN:**
- `CinnostTyp`: Alias field for display (Absence Type)
- `Projects`: Number field for display (Project) - filter by AllowAssignWorkingHours=true
- `HourType`: HourType field for display (Productivity Type)
- `HourTypes`: HourType field for display (Work Type)

**Employee Table:**
- `Zamestnanci`: ZamknuteK field (DateTime?) - records with StartDate <= ZamknuteK are locked

**Lock Logic:**
- Record is locked if: `Lock=true OR StartDate <= employee.ZamknuteK`

**Overnight Calculation:**
- If `EndTime < StartTime`: hours = (EndTime - StartTime) + 24 hours
- Otherwise: hours = EndTime - StartTime
- Max shift duration: 24 hours
- Display format: decimal (e.g., 8.5)

**Technology Stack:**
- Backend: NestJS with GraphQL (Apollo Server v4), Prisma ORM, PostgreSQL
- Frontend: Next.js 14+ with App Router, TailwindCSS, shadcn/ui (Tangerine theme)
- GraphQL Client: Apollo Client with typed hooks
- Icons: lucide-react
- Date handling: Need to determine library (date-fns, dayjs, or native)

**Performance Considerations:**
- Infinite scroll to handle large datasets efficiently
- Debounced search to reduce query frequency
- Client-side filtering using `useMemo` for performance
- Pagination/cursor-based queries to load data in chunks
- Consider indexing on StartDate, Lock, ProjectID in database

## Comprehensive Technical Summary

### Complete Data Model

**Fields to Fetch from `t_{FirstName}_{LastName}` Tables:**
1. `ID` (BigInt) - Primary key
2. `StartDate` (Date) - Record date (MANDATORY)
3. `CinnostTypID` (BigInt) - FK to CinnostTyp (MANDATORY)
4. `ProjectID` (BigInt) - FK to Projects (MANDATORY)
5. `HourTypeID` (BigInt) - FK to HourType (MANDATORY)
6. `HourTypesID` (BigInt) - FK to HourTypes (MANDATORY)
7. `StartTime` (Time) - Shift start time (MANDATORY, dummy 8:00 for absences)
8. `EndTime` (Time) - Shift end time (MANDATORY, dummy 16:00 for absences)
9. `Description` (String) - Work description (OPTIONAL)
10. `km` (Int) - Kilometers traveled (OPTIONAL, default 0)
11. `Lock` (Boolean) - Manual lock flag (default false)
12. `DlhodobaSC` (Boolean) - Trip flag (default false)

**Joined Catalog Data:**
- `CinnostTyp.Alias` - Absence Type display name
- `Projects.Number` - Project number for display
- `HourType.HourType` - Productivity Type display name
- `HourTypes.HourType` - Work Type display name

**Computed Fields:**
- `Hours` (Decimal) - Calculated from StartTime/EndTime with overnight logic
- `IsLocked` (Boolean) - Computed from Lock flag OR StartDate <= employee.ZamknuteK
- `IsOvernightShift` (Boolean) - Computed from EndTime < StartTime

### GraphQL Query Structure

**Query Name:** `getWorkRecords`

**Input Arguments:**
- `employeeId` (Int!) - Target employee ID
- `fromDate` (Date!) - Start of date range
- `toDate` (Date!) - End of date range
- `limit` (Int, default 50) - Records per page for infinite scroll
- `offset` (Int, default 0) - Pagination offset

**Backend Query Logic:**
1. Determine user table name: `t_{employee.FirstName}_{employee.LastName}`
2. Query records with `StartDate BETWEEN fromDate AND toDate`
3. JOIN with:
   - `CinnostTyp ON CinnostTypID = CinnostTyp.ID`
   - `Projects ON ProjectID = Projects.ID WHERE Projects.AllowAssignWorkingHours = true`
   - `HourType ON HourTypeID = HourType.ID`
   - `HourTypes ON HourTypesID = HourTypes.ID`
4. Fetch employee's `ZamknuteK` value for lock calculation
5. Calculate hours using resolver logic
6. Return paginated results with total count

**GraphQL Response Type:**
```graphql
type WorkRecord {
  id: ID!
  date: Date!
  absenceType: String!
  project: String!
  productivityType: String!
  workType: String!
  startTime: Time!
  endTime: Time!
  hours: Float!
  description: String
  km: Int!
  isTripFlag: Boolean!
  isLocked: Boolean!
  isOvernightShift: Boolean!
}

type WorkRecordsResponse {
  records: [WorkRecord!]!
  totalCount: Int!
  hasMore: Boolean!
}
```

### Hour Calculation Algorithm

**Implementation (Backend GraphQL Resolver):**

```
function calculateHours(startTime: Time, endTime: Time): number {
  // Convert times to minutes since midnight
  const startMinutes = startTime.hours * 60 + startTime.minutes
  const endMinutes = endTime.hours * 60 + endTime.minutes

  let totalMinutes: number

  // Check for overnight shift
  if (endMinutes < startMinutes) {
    // Overnight: add 24 hours (1440 minutes)
    totalMinutes = (endMinutes + 1440) - startMinutes
  } else {
    // Same day
    totalMinutes = endMinutes - startMinutes
  }

  // Convert to decimal hours
  const hours = totalMinutes / 60

  // Validate max 24 hours
  if (hours > 24) {
    throw new Error('Work shift cannot exceed 24 hours')
  }

  // Round to 2 decimal places
  return Math.round(hours * 100) / 100
}
```

**Overnight Detection:**
```
function isOvernightShift(startTime: Time, endTime: Time): boolean {
  const startMinutes = startTime.hours * 60 + startTime.minutes
  const endMinutes = endTime.hours * 60 + endTime.minutes
  return endMinutes < startMinutes
}
```

### Filter Implementation Details

**Filter State Interface:**
```typescript
interface WorkRecordsFilterState {
  // Date range
  fromDate: Date | null
  toDate: Date | null
  showWholeMonth: boolean

  // Text search
  searchText: string

  // Multi-select filters
  selectedProjects: string[]      // Project IDs
  selectedAbsenceTypes: string[]  // CinnostTyp IDs
  selectedProductivityTypes: string[]  // HourType IDs
  selectedWorkTypes: string[]     // HourTypes IDs

  // Boolean filters
  lockStatus: 'all' | 'locked' | 'unlocked'
  tripFlag: 'all' | 'yes' | 'no'
}
```

**Filter Logic (OR within category, AND between categories):**

```
Client-side filtering after GraphQL fetch:

function applyFilters(records: WorkRecord[], filters: WorkRecordsFilterState): WorkRecord[] {
  return records.filter(record => {
    // Text search (Description field)
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase()
      if (!record.description?.toLowerCase().includes(searchLower)) {
        return false
      }
    }

    // Project filter (OR logic within category)
    if (filters.selectedProjects.length > 0) {
      if (!filters.selectedProjects.includes(record.projectId)) {
        return false
      }
    }

    // Absence Type filter (OR logic within category)
    if (filters.selectedAbsenceTypes.length > 0) {
      if (!filters.selectedAbsenceTypes.includes(record.absenceTypeId)) {
        return false
      }
    }

    // Productivity Type filter (OR logic within category)
    if (filters.selectedProductivityTypes.length > 0) {
      if (!filters.selectedProductivityTypes.includes(record.productivityTypeId)) {
        return false
      }
    }

    // Work Type filter (OR logic within category)
    if (filters.selectedWorkTypes.length > 0) {
      if (!filters.selectedWorkTypes.includes(record.workTypeId)) {
        return false
      }
    }

    // Lock Status filter
    if (filters.lockStatus === 'locked' && !record.isLocked) {
      return false
    }
    if (filters.lockStatus === 'unlocked' && record.isLocked) {
      return false
    }

    // Trip Flag filter
    if (filters.tripFlag === 'yes' && !record.isTripFlag) {
      return false
    }
    if (filters.tripFlag === 'no' && record.isTripFlag) {
      return false
    }

    // All filters passed (AND logic between categories)
    return true
  })
}
```

### Infinite Scroll Pagination Approach

**Implementation Strategy:**

1. **Initial Load:**
   - Fetch first 50 records for date range (default: last 31 days)
   - Display in table

2. **Scroll Detection:**
   - Use `IntersectionObserver` to detect when user scrolls near bottom
   - Trigger point: 200px from bottom of table

3. **Load More:**
   - When triggered, fetch next 50 records using offset
   - Append to existing records
   - Continue until `hasMore = false`

4. **Loading Indicator:**
   - Show "Loading more..." with spinner at bottom while fetching

**React Implementation Pattern:**
```typescript
// Custom hook for infinite scroll
function useInfiniteScroll(
  fetchMore: (offset: number) => Promise<void>,
  hasMore: boolean
) {
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          fetchMore(currentOffset)
        }
      },
      { threshold: 1.0 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, fetchMore])

  return observerTarget
}
```

### UI Component Breakdown

**Page Structure:**

```
/app/data/page.tsx (Main Page Component)
├── Breadcrumb Navigation
├── Page Title: "Work Records"
├── Employee Selector (if manager/admin)
├── WorkRecordsFilterControls Component
│   ├── Date Range Picker (From/To with separate pickers)
│   ├── Show Whole Month Checkbox
│   ├── Description Search Box (with X clear button)
│   ├── Multi-select Dropdowns:
│   │   ├── Project
│   │   ├── Absence Type
│   │   ├── Productivity Type
│   │   ├── Work Type
│   │   ├── Lock Status
│   │   └── Trip Flag
│   ├── Active Filter Chips (removable)
│   └── Clear All Filters Button
├── Record Count Display ("Showing X of Y records")
└── WorkRecordsTable Component
    ├── Table Header (sortable columns)
    ├── Table Body (records)
    │   ├── ID Column
    │   ├── Date Column
    │   ├── Absence Type Column
    │   ├── Project Column
    │   ├── Productivity Type Column
    │   ├── Work Type Column
    │   ├── Start Time Column
    │   ├── End Time Column (with moon icon if overnight)
    │   ├── Hours Column (decimal format)
    │   ├── Description Column
    │   ├── KM Column
    │   ├── Trip Flag Column
    │   └── Lock Icon Column (if locked, + grayed row)
    └── Infinite Scroll Observer Target
```

**Component Files to Create:**

1. `/frontend/src/app/data/page.tsx` - Main page (similar to employees/page.tsx)
2. `/frontend/src/components/work-records-filter-controls.tsx` - Filter component (extend filter-controls.tsx pattern)
3. `/frontend/src/components/work-records-table.tsx` - Table component (extend employee-table.tsx pattern)
4. `/frontend/src/components/ui/date-picker.tsx` - shadcn/ui date picker
5. `/frontend/src/components/ui/multi-select.tsx` - Multi-select dropdown
6. `/frontend/src/components/filter-chips.tsx` - Active filter chips
7. `/frontend/src/hooks/use-infinite-scroll.ts` - Infinite scroll hook
8. `/frontend/src/graphql/queries/work-records.ts` - GraphQL query
9. `/backend/src/work-records/work-records.resolver.ts` - GraphQL resolver
10. `/backend/src/work-records/work-records.service.ts` - Business logic

### Existing Code Patterns Reference

**From `/frontend/src/components/filter-controls.tsx`:**
- Use `useDeferredValue` for debounced search
- Search icon (Search from lucide-react) positioned at left of input
- Clear button (X from lucide-react) positioned at right of input
- FilterState interface pattern for type safety
- `onFilterChange` callback prop pattern

**From `/frontend/src/components/employee-table.tsx`:**
- Column sorting state: `sortColumn` and `sortDirection`
- Sort indicators: ChevronUp/ChevronDown icons
- Sort toggle logic: same column toggles direction, new column resets to 'asc'
- Null value handling in sort comparator
- Responsive table with shadcn/ui styling classes

**From `/frontend/src/app/employees/page.tsx`:**
- `useQuery` hook from Apollo Client
- Loading state with Loader2 spinning icon
- Error state with XCircle icon and retry button
- Empty state with Users icon and helpful message
- Client-side filtering with `useMemo` for performance
- Record count display pattern

### Design Notes

**Styling Consistency:**
- Use shadcn/ui Tangerine theme colors
- Match table styling from Employee Overview (bordered table, hover effects, muted header)
- Match filter control styling (card background, rounded corners, border)
- Use lucide-react icons consistently:
  - Search for search box
  - X for clear buttons
  - ChevronUp/ChevronDown for sort indicators
  - Lock for locked records
  - Moon for overnight shifts
  - Loader2 for loading states
  - XCircle for error states

**Responsive Considerations:**
- Table should scroll horizontally on mobile
- Filter controls should wrap on smaller screens
- Date pickers should be mobile-friendly
- Multi-select dropdowns should work well on touch devices

## Readiness Confirmation

All requirements are now fully clarified and comprehensive enough for the spec-writer agent to create a detailed specification document:

- Data fetching strategy confirmed (Option A: fetch all fields upfront)
- Date picker UI clarified (two separate pickers, not range picker)
- Absence record handling clarified (dummy times 8:00-16:00)
- Employee selector scope clarified (managers see ALL employees)
- Multi-filter logic clarified (OR within category, AND between categories)
- Complete data model documented
- GraphQL query structure defined
- Hour calculation algorithm specified
- Filter implementation detailed
- Infinite scroll approach outlined
- UI component breakdown provided
- Existing code patterns identified for reuse

Ready to proceed to `/write-spec`.
