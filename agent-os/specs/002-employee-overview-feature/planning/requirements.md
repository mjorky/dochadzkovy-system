# Spec Requirements: Employee Overview Feature

## Initial Description

This spec implements Items 2-5 from Phase 1 of the product roadmap as they are interconnected components. These items form the first complete, testable feature that displays employee information in the web application:

- **Item 2:** GraphQL query to list employees
- **Item 3:** Navigation sidebar with menu items
- **Item 4:** Apollo Client integration to fetch employee data
- **Item 5:** Employee Overview Screen showing employee details

### Context

This is the second spec in the project. The first spec (001-project-scaffolding-database-connection) established the infrastructure:
- Backend NestJS with GraphQL on port 4000
- Frontend Next.js on port 3000
- Prisma ORM with 37 generated models including Employee (Zamestnanci)
- Database: PostgreSQL at localhost:5433
- TailwindCSS v4 with shadcn/ui (Tangerine theme)
- Apollo Client configured
- Health check endpoints working

## Requirements Discussion

### First Round Questions

**Q1:** Which fields from the Zamestnanci table should be displayed on the Employee Overview screen?

**Answer:** Display ONLY the fields that currently exist in the database:
- ID (BigInt)
- Meno + Priezvisko (Name - displayed without titles)
- Dovolenka (Vacation days - Float)
- IsAdmin (Boolean - admin status)
- TypZamestnanca (Employee Type - String/FK)
- PoslednyZaznam (Last Record date - Date)
- ZamknuteK (Locked Until date - Date)
- TitulPred (String)
- TitulZa (String)

**Q2:** Should names be displayed with or without academic titles?

**Answer:** Display names WITHOUT titles - just "John Doe" format (not "Ing. John Doe, PhD."). The database stores titles (TitulPred, TitulZa), they are displayed in the last two columns in the employee overview table.

**Q3:** Should Employee Type (TypZamestnanca) be displayed as a column?

**Answer:** YES, display Employee Type as a column in the employee table.

**Q4:** Which columns should be sortable in the employee table?

**Answer:** ALL columns should be sortable (ID, Name, Vacation Days, Admin Status, Employee Type, Last Record Date, Locked Until Date, TitulPred, TitulZa).

**Q5:** What filtering capabilities are needed?

**Answer:**
- Text search by name
- Filter by Admin status (dropdown: All / Admin / Non-Admin)
- Filter by Employee Type (dropdown: All / Employee / Contractor / Student / Part-time)

**Q6:** Should vacation days, last record date, and locked until date all be displayed?

**Answer:** YES, display ALL of them:
- Vacation days (Dovolenka) - as float number
- Last Record date (PoslednyZaznam) - as formatted date
- Locked Until date (ZamknuteK) - as formatted date

**Q7:** What about loading states, error handling, and empty states?

**Answer:**
- **Loading:** Simple "Loading..." spinner
- **Error:** User-friendly message with retry button
- **Empty state:** "No employees found" message with icon

**Q8:** What navigation menu items should be included in the sidebar?

**Answer:** Include ALL legacy menu items from the product roadmap:
- Employee (Zamestnanec)
- Data (Dáta)
- Overhead/Overtime (Nadčasy)
- Reports (Výkazy)
- Admin (Administrácia)

**Q9:** Should the navigation use icons?

**Answer:** YES, use Lucide React icons. The spec-writer should suggest appropriate icons for each menu item based on their functionality.

**Q10:** What should the page title and breadcrumb navigation show?

**Answer:**
- Page title: "Employees"
- Breadcrumb navigation showing current location

**Q11:** Should the UI be responsive for mobile devices?

**Answer:** NO, desktop-focused only. This is mentioned in Phase 1 (Item 5) as a simple card layout. Mobile responsiveness comes later in Phase 12 (Item 39).

**Q12:** Should there be pagination for the employee list?

**Answer:** NO, load all employees at once. The system is for small to medium Slovak businesses, so the employee count is expected to be manageable (< 100 employees typically).

### Existing Code to Reference

This is the first feature being built on top of the scaffolding from spec 001. You can ceck if tehre are any helpful knowledge connected to the backend logic in project `/Users/miro/Projects/dochadzkovy-system/dochadzka-master`. It is aslo documented in folder `/Users/miro/Projects/dochadzkovy-system/docs`, so check for any references there.

