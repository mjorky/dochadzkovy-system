# Task Breakdown: Employee Overview Feature

## Overview
**Feature:** First complete user-facing feature with GraphQL backend, navigation sidebar, and employee data table with filtering/sorting

**Total Task Groups:** 6
**Estimated Total Effort:** 12-16 hours
**Tech Stack:** NestJS GraphQL backend, Next.js 14 App Router frontend, Prisma ORM, TailwindCSS v4, shadcn/ui Tangerine theme

**Phase 1 Items Covered:**
- Item 2: GraphQL query to list employees
- Item 3: Navigation sidebar with menu items
- Item 4: Apollo Client integration
- Item 5: Employee Overview Screen

---

## Task List

### Task Group 1: Backend GraphQL API Layer
**Dependencies:** None (builds on spec 001 scaffolding)
**Estimated Effort:** 3-4 hours
**Assigned Role:** Backend Engineer

- [ ] 1.0 Complete GraphQL API for employee listing
  - [ ] 1.1 Write 2-8 focused tests for employee resolver functionality
    - Test query returns array of employees
    - Test employee type FK resolution (join with ZamestnanecTyp)
    - Test fullName computation (Meno + Priezvisko without titles)
    - Test null date handling (PoslednyZaznam, ZamknuteK)
    - Skip exhaustive edge case testing
  - [ ] 1.2 Create Employee GraphQL object type
    - File: `backend/src/employees/entities/employee.entity.ts`
    - Use @ObjectType decorator (code-first approach)
    - Define 9 fields with @Field decorators:
      - id: BigInt (or String depending on scalar handling)
      - fullName: String (computed field, not from DB)
      - vacationDays: Float (from Dovolenka)
      - isAdmin: Boolean (from IsAdmin)
      - employeeType: String (resolved from ZamestnanecTyp.Typ)
      - lastRecordDate: String (from PoslednyZaznam, nullable)
      - lockedUntil: String (from ZamknuteK, nullable)
      - titlePrefix: String (from TitulPred, nullable)
      - titleSuffix: String (from TitulZa, nullable)
    - Follow pattern from health.resolver.ts entity structure
  - [ ] 1.3 Create employees resolver with listEmployees query
    - File: `backend/src/employees/employees.resolver.ts`
    - Use @Resolver, @Query decorators
    - Query name: `employees` or `listEmployees`
    - Return type: [Employee] (array)
    - Inject EmployeesService in constructor
    - Follow pattern from health.resolver.ts
  - [ ] 1.4 Create employees service with database logic
    - File: `backend/src/employees/employees.service.ts`
    - Inject PrismaService in constructor
    - Method: `findAll()` returns Promise<Employee[]>
    - Use Prisma query with `include: { ZamestnanecTyp: true }` to avoid N+1
    - Compute fullName: `${Meno} ${Priezvisko}` (without TitulPred/TitulZa)
    - Map Zamestnanci DB fields to Employee GraphQL type
    - Handle null dates gracefully (return null if not set)
    - Add try-catch with Logger for error handling
    - Follow pattern from health.service.ts
  - [ ] 1.5 Register EmployeesModule in app.module.ts
    - File: `backend/src/employees/employees.module.ts`
    - Import PrismaModule
    - Provide EmployeesService
    - Export resolver
    - Register in app.module.ts imports array
  - [ ] 1.6 Ensure employee resolver tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify GraphQL query returns correct data structure
    - Verify employee type resolved from FK
    - Verify fullName computed correctly
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- GraphQL Playground at `http://localhost:4000/graphql` shows `employees` query
- Query returns array with all 9 fields
- Employee type name resolved from ZamestnanecTyp table (not FK ID)
- Full name computed as "FirstName LastName" without titles
- Null dates handled (return null, not error)
- No N+1 query problem (single DB query with join)
- All 2-8 tests from 1.1 pass

**Testing Validation:**
```graphql
query {
  employees {
    id
    fullName
    vacationDays
    isAdmin
    employeeType
    lastRecordDate
    lockedUntil
    titlePrefix
    titleSuffix
  }
}
```

