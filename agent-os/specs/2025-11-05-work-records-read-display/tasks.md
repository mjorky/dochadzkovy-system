# Task Breakdown: Work Records - Read & Display

## Overview

**Feature:** Work Records - Read & Display (Phase 2)
**Total Tasks:** 56 sub-tasks across 5 major task groups
**Estimated Duration:** 2-3 weeks
**Roadmap Items Covered:** Items 6-8 (Work Records Read Query, Data Screen Table Display, Date Range Filter)

## Task List

---

### Backend Layer - GraphQL API

#### Task Group 1: Database Schema & Entity Models
**Dependencies:** None
**Estimated Time:** 1-2 days
**Assigned Role:** backend-engineer

- [ ] 1.0 Complete database layer foundation
  - [ ] 1.1 Write 2-8 focused tests for WorkRecord entity and hour calculations
    - Test hour calculation for same-day shift (e.g., 09:00-17:30 = 8.5 hours)
    - Test overnight shift detection and calculation (e.g., 22:00-06:00 = 8.0 hours)
    - Test maximum 24-hour validation
    - Test NULL handling for absence record fields (project, productivityType, workType)
    - Test lock status computation (Lock flag OR StartDate <= ZamknuteK)
    - Limit to maximum 8 focused tests
  - [ ] 1.2 Create WorkRecord GraphQL entity (`/backend/src/work-records/entities/work-record.entity.ts`)
    - Create @ObjectType class with @Field decorators (follow pattern from employee.entity.ts)
    - Fields: id (String!), date (String!), absenceType (String!), project (String, nullable), productivityType (String, nullable), workType (String, nullable), startTime (String!), endTime (String!), hours (Float!), description (String, nullable), km (Int!), isTripFlag (Boolean!), isLocked (Boolean!), isOvernightShift (Boolean!)
    - Mark nullable fields with { nullable: true } option for absence records
    - Use Float scalar for hours field with 2 decimal precision
  - [ ] 1.3 Create WorkRecordsResponse GraphQL entity for pagination
    - Fields: records (WorkRecord[]!), totalCount (Int!), hasMore (Boolean!)
    - Support infinite scroll pagination pattern
  - [ ] 1.4 Create WorkRecordsInput GraphQL input type for query arguments
    - Fields: employeeId (Int!), fromDate (String!), toDate (String!), limit (Int, default 50), offset (Int, default 0)
    - Validate date format and range (fromDate <= toDate)
  - [ ] 1.5 Ensure database layer tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify hour calculation algorithm correctness
    - Verify NULL handling for conditional fields
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass
- WorkRecord entity correctly maps all database fields
- Hour calculation handles overnight shifts (EndTime < StartTime adds 24 hours)
- NULL fields properly marked as nullable for absence records
- Lock status computed from Lock flag OR date-based ZamknuteK check
- Overnight shift flag computed from time comparison

**Reference Files:**
- `/backend/src/employees/entities/employee.entity.ts` - Entity pattern with @Field decorators
- `/docs/db/RELATIONAL_SCHEMA_GUIDE.md` - Complete schema documentation with nullability rules

---

#### Task Group 2: Hour Calculation Algorithm
**Dependencies:** Task Group 1
**Estimated Time:** 1 day
**Assigned Role:** backend-engineer

- [ ] 2.0 Implement hour calculation resolver logic
  - [ ] 2.1 Write 2-8 focused tests for time calculation utilities
    - Test convertTimeToMinutes utility (e.g., "09:30" → 570 minutes)
    - Test overnight detection (EndTime < StartTime)
    - Test hour calculation with decimal rounding to 2 places
    - Test validation: throw error if hours > 24
    - Limit to maximum 8 focused tests
  - [ ] 2.2 Create time utility functions (`/backend/src/work-records/utils/time-calculations.ts`)
    - convertTimeToMinutes(time: string): number - Parse HH:MM:SS to minutes since midnight
    - calculateHours(startTime: string, endTime: string): number - Return decimal hours with overnight logic
    - isOvernightShift(startTime: string, endTime: string): boolean - Detect EndTime < StartTime
    - Round hours to 2 decimal places: Math.round(hours * 100) / 100
    - Throw Error if calculated hours > 24
  - [ ] 2.3 Add field resolver for hours calculation in WorkRecord entity
    - Use @ResolveField decorator for computed hours field
    - Call calculateHours utility with startTime and endTime from database
    - Handle Time type from PostgreSQL (convert to string format)
  - [ ] 2.4 Add field resolver for isOvernightShift flag
    - Use @ResolveField decorator for computed isOvernightShift field
    - Call isOvernightShift utility with startTime and endTime
    - Return boolean for frontend moon icon display
  - [ ] 2.5 Ensure hour calculation tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify overnight shifts add 24 hours correctly
    - Verify decimal precision (2 places)
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- Hour calculation algorithm handles same-day and overnight shifts
- Time utilities convert PostgreSQL Time type correctly
- Decimal rounding to 2 places (e.g., 8.5, not 8.500000001)
- Validation throws error for shifts > 24 hours
- Overnight flag correctly identifies time spanning midnight