### Follow-up Questions

No follow-up questions were needed. All requirements were clarified in the initial discussion.

## Visual Assets

### Files Provided:
The user provided visual reference files from the tweakcn Theme Generator showcasing the Tangerine theme in various UI contexts:

1. **shadcn-config-file.txt** - Complete Tangerine theme configuration with all CSS variables
2. **tweakcn — Theme Generator for shadcn_ui - Dashboard.html** - Dashboard layout example (MOST RELEVANT for employee overview screen)
3. **tweakcn — Theme Generator for shadcn_ui - Cards.html** - Card component examples with Tangerine theme
4. **tweakcn — Theme Generator for shadcn_ui - Color Palette.html** - Complete color palette showcase
5. **tweakcn — Theme Generator for shadcn_ui - Mail.html** - Mail application layout example
6. **tweakcn — Theme Generator for shadcn_ui - Typography.html** - Typography examples

### Visual Insights:

**Key Visual References for Implementation:**

1. **Dashboard.html** - Primary reference for employee overview screen:
   - Shows data table layout with the Tangerine theme applied
   - Demonstrates sidebar navigation with active state highlighting
   - Shows card-based metrics display (can be adapted for employee stats)
   - Demonstrates proper use of primary orange color (`oklch(0.6397 0.1720 36.4421)`) for active states

2. **Cards.html** - Reference for UI components:
   - Shows badge styling (relevant for Admin status badges)
   - Demonstrates button variants with Tangerine theme
   - Shows card layouts with proper shadows and borders

3. **Color Palette.html** - Reference for consistent color usage:
   - Primary (orange): For active sidebar items, sort indicators, primary buttons
   - Success (green): For active employee badges, positive indicators
   - Destructive (red): For inactive/non-admin badges
   - Muted/Secondary: For table borders, secondary text

4. **Typography.html** - Reference for text hierarchy:
   - Page titles ("Employees")
   - Table headers and body text
   - Filter labels and placeholders
   - Empty state messages

**Design Patterns to Extract:**
- **Sidebar navigation:** Use Dashboard.html as reference for sidebar layout with icons and active states
- **Table styling:** Extract table header, row, and cell styling from Dashboard.html
- **Badge components:** Use Cards.html badge examples for Admin status indicators
- **Color application:** Follow Color Palette.html for consistent use of Tangerine theme colors
- **Typography scale:** Use Typography.html for proper heading and body text sizes

**Specific Implementation Notes:**
- Active sidebar item: Apply primary orange background/text color as shown in Dashboard.html
- Table headers: Use border and background from Dashboard.html table examples
- Admin badges: Green badge (success variant) for admins, red/gray (destructive/secondary) for non-admins
- Sort indicators: Small orange arrows/icons next to column headers
- Filter controls: Use input and select styling from Dashboard.html
- Loading/error states: Centered content area with appropriate spacing and colors

## Requirements Summary

### Functional Requirements

#### Database Integration
- **Database Table:** `Zamestnanci` (Employee master table)
- **Fields to Query:**
  - `ID` (BigInt) - Employee ID
  - `Meno` (String) - First name
  - `Priezvisko` (String) - Last name
  - `TitulPred` (String) - Title prefix (stored but not displayed)
  - `TitulZa` (String) - Title suffix (stored but not displayed)
  - `Dovolenka` (Float) - Vacation days remaining
  - `IsAdmin` (Boolean) - Admin flag
  - `TypZamestnanca` (String/FK) - Employee type reference
  - `PoslednyZaznam` (Date) - Date of last work record entry
  - `ZamknuteK` (Date) - Attendance locked until this date

#### GraphQL API (Item 2)
- **Query Name:** `employees` or `listEmployees`
- **Return Type:** Array of Employee objects
- **Filtering Support:**
  - By name (text search - case insensitive)
  - By admin status (Boolean filter)
  - By employee type (String filter)
- **Sorting Support:** All columns sortable
- **Data Requirements:**
  - Join with `ZamestnanecTyp` table to resolve employee type name
  - Compute full name without titles (concatenate Meno + Priezvisko only)