---

### Task Group 2: Frontend Navigation Sidebar
**Dependencies:** None (parallel to backend)
**Estimated Effort:** 2-3 hours
**Assigned Role:** Frontend UI Designer

- [ ] 2.0 Complete navigation sidebar component
  - [ ] 2.1 Write 2-8 focused tests for sidebar component
    - Test sidebar renders with 5 menu items
    - Test active menu item highlighted with primary orange
    - Test navigation links work correctly
    - Test icons render from Lucide React
    - Skip exhaustive interaction testing
  - [ ] 2.2 Install Lucide React icons if not present
    - Command: `cd frontend && pnpm add lucide-react`
    - Verify installation successful
  - [ ] 2.3 Create Sidebar component
    - File: `frontend/src/components/sidebar.tsx`
    - Fixed width sidebar (e.g., 240px-280px)
    - 5 menu items in vertical list:
      1. Employees - `/employees` - `Users` icon
      2. Data - `/data` - `Database` icon
      3. Overtime - `/overtime` - `Clock` icon
      4. Reports - `/reports` - `FileText` icon
      5. Admin - `/admin` - `Settings` icon
    - Each item: icon + label, wrapped in Next.js Link
    - Use `usePathname()` hook to detect active route
    - Active state: apply Tangerine primary orange color (oklch(0.6397 0.1720 36.4421))
    - Apply shadcn/ui sidebar styling variables from shadcn-config-file.txt:
      - Background: `bg-sidebar`
      - Border: `border-sidebar-border`
      - Active item: `bg-sidebar-primary text-sidebar-primary-foreground`
      - Hover: `hover:bg-sidebar-accent`
    - Use Tailwind classes for spacing, borders, rounded corners (radius: 0.75rem)
  - [ ] 2.4 Create root layout with sidebar
    - File: `frontend/src/app/layout.tsx` (update existing)
    - Layout structure: Sidebar on left (fixed), main content area on right (flex-1)
    - Import Sidebar component
    - Ensure sidebar always visible (desktop-only, no mobile handling)
    - Apply Tangerine theme CSS variables from shadcn-config-file.txt
  - [ ] 2.5 Create placeholder routes for menu items
    - Files:
      - `frontend/src/app/employees/page.tsx` (will be built in Task Group 3-5)
      - `frontend/src/app/data/page.tsx` (placeholder: "Data - Coming Soon")
      - `frontend/src/app/overtime/page.tsx` (placeholder: "Overtime - Coming Soon")
      - `frontend/src/app/reports/page.tsx` (placeholder: "Reports - Coming Soon")
      - `frontend/src/app/admin/page.tsx` (placeholder: "Admin - Coming Soon")
    - Each placeholder page: simple heading + text, same layout with sidebar
  - [ ] 2.6 Ensure sidebar component tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify sidebar renders with correct menu items
    - Verify active state highlights correctly
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- Sidebar visible on left side of all pages
- 5 menu items with correct icons and labels
- Active menu item highlighted with Tangerine orange
- Clicking menu items navigates to correct routes
- Sidebar styling matches Tangerine theme (orange primary, proper borders, spacing)
- Desktop-only layout (no mobile responsive behavior)
- All 2-8 tests from 2.1 pass

**Visual Reference:**
- `planning/visuals/Dashboard.html` - sidebar navigation pattern with active states
- `planning/visuals/shadcn-config-file.txt` - sidebar-specific CSS variables

---

### Task Group 3: Frontend Employee Table Component
**Dependencies:** Task Group 1 (backend API ready), Task Group 2 (sidebar for navigation)
**Estimated Effort:** 3-4 hours
**Assigned Role:** Frontend UI Designer

