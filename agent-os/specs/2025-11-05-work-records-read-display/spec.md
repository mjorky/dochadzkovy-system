# Specification: Work Records - Read & Display

## Goal

Create a comprehensive data viewing screen that displays work records from per-employee database tables with advanced filtering, sorting, and pagination capabilities, building on the existing Employee Overview feature.

## User Stories

- As an employee, I want to view my work records with hours calculated automatically so that I can track my time entries
- As a manager/admin, I want to filter and view any employee's work records so that I can review team activity and verify time entries
- As a user, I want to apply multiple filters simultaneously so that I can quickly find specific work records

## Specific Requirements

**GraphQL Query - Work Records Fetching**
- Create `getWorkRecords` query accepting employeeId, fromDate, toDate, limit, offset parameters
- Dynamically determine per-employee table name from Zamestnanci (format: t_{Meno}_{Priezvisko})
- LEFT JOIN with Projects, CinnostTyp, HourType, HourTypes catalog tables to handle NULL foreign keys
- Filter Projects by AllowAssignWorkingHours=true for dropdown options
- Calculate hours field using resolver with overnight shift logic (EndTime < StartTime adds 24 hours)
- Compute isLocked field from Lock flag OR StartDate <= employee.ZamknuteK
- Compute isOvernightShift field from EndTime < StartTime comparison
- Return paginated results with totalCount and hasMore fields for infinite scroll
- Handle NULL values in joined data gracefully (return NULL, frontend displays "—")

**Work Record Data Model**
- Fetch all fields from t_{Meno}_{Priezvisko} table: ID, StartDate, CinnostTypID, ProjectID, HourTypeID, HourTypesID, StartTime, EndTime, Description, km, Lock, DlhodobaSC
- Join CinnostTyp.Alias for absence type display name (INNER JOIN - always present)
- Join Projects.Number for project identifier (LEFT JOIN - NULL for absences)
- Join HourType.HourType for productivity type (LEFT JOIN - NULL for absences)
- Join HourTypes.HourType for work type (LEFT JOIN - NULL for absences)
- Calculate hours in decimal format (8.5 hours) with 2 decimal precision
- Validate maximum shift duration of 24 hours in calculation
- Handle conditional field nullability: ProjectID, HourTypeID, HourTypesID are NULL for absence records (CinnostTypID != 1)

**Hour Calculation Algorithm**
- Convert StartTime and EndTime to minutes since midnight
- Check if EndTime < StartTime to detect overnight shift
- For overnight: totalMinutes = (EndTime + 1440) - StartTime
- For same-day: totalMinutes = EndTime - StartTime
- Convert to decimal hours: hours = totalMinutes / 60
- Round to 2 decimal places: Math.round(hours * 100) / 100
- Throw error if hours > 24 (validation)
- Return isOvernightShift boolean flag for UI indicator

**Work Records Table Display**
- Display columns: ID, Date, Absence Type, Project, Productivity Type, Work Type, Start Time, End Time, Hours, Description, KM, Trip Flag, Lock Status
- Show "—" (em dash Unicode U+2014) for NULL Project, Productivity Type, Work Type values (absence records)
- Format hours as decimal (8.5) with 2 decimal places
- Display moon icon (from lucide-react) in End Time column for overnight shifts
- Display lock icon (from lucide-react) for locked records
- Gray out entire row with reduced opacity for locked records (isLocked=true)
- Default sort by Date column (oldest first, ascending)
- Implement column sorting on all fields with ChevronUp/ChevronDown visual indicators
- Use shadcn/ui table styling matching Employee Overview screen

**Date Range Filter**
- Implement two separate date pickers side-by-side (From: [picker] To: [picker])
- Default to last 31 days (fromDate = today - 31 days, toDate = today)
- Add "Show whole month" checkbox that expands date range to full calendar month of start date
- When checkbox toggled: fromDate = first day of month, toDate = last day of month
- Update GraphQL query parameters on date change without page reload
- Use shadcn/ui calendar component for date picker implementation

**Advanced Filtering**
- Multi-select dropdown for Projects (show only AllowAssignWorkingHours=true)
- Multi-select dropdown for Absence Types (all CinnostTyp values)
- Multi-select dropdown for Productivity Types (all HourType values)
- Multi-select dropdown for Work Types (all HourTypes values)
- Single-select dropdown for Lock Status (all/locked/unlocked)
- Single-select dropdown for Trip Flag (all/yes/no)
- Text search box for Description field with real-time search-as-you-type
- Search icon (lucide-react Search) on left, X clear button on right when text present
- Debounce search using useDeferredValue hook (follow filter-controls.tsx pattern)
- Filter logic: OR within category, AND between categories (e.g., (Project=A OR Project=B) AND (Lock=Yes))

**Filter UI Components**
- Display active filters as removable chips below filter controls
- Add "Clear all filters" button to reset all filters to defaults
- Show filter count: "Showing X of Y records"
- Filter state resets to defaults on page load (no persistence)
- Create FilterState interface with typed fields for all filter options
- Implement client-side filtering with useMemo for performance (follow employees/page.tsx pattern)