#### Apollo Client Integration (Item 4)
- **Client Configuration:**
  - Already configured in spec 001
  - Backend endpoint: `http://localhost:4000/graphql`
  - Use Apollo Client hooks (`useQuery`)
- **Query Execution:**
  - Fetch all employees on page load
  - Handle loading state with spinner
  - Handle errors with user-friendly message and retry button
  - Handle empty state when no employees exist

#### Navigation Sidebar (Item 3)
- **Menu Items (in order):**
  1. **Employee** (Zamestnanec) - Links to `/employees` - Icon: User/Users from Lucide
  2. **Data** (Dáta) - Links to `/data` (placeholder) - Icon: Database/Table
  3. **Overhead/Overtime** (Nadčasy) - Links to `/overtime` (placeholder) - Icon: Clock/Timer
  4. **Reports** (Výkazy) - Links to `/reports` (placeholder) - Icon: FileText/BarChart
  5. **Admin** (Administrácia) - Links to `/admin` (placeholder) - Icon: Settings/Shield

- **Sidebar Behavior:**
  - Always visible on left side
  - Highlight active menu item with Tangerine orange primary color
  - Use Lucide React icons (spec-writer should suggest specific icons)
  - Show icon + label for each menu item
  - Desktop layout only (no mobile hamburger menu yet)

#### Employee Overview Screen (Item 5)
- **Page Layout:**
  - Page title: "Employees"
  - Breadcrumb navigation (e.g., "Home > Employees")
  - Filter controls above table
  - Employee data table
  - No pagination (show all employees)

- **Filter Controls:**
  - **Name Search:** Text input with placeholder "Search by name..."
  - **Admin Status Filter:** Dropdown with options:
    - All
    - Admin
    - Non-Admin
  - **Employee Type Filter:** Dropdown with options:
    - All
    - Employee (Zamestnanec)
    - Contractor (SZČO)
    - Student
    - Part-time

- **Table Columns (in order):**
  1. **ID** - Employee ID number (sortable)
  2. **Name** - Full name WITHOUT titles, format: "FirstName LastName" (sortable)
  3. **Vacation Days** - Float number (e.g., 15.5) (sortable)
  4. **Admin** - Boolean displayed as badge:
     - Green badge with checkmark for IsAdmin=true
     - Red/gray badge with X or "—" for IsAdmin=false
     (sortable)
  5. **Employee Type** - String from TypZamestnanca (sortable)
  6. **Last Record** - Date formatted (e.g., "2025-10-15" or "Oct 15, 2025") (sortable)
  7. **Locked Until** - Date formatted or "—" if null (sortable)
  8. **Title in front** - String from TitlePred (sortable)
  9. **Title behind** - String from TitleZa (sortable) 

- **Table Behavior:**
  - All columns sortable (ascending/descending)
  - Hover effect on rows
  - No row actions (read-only view)
  - Responsive column widths

- **Loading State:**
  - Simple centered spinner with "Loading..." text
  - Displays while GraphQL query is fetching

- **Error State:**
  - User-friendly error message (e.g., "Failed to load employees")
  - Display error details if available
  - Retry button to re-execute query

- **Empty State:**
  - Display when no employees match filters or database is empty
  - Message: "No employees found"
  - Icon (e.g., Users icon from Lucide)
  - If filters are active, suggest "Try adjusting your filters"

### Reusability Opportunities

No existing components or features to reuse. This is the foundational UI screen that will establish patterns for future features.

**Opportunities for Future Reuse:**
- The data table component built here can be reused for:
  - Projects list (Admin > Projects, Item 16)
  - Employees list in admin section (Admin > Employees, Item 19)
  - Work records table (Data screen, Item 7)
- The filter pattern (text search + dropdowns) can be reused across all list screens
- The sidebar navigation component will be used throughout the application
- Loading/error/empty state patterns will be reused everywhere

### Scope Boundaries

#### In Scope:
- GraphQL query to fetch all employees with filtering support
- Navigation sidebar with all 5 menu items and icons
- Employee overview screen with table display
- Text search and dropdown filters (Name, Admin status, Employee Type)
- Column sorting (all columns)
- Loading, error, and empty state handling
- Display employee data without titles
- Display admin status as badge
- Display vacation days as float
- Display dates (Last Record, Locked Until)
- Desktop layout only
- Integration with Apollo Client
- Tangerine theme styling from shadcn/ui