**Reference Files:**
- `/agent-os/specs/2025-11-05-work-records-read-display/planning/requirements.md` - Lines 496-534 for algorithm specification

---

#### Task Group 3: GraphQL Query Implementation
**Dependencies:** Task Groups 1, 2
**Estimated Time:** 2-3 days
**Assigned Role:** backend-engineer

- [ ] 3.0 Implement work records query resolver and service
  - [ ] 3.1 Write 2-8 focused tests for work records service
    - Test getWorkRecords with valid employeeId and date range
    - Test dynamic table name construction (t_{Meno}_{Priezvisko})
    - Test LEFT JOIN with Projects, HourType, HourTypes (NULL handling)
    - Test pagination (limit, offset, hasMore calculation)
    - Test lock status computation (Lock OR date <= ZamknuteK)
    - Limit to maximum 8 focused tests
  - [ ] 3.2 Create WorkRecordsService (`/backend/src/work-records/work-records.service.ts`)
    - Inject PrismaService via constructor (follow employees.service.ts pattern)
    - Implement getWorkRecords(input: WorkRecordsInput): Promise<WorkRecordsResponse>
    - Fetch employee from Zamestnanci to get Meno, Priezvisko, ZamknuteK
    - Construct dynamic table name: `t_${Meno}_${Priezvisko}`
    - Use Prisma dynamic model access: prisma[tableName].findMany()
    - Filter by StartDate BETWEEN fromDate AND toDate
    - Include CinnostTyp (INNER JOIN - always present)
    - Include Projects, HourType, HourTypes with LEFT JOIN (can be NULL)
    - Order by StartDate ASC (oldest first)
    - Apply limit and offset for pagination
    - Calculate totalCount with separate count query
    - Calculate hasMore: offset + limit < totalCount
    - Use Logger for error logging in try-catch blocks
  - [ ] 3.3 Create WorkRecordsResolver (`/backend/src/work-records/work-records.resolver.ts`)
    - Use @Resolver and @Query decorators (follow employees.resolver.ts pattern)
    - Inject WorkRecordsService via constructor
    - Define @Query(() => WorkRecordsResponse, { name: 'getWorkRecords' })
    - Accept WorkRecordsInput as @Args parameter
    - Call service.getWorkRecords(input)
    - Handle errors and throw descriptive GraphQL errors
  - [ ] 3.4 Map Prisma results to WorkRecord entity fields
    - Map ID → id (convert BigInt to string)
    - Map StartDate → date (convert Date to ISO string)
    - Map CinnostTyp.Alias → absenceType (always present)
    - Map Projects.Number → project (can be NULL - return null, frontend displays "—")
    - Map HourType.HourType → productivityType (can be NULL)
    - Map HourTypes.HourType → workType (can be NULL)
    - Map StartTime, EndTime → time strings (PostgreSQL Time to "HH:MM:SS")
    - Map km → km (default to 0 if NULL)
    - Map DlhodobaSC → isTripFlag
    - Compute isLocked: Lock === true OR StartDate <= employee.ZamknuteK
    - Hours and isOvernightShift computed by field resolvers (Task 2.3, 2.4)
  - [ ] 3.5 Filter Projects by AllowAssignWorkingHours=true for dropdown options
    - Create separate getActiveProjects query for filter dropdown population
    - Return projects where AllowAssignWorkingHours = true
    - Include ID and Number fields for display
  - [ ] 3.6 Create catalog data queries for filter dropdowns
    - Create getAbsenceTypes query (CinnostTyp table, exclude Zmazane=true)
    - Create getProductivityTypes query (HourType table)
    - Create getWorkTypes query (HourTypes table)
    - Return ID and display name fields for dropdown options
  - [ ] 3.7 Create WorkRecordsModule to register resolver and service
    - Create `/backend/src/work-records/work-records.module.ts`
    - Import PrismaModule for database access
    - Register WorkRecordsService as provider
    - Register WorkRecordsResolver
    - Export WorkRecordsService for testing
  - [ ] 3.8 Register WorkRecordsModule in AppModule imports
    - Add to `/backend/src/app.module.ts` imports array
  - [ ] 3.9 Ensure GraphQL API tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify query returns correct data structure
    - Verify NULL values handled gracefully (return null, not error)
    - Verify pagination calculations (hasMore flag)
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass
- Query accepts employeeId, fromDate, toDate, limit, offset parameters
- Dynamic table name construction works for any employee
- LEFT JOINs return NULL for absence records (ProjectID, HourTypeID, HourTypesID)
- Pagination returns totalCount and hasMore correctly
- Lock status computed from both Lock flag and ZamknuteK date
- Catalog queries return data for filter dropdown options
- Error handling with descriptive messages