- [ ] 3.0 Complete employee table display with sorting
  - [ ] 3.1 Write 2-8 focused tests for employee table component
    - Test table renders with 9 columns
    - Test sorting functionality (ascending/descending)
    - Test date formatting for null and non-null dates
    - Test admin badge rendering (green for true, gray for false)
    - Test vacation days formatted to 1 decimal place
    - Skip exhaustive edge case testing
  - [ ] 3.2 Create GraphQL query for employees
    - File: `frontend/src/graphql/queries/employees.ts`
    - Use gql template tag
    - Define EMPLOYEES_QUERY constant
    - Query structure:
      ```typescript
      export const EMPLOYEES_QUERY = gql`
        query GetEmployees {
          employees {
            id
            fullName
            vacationDays
            isAdmin
            employeeType
            lastRecordDate
            lockedUntil
            titlePrefix
            titleSuffix
          }
        }
      `;
      ```
    - Define TypeScript interface for Employee type matching GraphQL schema
    - Follow pattern from `health.ts`
  - [ ] 3.3 Create EmployeeTable component
    - File: `frontend/src/components/employee-table.tsx`
    - Props: `employees: Employee[]` (filtered data from parent)
    - State: `sortColumn`, `sortDirection` (ascending/descending)
    - 9 columns in order:
      1. ID (narrow, 60-80px)
      2. Name (flexible, min 150px)
      3. Vacation Days (narrow, 100px)
      4. Admin (narrow, 80px)
      5. Employee Type (medium, 120px)
      6. Last Record (medium, 120px)
      7. Locked Until (medium, 120px)
      8. Title Prefix (medium, 100px)
      9. Title Suffix (medium, 100px)
    - All columns sortable: click header to toggle sort direction
    - Sort indicators: small arrow icons (ChevronUp/ChevronDown from Lucide) showing current sort state
    - Table headers: use muted background, border from Tangerine theme
    - Row hover effect: subtle background change (`hover:bg-muted/50`)
    - Use shadcn/ui Table components if available, or semantic HTML table
  - [ ] 3.4 Format table cell data correctly
    - **Name:** Display fullName from backend (already formatted without titles)
    - **Vacation Days:** Format as float with 1 decimal: `vacationDays.toFixed(1)`
    - **Admin:** Render badge component:
      - If isAdmin=true: green success badge with "Admin" or checkmark
      - If isAdmin=false: gray secondary badge with "No" or "—"
      - Use shadcn/ui Badge component with variants (success/secondary)
    - **Date columns (Last Record, Locked Until):**
      - Format non-null dates: `new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })` (e.g., "Oct 15, 2025")
      - Null dates: display "—" (em dash)
    - **Title columns:** Display as-is or "—" if null
  - [ ] 3.5 Implement client-side sorting logic
    - Sort function handles all column types:
      - Numbers (ID, Vacation Days)
      - Strings (Name, Employee Type, Titles)
      - Booleans (Admin)
      - Dates (Last Record, Locked Until) - treat null as oldest/newest
    - Toggle sort direction on header click
    - Default sort: ID ascending
  - [ ] 3.6 Apply Tangerine theme styling
    - Primary orange for sort indicators and active column header
    - Table borders: `border-border` (muted)
    - Header background: `bg-muted`
    - Card background for table container: `bg-card` with shadow
    - Use spacing from Tangerine theme (--spacing: 0.25rem)
    - Use radius for rounded corners (--radius: 0.75rem)
    - Apply typography scale from Typography.html visual
  - [ ] 3.7 Ensure employee table tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify table renders with correct columns
    - Verify sorting works for all column types
    - Verify data formatting (dates, badges, decimal places)
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- Table displays 9 columns in correct order
- All columns sortable with visual indicators
- Vacation days show 1 decimal place
- Admin status shows green badge for true, gray badge for false
- Dates formatted as "Oct 15, 2025" or "—" for null
- Name displays without titles (computed on backend)
- Table styling matches Tangerine theme (borders, colors, shadows)
- Hover effect on rows
- Table horizontally scrollable if content exceeds viewport
- All 2-8 tests from 3.1 pass

**Visual Reference:**
- `planning/visuals/Dashboard.html` - table layout, borders, row hover effects
- `planning/visuals/Cards.html` - badge styling for admin status
- `planning/visuals/shadcn-config-file.txt` - color variables for borders, muted backgrounds

---