#### Out of Scope:
- Employee creation/editing/deletion (comes in Item 20-22, Phase 6)
- Mobile responsive design (comes in Item 39, Phase 12)
- Pagination (not needed for expected employee count)
- Authentication and authorization (comes in Items 34-36, Phase 11)
- Bilingual support Slovak/English (comes in Item 37, Phase 12)
- Employee detail view (individual employee page)
- Overtime totals in employee table (comes in Item 19, Phase 6)
- Exporting employee list to CSV
- Bulk actions on employees
- Profile pictures or avatars
- Advanced search (by date range, by vacation balance, etc.)
- User preferences for table layout
- Real-time updates via GraphQL subscriptions

### Technical Considerations

#### Technology Stack Reference
Based on `agent-os/product/tech-stack.md`:

**Backend:**
- NestJS with GraphQL (code-first approach using `@nestjs/graphql`)
- Apollo Server integration
- Prisma ORM for database access
- TypeScript decorators for schema definition (`@ObjectType`, `@Field`, `@Query`)
- GraphQL Playground available at `http://localhost:4000/graphql`

**Frontend:**
- Next.js 14+ with App Router
- Apollo Client (`@apollo/client`)
- TailwindCSS v4
- shadcn/ui components (Radix UI primitives)
- Lucide React for icons
- TypeScript (strict mode)
- React Hook Form for filters (optional, can use simple state)
- Zod for filter validation (optional)

**Database:**
- PostgreSQL at `localhost:5433`
- Schema unchanged from legacy system
- `Zamestnanci` table with all employee data
- `ZamestnanecTyp` table for employee type lookup
- Foreign key: `Zamestnanci.TypZamestnanca` → `ZamestnanecTyp.ID`

#### GraphQL Schema Considerations
- **Employee Type Resolution:**
  - Backend should resolve `TypZamestnanca` FK to the actual employee type name
  - Join with `ZamestnanecTyp` table in resolver
  - Return type name as string (e.g., "Zamestnanec", "SZČO", "Študent", "Part-time")

- **Full Name Composition:**
  - Backend should compute full name: `${Meno} ${Priezvisko}`
  - Do NOT include `TitulPred` or `TitulZa` in the displayed name
  - Example: Database has "Ing.", "Anna", "Lovasova", "PhD." → Display "Anna Lovasova"

- **Date Formatting:**
  - Backend returns dates as ISO strings or Date scalar
  - Frontend formats dates for display (localized or standard format)
  - Handle null dates (e.g., `ZamknuteK` may be null if not locked)

#### Performance Considerations
- **Query Optimization:**
  - Single query fetches all employees (no N+1 problem)
  - Use Prisma `include` to join with `ZamestnanecTyp`
  - Expected dataset size: < 100 employees (no pagination needed)
  - Query should complete in < 200ms

- **Frontend Rendering:**
  - Render table efficiently (virtualization not needed for < 100 rows)
  - Debounce text search filter (300ms delay)
  - Apply filters client-side (no need for server-side filtering yet)

#### Icon Suggestions for Sidebar
Using Lucide React icons:
1. **Employee** - `Users` or `User` icon
2. **Data** - `Database` or `Table` icon
3. **Overhead/Overtime** - `Clock` or `Timer` or `Hourglass` icon
4. **Reports** - `FileText` or `BarChart` or `FileBarChart` icon
5. **Admin** - `Settings` or `Shield` or `Lock` icon

(Spec-writer should finalize icon selection based on visual consistency)

#### Styling Requirements - Tangerine Theme
From spec 001, the Tangerine theme is configured with:
- **Primary Color:** `oklch(0.6397 0.1720 36.4421)` (Tangerine orange)
- **Usage:**
  - Active sidebar menu item highlighted with primary color
  - Badge for admin status:
    - Green badge (success variant) for IsAdmin=true
    - Red or gray badge (destructive or secondary variant) for IsAdmin=false
  - Sort indicators in table headers
  - Retry button (primary button variant)

#### Integration Points
- **Backend GraphQL Endpoint:** `http://localhost:4000/graphql`
- **Frontend Development Server:** `http://localhost:3000`
- **CORS:** Already configured in spec 001 to allow frontend origin
- **Apollo Client:** Already configured in spec 001 with InMemoryCache