**Reference Files:**
- `/backend/src/employees/employees.service.ts` - Service pattern with PrismaService injection
- `/backend/src/employees/employees.resolver.ts` - Resolver pattern with @Query decorator
- `/docs/db/RELATIONAL_SCHEMA_GUIDE.md` - Database schema and JOIN patterns

---

### Frontend Layer - Components & UI

#### Task Group 4: Core UI Components & Table Display
**Dependencies:** Task Group 3 (backend API ready)
**Estimated Time:** 3-4 days
**Assigned Role:** ui-designer

- [ ] 4.0 Build work records table and filter components
  - [ ] 4.1 Write 2-8 focused tests for WorkRecordsTable component
    - Test table renders with work records data
    - Test column sorting toggles direction (asc/desc)
    - Test NULL value display as "—" em dash (absence records)
    - Test locked row styling (reduced opacity)
    - Test overnight shift moon icon display
    - Test lock icon display for locked records
    - Limit to maximum 8 focused tests
  - [ ] 4.2 Create GraphQL query definition (`/frontend/src/graphql/queries/work-records.ts`)
    - Define GET_WORK_RECORDS query with employeeId, fromDate, toDate, limit, offset variables
    - Define WorkRecord TypeScript interface matching backend entity
    - Define WorkRecordsResponse interface with records, totalCount, hasMore
    - Export query and types for Apollo Client useQuery hook
  - [ ] 4.3 Create catalog queries for filter options
    - Define GET_ACTIVE_PROJECTS query (filter by AllowAssignWorkingHours=true)
    - Define GET_ABSENCE_TYPES query (CinnostTyp data)
    - Define GET_PRODUCTIVITY_TYPES query (HourType data)
    - Define GET_WORK_TYPES query (HourTypes data)
    - Export interfaces for dropdown option types
  - [ ] 4.4 Create WorkRecordsTable component (`/frontend/src/components/work-records-table.tsx`)
    - Extend employee-table.tsx column sorting pattern
    - Accept workRecords prop as WorkRecord[] array
    - Implement sortColumn and sortDirection state with useState
    - Create handleSort function (toggle direction on same column, reset to 'asc' on new column)
    - Define columns: ID, Date, Absence Type, Project, Productivity Type, Work Type, Start Time, End Time, Hours, Description, KM, Trip Flag, Lock Status
    - Display "—" (Unicode U+2014 em dash) for NULL project, productivityType, workType (use `value ?? '—'`)
    - Format hours as decimal with 2 places: hours.toFixed(2)
    - Show Moon icon (lucide-react) in End Time column if isOvernightShift=true
    - Show Lock icon (lucide-react) in Lock Status column if isLocked=true
    - Apply grayed row style for locked records: className={isLocked ? 'opacity-50 cursor-not-allowed' : ''}
    - Use shadcn/ui table styling: rounded-lg border bg-card shadow-md overflow-x-auto (match employee-table.tsx)
    - Add row hover effect: hover:bg-muted/50 (skip for locked rows)
    - Add ChevronUp/ChevronDown sort indicators from lucide-react
    - Implement NULL-safe sort comparator (handle null values, push to end)
    - Default sort by date column (oldest first, ascending)
  - [ ] 4.5 Create date picker components using shadcn/ui
    - Install shadcn/ui calendar and popover components: `npx shadcn-ui@latest add calendar popover`
    - Create DatePicker component (`/frontend/src/components/ui/date-picker.tsx`)
    - Use Popover with Calendar from shadcn/ui
    - Accept value and onChange props
    - Format display as locale date string
    - Handle date selection and popover close
  - [ ] 4.6 Create multi-select dropdown component
    - Create MultiSelect component (`/frontend/src/components/ui/multi-select.tsx`)
    - Use shadcn/ui Select or Checkbox components for multi-selection
    - Accept options prop (array of {value, label})
    - Accept selectedValues and onChange props
    - Display selected count badge (e.g., "3 selected")
    - Support "Select All" and "Clear All" actions
    - Dropdown closes on outside click
  - [ ] 4.7 Create filter state interface and controls component
    - Define WorkRecordsFilterState interface (`/frontend/src/types/work-records-filters.ts`)
      - fromDate: Date | null
      - toDate: Date | null
      - showWholeMonth: boolean
      - searchText: string
      - selectedProjects: string[] (project IDs)
      - selectedAbsenceTypes: string[] (CinnostTyp IDs)
      - selectedProductivityTypes: string[] (HourType IDs)
      - selectedWorkTypes: string[] (HourTypes IDs)
      - lockStatus: 'all' | 'locked' | 'unlocked'
      - tripFlag: 'all' | 'yes' | 'no'
    - Create WorkRecordsFilterControls component (`/frontend/src/components/work-records-filter-controls.tsx`)
    - Follow filter-controls.tsx pattern: card background, rounded-lg, border, p-4
    - Accept onFilterChange callback prop
    - Implement two side-by-side date pickers (From: [picker] To: [picker])
    - Add "Show whole month" checkbox (when checked, expand to first/last day of month)
    - Add description search box with Search icon (left) and X clear button (right)
    - Use useDeferredValue hook for debounced search (follow filter-controls.tsx pattern)
    - Add multi-select dropdowns for Projects, Absence Types, Productivity Types, Work Types
    - Add single-select dropdowns for Lock Status (all/locked/unlocked) and Trip Flag (all/yes/no)
    - Trigger onFilterChange on any filter change
  - [ ] 4.8 Create filter chips component for active filters
    - Create FilterChips component (`/frontend/src/components/filter-chips.tsx`)
    - Accept filters prop (WorkRecordsFilterState)
    - Accept onRemoveFilter callback
    - Display removable chips for each active filter (exclude 'all' defaults)
    - Show X icon on each chip for removal
    - Add "Clear all filters" button when any filters active
    - Use shadcn/ui badge component for chip styling
  - [ ] 4.9 Ensure UI component tests pass
    - Run ONLY the 2-8 tests written in 4.1
    - Verify table renders all columns correctly
    - Verify "—" em dash displays for NULL values
    - Verify sorting toggles direction
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 4.1 pass
- WorkRecordsTable displays all 13 columns with proper formatting
- NULL values (project, productivityType, workType) display as "—" em dash
- Hours formatted as decimal with 2 places (8.50)
- Moon icon appears for overnight shifts in End Time column
- Lock icon appears for locked records in Lock Status column
- Locked rows have reduced opacity (grayed out)
- Column sorting works on all fields with visual indicators
- Date pickers allow From/To selection
- "Show whole month" checkbox expands date range correctly
- Multi-select dropdowns show selected count
- Description search has debounced input with clear button
- Filter chips display active filters with remove buttons
- All components use shadcn/ui Tangerine theme styling