**Infinite Scroll Pagination**
- Initial load fetches first 50 records for selected date range
- Use IntersectionObserver to detect when user scrolls near table bottom (200px threshold)
- Trigger fetchMore with offset parameter when scroll threshold reached
- Append new records to existing array without replacing
- Display "Loading more..." with Loader2 spinner at bottom while fetching
- Continue loading until hasMore=false from GraphQL response
- Handle efficient loading for ~8000 max records per employee (10 years × 254 days × 3 records/day)

**Employee Selector for Managers/Admins**
- Display dropdown above filters showing current employee name
- Populate with ALL employees from Zamestnanci table (no restriction to direct reports)
- Default to current logged-in user's records
- On selection change, reload work records for selected employee
- Hide selector for regular employees (only show for managers/admins based on IsAdmin flag)
- Use shadcn/ui select component matching existing dropdown styling

**Loading, Error, and Empty States**
- Loading state: centered Loader2 spinning icon with "Loading..." text
- Error state: XCircle icon with error message and "Retry" button triggering refetch
- Empty state (no records): Calendar icon with "No work records found" message
- Empty state (after filtering): "No records match your filters" with suggestion to adjust
- Follow exact pattern from employees/page.tsx for consistency

**Responsive Layout and Styling**
- Use shadcn/ui Tangerine theme colors consistently
- Card background for filter controls with rounded corners and border
- Table with bordered style, hover effects on rows, muted header background
- Match existing Employee Overview table styling (border, shadow, overflow-x-auto)
- Breadcrumb navigation: Home > Work Records
- Page title: "Work Records" with h1 styling
- Proper spacing: p-8 container, mb-6 sections, gap-4 for filter controls

## Visual Design

**No wireframe mockups provided**

UI should match existing Employee Overview screen patterns:

**Theme Reference Files**
- Follow shadcn/ui Tangerine theme from planning/visuals/shadcn-config-file.txt
- Use color palette from planning/visuals/tweakcn Color Palette.html
- Match card styling from planning/visuals/tweakcn Cards.html
- Reference dashboard layout from planning/visuals/tweakcn Dashboard.html
- Typography consistency from planning/visuals/tweakcn Typography.html

## Existing Code to Leverage

**filter-controls.tsx Component**
- Reuse search field pattern with Search icon (left) and X clear button (right)
- Copy useDeferredValue debouncing pattern for real-time search
- Adopt FilterState interface structure with typed filter fields
- Use same card container styling (bg-card, rounded-lg, border, p-4)
- Replicate onFilterChange callback prop pattern for parent communication

**employee-table.tsx Component**
- Extend column sorting logic with sortColumn and sortDirection state
- Reuse ChevronUp/ChevronDown sort indicators from lucide-react
- Copy NULL value handling in sort comparator (aValue == null checks)
- Use same table styling (rounded-lg border, bg-card, shadow-md, overflow-x-auto)
- Replicate row hover effect (hover:bg-muted/50) and border styling
- Apply "—" em dash display pattern for NULL values (titlePrefix || '—')

**employees/page.tsx Integration Pattern**
- Copy useQuery hook integration from @apollo/client
- Reuse loading state with Loader2 icon and centered flex layout
- Replicate error state with XCircle icon, error message, and refetch button
- Adopt empty state with icon and helpful messaging pattern
- Use client-side filtering with useMemo hook for performance optimization
- Implement same record count display pattern ("Showing X of Y")

**GraphQL Backend Patterns (employees.resolver.ts & employees.service.ts)**
- Follow NestJS @Resolver and @Query decorator pattern with code-first approach
- Use @Field decorators for GraphQL type definition with nullable: true for optional fields
- Inject PrismaService for database access via constructor
- Use Logger for error logging in service layer
- Map Prisma results to GraphQL entity types with explicit field mapping
- Handle errors with try-catch and throw descriptive Error messages

**NestJS GraphQL Entity Definition (employee.entity.ts)**
- Create @ObjectType class for WorkRecord with @Field decorators
- Use appropriate scalar types (String, Float, Boolean, Int)
- Mark nullable fields with { nullable: true } option
- Export entity class for resolver imports

## Out of Scope

- Row-level actions (edit, delete, copy buttons) - deferred to Phase 3
- Creating new work records - deferred to Phase 3
- Inline editing of work records - deferred to Phase 3
- Work record validation rules - deferred to Phase 3
- Bulk operations (multi-select, bulk delete) - deferred to Phase 3
- Export to CSV functionality - mentioned in roadmap Phase 4
- Record copying across days - mentioned in roadmap Phase 4
- Next workday suggestion feature - mentioned in roadmap Phase 4
- Mobile-specific optimizations beyond responsive table
- Filter state persistence (localStorage/URL params)
- Custom date range presets (last 7 days, last 90 days, etc.)