### Task Group 4: Frontend Filter Controls
**Dependencies:** Task Group 3 (table component ready)
**Estimated Effort:** 2-3 hours
**Assigned Role:** Frontend UI Designer

- [ ] 4.0 Complete filter controls for employee list
  - [ ] 4.1 Write 2-8 focused tests for filter components
    - Test text search filters by name (case-insensitive)
    - Test admin status dropdown filters correctly
    - Test employee type dropdown filters correctly
    - Test debounced text search (300ms delay)
    - Test filter combinations work together
    - Skip exhaustive edge case testing
  - [ ] 4.2 Create FilterControls component
    - File: `frontend/src/components/filter-controls.tsx`
    - Props: `onFilterChange: (filters: FilterState) => void`
    - State: `searchText`, `adminFilter`, `employeeTypeFilter`
    - Layout: 3 filter inputs arranged horizontally with spacing
    - Styling: clear visual separation from table below (e.g., border-b or margin)
  - [ ] 4.3 Implement text search input
    - Use shadcn/ui Input component
    - Placeholder: "Search by name..."
    - Debounce input 300ms using `useDeferredValue` or custom debounce hook
    - Case-insensitive search against fullName field
    - Icon: Search icon from Lucide on left side of input
  - [ ] 4.4 Implement admin status dropdown filter
    - Use shadcn/ui Select component
    - Label: "Admin Status"
    - Options:
      - "All" (default, no filter)
      - "Admin Only" (filter isAdmin=true)
      - "Non-Admin Only" (filter isAdmin=false)
    - Apply Tangerine theme styling to dropdown
  - [ ] 4.5 Implement employee type dropdown filter
    - Use shadcn/ui Select component
    - Label: "Employee Type"
    - Options:
      - "All" (default, no filter)
      - "Zamestnanec" (Employee)
      - "SZČO" (Contractor)
      - "Študent" (Student)
      - "Part-time"
    - Note: Options based on expected values in ZamestnanecTyp table (may need to query dynamically in future)
    - Apply Tangerine theme styling
  - [ ] 4.6 Implement client-side filtering logic
    - Parent component (page) manages filter state
    - Filter employees array based on all active filters:
      - Text search: `employee.fullName.toLowerCase().includes(searchText.toLowerCase())`
      - Admin filter: `adminFilter === 'all' || employee.isAdmin === adminFilterValue`
      - Type filter: `typeFilter === 'all' || employee.employeeType === typeFilter`
    - Pass filtered employees to EmployeeTable component
  - [ ] 4.7 Ensure filter component tests pass
    - Run ONLY the 2-8 tests written in 4.1
    - Verify filters apply correctly
    - Verify debounce works for text search
    - Verify filter combinations work
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- 3 filter controls displayed horizontally above table
- Text search filters by name (case-insensitive, debounced 300ms)
- Admin status dropdown has 3 options (All, Admin Only, Non-Admin Only)
- Employee type dropdown has 5 options (All + 4 types)
- Filters work independently and in combination
- Filter controls use shadcn/ui components with Tangerine theme
- Clear visual separation between filters and table
- All 2-8 tests from 4.1 pass

**Visual Reference:**
- `planning/visuals/Dashboard.html` - input and select styling examples
- `planning/visuals/shadcn-config-file.txt` - input, select, muted colors for labels

---

### Task Group 5: Frontend State Handling (Loading, Error, Empty)
**Dependencies:** Task Groups 1-4 (all components ready)
**Estimated Effort:** 2-3 hours
**Assigned Role:** Frontend UI Designer