**Reference Files:**
- `/frontend/src/components/employee-table.tsx` - Table sorting and styling pattern
- `/frontend/src/components/filter-controls.tsx` - Filter state and debounced search pattern
- `/agent-os/specs/2025-11-05-work-records-read-display/planning/visuals/` - shadcn/ui Tangerine theme references

---

#### Task Group 5: Page Integration & Infinite Scroll
**Dependencies:** Task Group 4
**Estimated Time:** 2-3 days
**Assigned Role:** ui-designer

- [ ] 5.0 Build work records page with Apollo integration and infinite scroll
  - [ ] 5.1 Write 2-8 focused tests for infinite scroll hook
    - Test IntersectionObserver triggers fetchMore when scrolling near bottom
    - Test hasMore=false stops loading
    - Test loading state during fetch
    - Limit to maximum 8 focused tests
  - [ ] 5.2 Create infinite scroll custom hook (`/frontend/src/hooks/use-infinite-scroll.ts`)
    - Accept fetchMore callback and hasMore boolean
    - Use useRef for observer target element
    - Use IntersectionObserver API to detect scroll threshold (200px from bottom)
    - Trigger fetchMore when threshold reached and hasMore=true
    - Clean up observer on unmount
    - Return observerTarget ref for attaching to sentinel element
  - [ ] 5.3 Create employee selector component for managers/admins
    - Create EmployeeSelector component (`/frontend/src/components/employee-selector.tsx`)
    - Fetch all employees from EMPLOYEES_QUERY (reuse existing query)
    - Display as shadcn/ui Select dropdown
    - Show current employee name with ID
    - On selection change, call onEmployeeChange callback with new employeeId
    - Only render if user.isAdmin or user.isManager (check from auth context)
    - Default to current logged-in user's ID
  - [ ] 5.4 Create main Work Records page (`/frontend/src/app/work-records/page.tsx`)
    - Follow employees/page.tsx Apollo integration pattern
    - Import useQuery from @apollo/client
    - Import GET_WORK_RECORDS, GET_ACTIVE_PROJECTS, GET_ABSENCE_TYPES, GET_PRODUCTIVITY_TYPES, GET_WORK_TYPES queries
    - Set up filter state with useState<WorkRecordsFilterState>
    - Default fromDate: today - 31 days, toDate: today (last 31 days default)
    - Default all other filters to 'all' or empty arrays
    - Implement handleFilterChange callback
    - Handle "Show whole month" toggle: set fromDate to 1st of month, toDate to last day of month
    - Use useQuery for initial work records fetch with variables (employeeId, fromDate, toDate, limit: 50, offset: 0)
    - Fetch catalog data for filter dropdowns (projects, absence types, etc.)
    - Store records in state, append on fetchMore (infinite scroll)
    - Use fetchMore from Apollo to load next page: update offset, merge results
    - Use useInfiniteScroll hook with fetchMore callback and hasMore from response
    - Implement client-side filtering with useMemo (filter records array by all filter criteria)
    - Filter logic: OR within category, AND between categories (follow requirements.md lines 560-623)
    - Display breadcrumb navigation: Home > Work Records
    - Display page title: "Work Records" with h1
    - Render EmployeeSelector for managers/admins (hide for regular employees)
    - Render WorkRecordsFilterControls with onFilterChange callback
    - Render FilterChips with active filters and remove handlers
    - Display record count: "Showing X of Y records"
    - Render WorkRecordsTable with filtered records
    - Add infinite scroll sentinel element at bottom (attach observerTarget ref)
    - Show "Loading more..." with Loader2 spinner when fetchMore in progress
    - Implement loading state with Loader2 icon and "Loading..." text (centered flex layout)
    - Implement error state with XCircle icon, error message, and "Retry" button (call refetch)
    - Implement empty state: Calendar icon with "No work records found" message
    - Implement filtered empty state: "No records match your filters" with suggestion to adjust
    - Use p-8 container, mb-6 section spacing, gap-4 for filter controls
  - [ ] 5.5 Add route to Next.js app
    - Verify `/frontend/src/app/work-records/page.tsx` is accessible as /work-records route
    - Add navigation link in main menu/sidebar (if applicable)
  - [ ] 5.6 Handle date range updates without page reload
    - On date picker change, update query variables and refetch
    - Use Apollo's refetch or update variables in useQuery options
    - Reset offset to 0 on filter changes (start from first page)
  - [ ] 5.7 Ensure page integration tests pass
    - Run ONLY the 2-8 tests written in 5.1
    - Verify infinite scroll loads more records
    - Verify hasMore stops loading
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 5.1 pass
- Work Records page loads with default 31-day range
- Apollo query fetches first 50 records on mount
- Employee selector shows all employees for managers/admins, hidden for regular employees
- Filter controls update state and trigger client-side filtering
- Date range picker updates query without page reload
- "Show whole month" checkbox expands date range to full month
- Infinite scroll loads next 50 records when scrolling near bottom
- Records append to table (no replacement)
- Loading state shows spinner during fetch
- Error state shows retry button
- Empty states display appropriate messages
- Filter count shows "Showing X of Y records"
- All styling matches shadcn/ui Tangerine theme
- Page accessible at /work-records route