#### Error Handling Patterns
- **GraphQL Errors:**
  - Display user-friendly message (not raw GraphQL error)
  - Example: "Failed to load employees. Please try again."
  - Show retry button that re-executes query
  - Log detailed error to console for debugging

- **Network Errors:**
  - Detect network failure vs. GraphQL error
  - Message: "Network error. Please check your connection."
  - Retry button available

- **Empty Results:**
  - Distinguish between "no data" and "no matches"
  - If filters active: "No employees match your filters. Try adjusting them."
  - If no filters: "No employees found. Add your first employee to get started."

#### Accessibility Considerations
- **Keyboard Navigation:**
  - Table rows focusable with keyboard
  - Filters accessible via Tab key
  - Sort icons accessible (button role)

- **Screen Reader Support:**
  - Table headers with proper `<th>` tags
  - Sort state announced (e.g., "Sorted by Name, ascending")
  - Loading/error states announced with ARIA live regions

- **Color Contrast:**
  - Ensure badge colors meet WCAG AA contrast requirements
  - Tangerine orange primary color should have sufficient contrast on backgrounds

#### Testing Strategy (for spec-writer to note)
Based on roadmap testing guide for Item 5:
- Open `http://localhost:3000` and click "Employee" in sidebar
- Verify employee names displayed without titles
- Verify vacation balance shows correct float numbers
- Verify employee type displayed correctly
- Verify admin status shown as badge (green/red)
- Verify all columns sortable (click headers)
- Verify text search filters by name
- Verify dropdown filters work (Admin status, Employee Type)
- Verify loading state appears during fetch
- Verify error state with retry button if backend is down
- Verify empty state if no employees exist

#### Potential Issues and Solutions
1. **Issue:** Employee type may be stored as FK ID, not name
   - **Solution:** Backend resolver must join with `ZamestnanecTyp` table and return type name

2. **Issue:** Vacation days may display with too many decimal places
   - **Solution:** Format to 1 decimal place (e.g., 15.5) in frontend

3. **Issue:** Date fields may be null
   - **Solution:** Display "—" or "N/A" for null dates (e.g., ZamknuteK)

4. **Issue:** Sorting may not work correctly for null dates
   - **Solution:** Treat null dates as "oldest" or "newest" depending on sort direction

5. **Issue:** Text search may be case-sensitive
   - **Solution:** Backend should perform case-insensitive search using SQL `ILIKE` or Prisma `contains` with `mode: 'insensitive'`

6. **Issue:** Filter dropdown options may not match database values
   - **Solution:** Query `ZamestnanecTyp` table to get actual employee type names for dropdown, or hardcode based on known types

#### Future Enhancements (Out of Scope but Noted)
- Add employee detail modal/page (click row to view full details)
- Add "Export to CSV" button
- Add column visibility toggle (show/hide columns)
- Add saved filter presets
- Add bulk selection for future bulk actions
- Add avatar/profile picture support
- Integrate with authentication to show only authorized employees
- Add real-time updates when employees are added/edited by other users (GraphQL subscriptions)

## Product Context Alignment

### Mission Alignment
This feature aligns with the product mission by:
- Providing the first testable web-based screen for workforce management
- Modernizing from legacy C# WPF desktop app to accessible web interface
- Enabling Slovak businesses to manage employee data from any browser
- Supporting bilingual teams (Slovak names displayed correctly, English UI later)

### Roadmap Alignment
- **Phase 1, Items 2-5:** This spec implements the foundational feature
- **Directly enables:** Testing of GraphQL backend, Apollo Client integration, and UI framework
- **Unblocks:** All future features that require employee selection (work records, overtime, reports, admin functions)
- **Validates:** Tech stack choices (NestJS, Next.js, GraphQL, shadcn/ui)

### User Benefit
- **Employees:** Can see their basic profile info (vacation balance, locked dates) in web browser
- **Managers:** Can view team member details without desktop app installation
- **Admins:** Get first view of employee master data in preparation for future CRUD operations (Phase 6)

---

**Requirements Documentation Complete**

This comprehensive requirements document captures all clarifications, technical specifications, and scope boundaries for the Employee Overview Feature. The spec-writer can now proceed to create the detailed specification for implementation.