- [ ] 5.0 Complete state handling for employee overview page
  - [ ] 5.1 Write 2-8 focused tests for state handling
    - Test loading state displays spinner and text
    - Test error state displays message and retry button
    - Test empty state displays when no employees
    - Test retry button re-executes query
    - Test empty state adjusts message based on active filters
    - Skip exhaustive edge case testing
  - [ ] 5.2 Create employee overview page with Apollo Client integration
    - File: `frontend/src/app/employees/page.tsx`
    - Import useQuery hook from @apollo/client
    - Import EMPLOYEES_QUERY from graphql/queries/employees.ts
    - Execute query: `const { loading, error, data, refetch } = useQuery(EMPLOYEES_QUERY);`
    - Follow pattern from health-check.tsx component
  - [ ] 5.3 Implement loading state
    - Display when `loading === true`
    - Centered layout with:
      - Loader2 icon from Lucide (spinning animation)
      - "Loading..." text below icon
      - Muted text color
    - Follow pattern from health-check.tsx
  - [ ] 5.4 Implement error state
    - Display when `error` is defined
    - Centered layout with:
      - XCircle icon from Lucide (destructive color)
      - Heading: "Failed to load employees"
      - Subtitle: Error message if available (user-friendly)
      - Primary button: "Retry" that calls `refetch()`
    - Use destructive color from Tangerine theme for icon/border
    - Follow pattern from health-check.tsx
  - [ ] 5.5 Implement empty state
    - Display when `data.employees.length === 0` (after filtering)
    - Distinguish between:
      - No employees in database: "No employees found. Add your first employee to get started."
      - No filter matches: "No employees match your filters. Try adjusting your filters."
    - Centered layout with:
      - Users icon from Lucide
      - Heading: "No employees found"
      - Subtitle: Context-specific message
    - Muted text color, consistent spacing
  - [ ] 5.6 Implement success state (data loaded)
    - Display when `data` is available and `employees.length > 0`
    - Page layout:
      - Breadcrumb navigation: "Home > Employees"
      - Page title: "Employees" (large heading)
      - FilterControls component (pass filter state handlers)
      - EmployeeTable component (pass filtered employees)
    - Apply Tangerine theme typography scale for headings
    - Use card background with shadow for main content area
    - Consistent padding and spacing
  - [ ] 5.7 Integrate filter state with table display
    - Manage filter state in page component
    - Filter employees array based on current filter values
    - Pass filtered employees to EmployeeTable
    - Update empty state message based on active filters
  - [ ] 5.8 Ensure state handling tests pass
    - Run ONLY the 2-8 tests written in 5.1
    - Verify loading, error, empty, success states render correctly
    - Verify retry button works
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- Loading state shows centered spinner with "Loading..." text
- Error state shows user-friendly message with retry button
- Retry button re-executes GraphQL query
- Empty state shows appropriate message (distinguish no data vs. no matches)
- Success state shows breadcrumb, title, filters, and table
- Page uses Tangerine theme colors, typography, and spacing
- All conditional rendering works correctly
- All 2-8 tests from 5.1 pass

**Visual Reference:**
- `planning/visuals/Dashboard.html` - page title, breadcrumb, card layout
- `planning/visuals/Typography.html` - heading sizes, muted text
- `frontend/src/app/health-check/page.tsx` - loading/error state patterns

---

### Task Group 6: Integration Testing & Polish
**Dependencies:** Task Groups 1-5 (all features complete)
**Estimated Effort:** 2-3 hours
**Assigned Role:** QA Engineer / Full Stack Developer