**Reference Files:**
- `/frontend/src/app/employees/page.tsx` - Apollo useQuery, loading/error states, client-side filtering pattern
- `/agent-os/specs/2025-11-05-work-records-read-display/planning/requirements.md` - Lines 645-673 for infinite scroll approach

---

### Testing & Integration

#### Task Group 6: Test Review & Critical Gap Analysis
**Dependencies:** Task Groups 1-5
**Estimated Time:** 2-3 days
**Assigned Role:** test-engineer

- [ ] 6.0 Review existing tests and fill critical gaps only
  - [ ] 6.1 Review tests from Task Groups 1-5
    - Review the 2-8 tests written by backend-engineer (Tasks 1.1, 2.1, 3.1) - approximately 6-24 tests
    - Review the 2-8 tests written by ui-designer (Tasks 4.1, 5.1) - approximately 4-16 tests
    - Total existing tests: approximately 10-40 tests
    - Verify tests cover critical functionality: hour calculation, NULL handling, infinite scroll, filtering
  - [ ] 6.2 Analyze test coverage gaps for THIS feature only
    - Identify critical user workflows that lack test coverage
    - Focus ONLY on gaps related to work records read/display requirements
    - Do NOT assess entire application test coverage
    - Prioritize end-to-end workflows over unit test gaps
    - Critical workflows to verify:
      - Employee views their own work records
      - Manager/admin switches employee and views records
      - User applies multiple filters (AND between categories, OR within)
      - User scrolls to load more records (infinite scroll)
      - User changes date range and sees updated results
      - Locked records display with grayed styling
      - Overnight shifts display moon icon
      - NULL values display as "—" for absence records
  - [ ] 6.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on integration points and end-to-end workflows
    - Backend integration tests:
      - Test GraphQL query with real database (if not covered)
      - Test dynamic table name construction for different employees
      - Test LEFT JOIN NULL handling for absence records
    - Frontend integration tests:
      - Test Apollo query integration with mock backend
      - Test filter state changes trigger UI updates
      - Test infinite scroll appends records without duplication
      - Test employee selector changes refetch data
    - End-to-end workflow tests:
      - Test full user journey: load page → apply filters → scroll → view locked records
      - Test date range change updates table data
      - Test "Show whole month" expands date correctly
    - Do NOT write comprehensive coverage for all scenarios
    - Skip edge cases, performance tests, and accessibility tests unless business-critical
  - [ ] 6.4 Run feature-specific tests only
    - Run ONLY tests related to work records feature (tests from 1.1, 2.1, 3.1, 4.1, 5.1, and 6.3)
    - Expected total: approximately 20-50 tests maximum
    - Backend tests: `npm test -- work-records` (in /backend directory)
    - Frontend tests: `npm test -- work-records` (in /frontend directory)
    - Do NOT run the entire application test suite
    - Verify all critical workflows pass
    - Fix any failing tests before marking task complete

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 20-50 tests total)
- Critical user workflows for work records feature are covered
- No more than 10 additional tests added when filling in testing gaps
- Testing focused exclusively on work records read/display requirements
- Integration tests verify GraphQL query with database
- End-to-end tests verify complete user workflows
- NULL value handling tested for absence records
- Infinite scroll tested for correct pagination
- Filter logic tested for OR within category, AND between categories