- [ ] 6.0 Complete integration testing and final polish
  - [ ] 6.1 Review tests from Task Groups 1-5
    - Review 2-8 tests from backend (Task 1.1)
    - Review 2-8 tests from sidebar (Task 2.1)
    - Review 2-8 tests from table (Task 3.1)
    - Review 2-8 tests from filters (Task 4.1)
    - Review 2-8 tests from state handling (Task 5.1)
    - Total existing tests: approximately 10-40 tests
  - [ ] 6.2 Analyze test coverage gaps for THIS feature only
    - Identify critical end-to-end workflows lacking coverage:
      - Full user journey: navigate to employees > load data > filter > sort
      - GraphQL query execution from frontend to backend
      - Error scenarios: backend down, network error, empty database
      - Filter + sort combinations
    - Focus ONLY on gaps related to Employee Overview Feature
    - Do NOT assess entire application test coverage
    - Prioritize integration tests over unit test gaps
  - [ ] 6.3 Write up to 10 additional strategic tests maximum
    - End-to-end test: Load employees page > verify data displays
    - End-to-end test: Apply filters > verify table updates
    - End-to-end test: Sort column > verify order changes
    - Integration test: GraphQL query returns correct data structure
    - Integration test: Error handling when backend unavailable
    - Integration test: Empty state when no employees exist
    - Focus on critical workflows, skip edge cases
    - Use testing framework appropriate for stack (Jest, React Testing Library, Playwright)
  - [ ] 6.4 Run feature-specific tests only
    - Run backend tests (from Task 1.1 + any new backend tests)
    - Run frontend tests (from Tasks 2.1, 3.1, 4.1, 5.1 + any new frontend tests)
    - Expected total: approximately 20-50 tests maximum
    - Do NOT run entire application test suite
    - Verify all critical workflows pass
  - [ ] 6.5 Perform manual end-to-end testing
    - Start backend: `cd backend && pnpm start:dev`
    - Start frontend: `cd frontend && pnpm dev`
    - Test checklist:
      - [ ] Navigate to http://localhost:3000
      - [ ] Sidebar visible with 5 menu items
      - [ ] Click "Employees" menu item, navigates to /employees
      - [ ] Employee table loads and displays data
      - [ ] All 9 columns visible with correct headers
      - [ ] Employee names displayed WITHOUT titles (just "FirstName LastName")
      - [ ] Vacation days show 1 decimal place (e.g., 15.5)
      - [ ] Admin badges: green for isAdmin=true, gray for isAdmin=false
      - [ ] Dates formatted correctly or "—" for null
      - [ ] All columns sortable (click header, verify sort direction)
      - [ ] Text search filters by name (case-insensitive)
      - [ ] Admin status dropdown filters correctly
      - [ ] Employee type dropdown filters correctly
      - [ ] Multiple filters work together
      - [ ] Loading state appears during initial load
      - [ ] Empty state appears when no matches (try filter that returns nothing)
      - [ ] Error state with retry button (stop backend, reload page, verify error, click retry)
  - [ ] 6.6 Polish UI based on Tangerine theme visuals
    - Compare implementation to visual assets:
      - Dashboard.html: verify table borders, row hover, sidebar active state
      - Cards.html: verify badge styling matches success/secondary variants
      - Color Palette.html: verify primary orange used consistently
      - Typography.html: verify heading sizes match scale
      - shadcn-config-file.txt: verify CSS variables applied correctly
    - Adjust spacing, borders, shadows if needed to match visuals
    - Ensure consistent use of Tangerine primary orange (oklch(0.6397 0.1720 36.4421))
  - [ ] 6.7 Verify responsive column widths
    - ID column: 60-80px (narrow)
    - Name column: flexible, min 150px
    - Vacation Days: 100px
    - Admin: 80px
    - Employee Type: 120px
    - Date columns: 120px each
    - Title columns: 100px each
    - Table horizontally scrollable if content exceeds viewport
  - [ ] 6.8 Final validation checklist
    - [ ] Backend GraphQL query accessible in Playground (http://localhost:4000/graphql)
    - [ ] Frontend loads without console errors
    - [ ] All menu items in sidebar navigate correctly
    - [ ] Employee data matches database records
    - [ ] No N+1 query issues (check backend logs)
    - [ ] All filters and sorts work correctly
    - [ ] Loading, error, empty states display appropriately
    - [ ] Styling matches Tangerine theme across all components
    - [ ] Desktop layout only (no mobile responsive behavior)

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 20-50 tests total)
- No more than 10 additional tests added when filling testing gaps
- Manual end-to-end test checklist completed successfully
- UI styling matches Tangerine theme visual assets
- No console errors in browser or backend logs
- Employee Overview Feature fully functional and ready for user testing

**Testing Documentation:**
Based on roadmap Item 5 testing guide:
- Verify employee names displayed without titles
- Verify vacation balance shows correct float numbers
- Verify employee type displayed correctly
- Verify admin status shown as green/gray badge
- Verify all columns sortable
- Verify text search, admin filter, type filter work
- Verify loading, error, empty states

---

## Execution Order