**Reference Files:**
- `/backend/src/employees/employees.resolver.spec.ts` - Example resolver test structure
- `/agent-os/specs/2025-11-05-work-records-read-display/spec.md` - Complete feature requirements

---

## Execution Order

Recommended implementation sequence:

1. **Backend Layer** (Task Groups 1-3): 4-6 days
   - Database schema and entities
   - Hour calculation algorithm
   - GraphQL query implementation

2. **Frontend Components** (Task Group 4): 3-4 days
   - Core UI components (table, filters, date picker, multi-select)
   - Component-level testing

3. **Page Integration** (Task Group 5): 2-3 days
   - Apollo Client integration
   - Infinite scroll implementation
   - Filter logic and state management

4. **Testing & Integration** (Task Group 6): 2-3 days
   - Test review
   - Critical gap filling (maximum 10 additional tests)
   - End-to-end workflow verification

**Total Estimated Duration:** 11-16 days (2-3 weeks)

---

## Implementation Notes

### Critical Technical Challenges

1. **Dynamic Per-Employee Table Access**
   - Construct table name from employee Meno and Priezvisko
   - Use Prisma dynamic model access: `prisma[tableName]`
   - Handle name formatting (spaces, special characters)

2. **Conditional Field Nullability**
   - Work records (CinnostTypID=1): ProjectID, HourTypeID, HourTypesID are REQUIRED
   - Absence records (CinnostTypID≠1): Those fields are NULL
   - Use LEFT JOIN for Projects, HourType, HourTypes tables
   - Display NULL as "—" em dash in frontend

3. **Hour Calculation with Overnight Detection**
   - Convert Time to minutes since midnight
   - Detect overnight: EndTime < StartTime
   - Add 24 hours (1440 minutes) for overnight shifts
   - Round to 2 decimal places
   - Validate maximum 24 hours

4. **Advanced Filtering Logic**
   - OR within category: (Project=A OR Project=B)
   - AND between categories: (Projects) AND (Lock Status) AND (Trip Flag)
   - Implement with client-side filtering using useMemo
   - Debounce description search with useDeferredValue

5. **Infinite Scroll Pagination**
   - Load 50 records initially
   - Use IntersectionObserver for scroll detection (200px threshold)
   - Append records with Apollo fetchMore
   - Track hasMore flag from backend
   - Handle up to ~8000 records efficiently

6. **Lock Status Visual Treatment**
   - Compute isLocked: Lock=true OR StartDate <= ZamknuteK
   - Gray out row with opacity-50
   - Show lock icon
   - Disable hover effect for locked rows

### Existing Code Patterns to Reuse

**Backend Patterns:**
- `/backend/src/employees/employees.service.ts` - PrismaService injection, error handling with Logger
- `/backend/src/employees/employees.resolver.ts` - @Resolver, @Query decorators
- `/backend/src/employees/entities/employee.entity.ts` - @ObjectType with @Field decorators

**Frontend Patterns:**
- `/frontend/src/components/filter-controls.tsx` - useDeferredValue debouncing, FilterState interface, card styling
- `/frontend/src/components/employee-table.tsx` - Column sorting, NULL handling (`value ?? '—'`), table styling
- `/frontend/src/app/employees/page.tsx` - useQuery hook, loading/error/empty states, client-side filtering with useMemo

### Visual Design References

All components must use **shadcn/ui Tangerine theme**:
- Colors from `/agent-os/specs/2025-11-05-work-records-read-display/planning/visuals/tweakcn — Theme Generator for shadcn_ui - Color Palette.html`
- Card styling from `tweakcn — Theme Generator for shadcn_ui - Cards.html`
- Typography from `tweakcn — Theme Generator for shadcn_ui - Typography.html`
- Dashboard layout from `tweakcn — Theme Generator for shadcn_ui - Dashboard.html`

### Database Schema Reference

Complete schema documentation available at:
`/docs/db/RELATIONAL_SCHEMA_GUIDE.md`

**Key Schema Details:**
- Per-employee tables: `t_{FirstName}_{LastName}`
- Catalog tables: CinnostTyp (always present), Projects (LEFT JOIN), HourType (LEFT JOIN), HourTypes (LEFT JOIN)
- Conditional nullability based on CinnostTypID (activity type)
- Lock calculation from Lock flag and ZamknuteK date
- Trip flag stored in DlhodobaSC field

---

## Out of Scope (Deferred to Future Phases)

- Row-level actions (edit, delete, copy) - Phase 3
- Creating new work records - Phase 3
- Inline editing - Phase 3
- Work record validation rules - Phase 3
- Bulk operations - Phase 3
- Export to CSV - Phase 4
- Record copying across days - Phase 4
- Next workday suggestion - Phase 4
- Filter state persistence (localStorage/URL params)
- Custom date range presets (last 7 days, last 90 days)
- Mobile-specific optimizations beyond responsive table

---

**Last Updated:** 2025-11-05
**Spec Version:** 1.0