**Recommended implementation sequence:**

1. **Backend First (Task Group 1):** Build GraphQL API with employee query, entity, resolver, service. Test in GraphQL Playground before moving to frontend.

2. **Navigation Sidebar (Task Group 2):** Create sidebar with menu items and routing. Can be developed in parallel with backend. Provides navigation structure for testing other pages.

3. **Employee Table (Task Group 3):** Build table component with sorting. Requires backend API (Task Group 1) to fetch real data. Sidebar (Task Group 2) provides navigation to employee page.

4. **Filter Controls (Task Group 4):** Add filter inputs above table. Requires table component (Task Group 3) to display filtered results.

5. **State Handling (Task Group 5):** Integrate Apollo Client, implement loading/error/empty states, connect filters to table. Brings together all components from Tasks 2-4 with backend from Task 1.

6. **Integration & Polish (Task Group 6):** End-to-end testing, gap analysis, manual validation, UI polish. Validates entire feature works together correctly.

**Parallelization opportunities:**
- Task Groups 1 and 2 can be developed in parallel (backend and sidebar are independent)
- Task Groups 3 and 4 have some overlap but should be done sequentially for easier testing

**Critical path:**
Task Group 1 (Backend API) → Task Group 3 (Table Component) → Task Group 4 (Filters) → Task Group 5 (State Handling) → Task Group 6 (Integration)

---

## Notes

**Key Technical Decisions:**
- **Client-side filtering and sorting:** Phase 1 loads all employees and filters/sorts in browser. Server-side filtering/sorting can be added in future phases if dataset grows.
- **No pagination:** Expected employee count < 100 for target market (small-medium Slovak businesses).
- **Desktop-only layout:** Mobile responsiveness comes in Phase 12 (Item 39).
- **Computed fullName on backend:** Backend concatenates Meno + Priezvisko without titles, simplifying frontend logic.
- **BigInt ID handling:** May need custom GraphQL scalar or convert to String depending on @nestjs/graphql BigInt support.

**Reusability for Future Features:**
- EmployeeTable component pattern can be reused for other list screens (projects, work records)
- FilterControls pattern reusable across all list features
- Loading/error/empty state patterns reusable everywhere
- Sidebar navigation component used throughout application

**Testing Philosophy:**
- Each task group writes 2-8 focused tests during development (NOT exhaustive)
- Task Group 6 adds maximum 10 additional tests to fill critical gaps
- Total tests approximately 20-50 (not thousands)
- Focus on critical user workflows and integration points
- Manual end-to-end validation complements automated tests

**Dependencies Outside This Spec:**
- Spec 001 scaffolding (backend, frontend, database, Apollo Client, shadcn/ui)
- Zamestnanci and ZamestnanecTyp tables exist in database
- Prisma schema generated with both models
- TailwindCSS v4 with Tangerine theme configured

**File Structure:**
```
backend/src/employees/
├── entities/
│   └── employee.entity.ts
├── employees.module.ts
├── employees.resolver.ts
├── employees.service.ts
└── __tests__/
    └── employees.service.spec.ts

frontend/src/
├── app/
│   ├── layout.tsx (updated)
│   ├── employees/
│   │   └── page.tsx
│   ├── data/
│   │   └── page.tsx (placeholder)
│   ├── overtime/
│   │   └── page.tsx (placeholder)
│   ├── reports/
│   │   └── page.tsx (placeholder)
│   └── admin/
│       └── page.tsx (placeholder)
├── components/
│   ├── sidebar.tsx
│   ├── employee-table.tsx
│   └── filter-controls.tsx
├── graphql/
│   └── queries/
│       └── employees.ts
└── __tests__/
    ├── sidebar.test.tsx
    ├── employee-table.test.tsx
    ├── filter-controls.test.tsx
    └── employees-page.test.tsx
```

---

**Task Breakdown Document Complete**

This comprehensive task breakdown provides clear, actionable tasks organized by technical specialization (backend, frontend UI, QA), with explicit dependencies, acceptance criteria, and testing validation for the Employee Overview Feature implementation.
