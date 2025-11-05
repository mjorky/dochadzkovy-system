# Specification: Employee Overview Feature

## Goal
Build the first complete user-facing feature: a navigable employee overview screen that displays all employee data from the database with filtering and sorting capabilities, establishing the foundational UI patterns for the application.

## User Stories
- As a manager, I want to view a list of all employees with their key information so that I can quickly see team composition and employee status
- As an admin, I want to filter and sort employees by various attributes so that I can find specific employees or analyze employee data efficiently

## Specific Requirements

**GraphQL Query for Employee List**
- Create resolver `employees` or `listEmployees` that returns array of Employee objects
- Query must join Zamestnanci table with ZamestnanecTyp table to resolve employee type name from FK
- Compute fullName field by concatenating Meno + Priezvisko without titles (TitulPred and TitulZa excluded from name but available as separate fields)
- Return all 9 required fields: ID, fullName, vacation days, admin status, employee type name, last record date, locked until date, TitulPred, TitulZa
- Handle null dates gracefully (PoslednyZaznam and ZamknuteK may be null)
- No pagination needed - return all employees in single query
- Use PrismaService with proper includes/joins to avoid N+1 queries
- Follow NestJS GraphQL code-first approach with @ObjectType, @Field, @Query decorators

**Navigation Sidebar Component**
- Create reusable sidebar component with 5 menu items displayed vertically
- Menu items in order: Employees (Users icon), Data (Database icon), Overtime (Clock icon), Reports (FileText icon), Admin (Settings icon)
- Use Lucide React icons for all menu items
- Active menu item highlighted with Tangerine primary orange color (oklch(0.6397 0.1720 36.4421))
- Each menu item shows icon + label, links to respective route (/employees, /data, /overtime, /reports, /admin)
- Sidebar always visible on left side, fixed width appropriate for desktop
- Apply shadcn/ui sidebar styling with proper borders and spacing from Tangerine theme
- Desktop-only layout, no mobile hamburger menu or responsive behavior

**Apollo Client Query Integration**
- Create GraphQL query document using gql template tag following pattern from health.ts
- Define TypeScript interface for Employee data matching GraphQL schema
- Use useQuery hook in employee overview page component to fetch data on mount
- Implement proper loading state with centered spinner and "Loading..." text
- Implement error state with user-friendly message and retry button that re-executes query
- Handle empty state when no employees returned (distinguish between empty database and no filter matches)
- No caching strategy changes needed - use default InMemoryCache from apollo-client.ts
- Follow existing pattern from health-check.tsx component structure

**Employee Data Table Display**
- Display 9 columns in specific order: ID, Name, Vacation Days, Admin, Employee Type, Last Record, Locked Until, Title Prefix, Title Suffix
- Name column displays fullName computed on backend (Meno + Priezvisko without titles)
- Vacation Days displayed as float with 1 decimal place (e.g., "15.5")
- Admin column shows badge: green success badge with checkmark text for IsAdmin=true, gray secondary badge with "No" for IsAdmin=false
- Employee Type displays resolved type name from ZamestnanecTyp table
- Last Record and Locked Until display formatted dates (e.g., "Oct 15, 2025") or "—" for null values
- All 9 columns sortable with sort indicators (small arrow icons) in headers showing current sort state
- Table headers use border and muted background from Tangerine theme
- Row hover effect with subtle background change

**Filter Controls Above Table**
- Three filter inputs arranged horizontally: text search input, admin status dropdown, employee type dropdown
- Text search input with placeholder "Search by name...", debounced 300ms, case-insensitive search against fullName
- Admin status dropdown with options: All (default), Admin Only, Non-Admin Only
- Employee Type dropdown with options: All (default), plus all types from ZamestnanecTyp table (expect: Zamestnanec, SZČO, Študent, Part-time)
- Filters applied client-side to loaded data (no backend filtering needed for Phase 1)
- Filter controls use shadcn/ui Input and Select components with Tangerine theme styling
- Clear visual separation between filters and table (spacing/divider)

**Loading, Error, and Empty States**
- Loading state: centered spinner (Loader2 from Lucide) with "Loading..." text below, displayed while useQuery loading=true
- Error state: centered error message "Failed to load employees" with error details if available, plus primary button "Retry" that calls refetch function
- Error styling uses destructive color from Tangerine theme for icon/border
- Empty state when no employees: centered Users icon, "No employees found" heading, subtitle "Try adjusting your filters" if filters active
- All states centered in main content area with consistent spacing

**Page Layout and Breadcrumbs**
- Page title "Employees" as large heading at top of main content area
- Breadcrumb navigation showing "Home > Employees" above page title
- Main content area takes remaining space to right of sidebar
- Filter controls, then table below, both within main content area with consistent padding
- Use shadcn/ui typography scale from Tangerine theme for headings and body text

**TypeScript Types and Interfaces**
- Define Employee interface matching GraphQL schema with all 9 fields properly typed
- ID as string or number depending on GraphQL BigInt scalar handling
- Dates as string (ISO format) or Date objects with proper null handling
- Create shared type definitions that can be reused in future employee-related features
- Strict TypeScript mode compliance

**Responsive Column Widths**
- ID column: narrow fixed width (60-80px)
- Name column: flexible width, minimum 150px
- Vacation Days: narrow fixed width (100px)
- Admin badge: narrow fixed width (80px)
- Employee Type: medium fixed width (120px)
- Date columns: medium fixed width (120px each)
- Title columns: medium fixed width (100px each)
- Table horizontally scrollable if content exceeds viewport width (acceptable for desktop-only)

**Tangerine Theme Color Application**
- Primary orange (oklch(0.6397 0.1720 36.4421)) for active sidebar, sort indicators, primary buttons
- Success green (badge variant) for Admin=true badges
- Secondary gray (badge variant) for Admin=false badges
- Muted colors for table borders, secondary text, filter labels
- Card background for main content area with subtle shadow
- Follow all CSS variables from shadcn-config-file.txt

## Visual Design

**`planning/visuals/tweakcn — Theme Generator for shadcn_ui - Dashboard.html`**
- Extract sidebar navigation pattern with icon+label menu items and active state styling
- Use table header styling with borders and muted backgrounds for column headers
- Apply hover effects on table rows following dashboard table examples
- Use card-based layout for main content area with proper shadows and spacing
- Follow spacing patterns for filter controls and content sections
- Apply Tangerine primary orange color for interactive elements and active states
- Use demonstrated badge styling patterns for admin status badges
- Follow typography hierarchy for page titles, section headers, and body text

**`planning/visuals/tweakcn — Theme Generator for shadcn_ui - Cards.html`**
- Reference badge component variants for admin status display (success/secondary)
- Use button styling for retry button in error state (primary variant)
- Apply card borders and shadows consistently across all card-like elements

**`planning/visuals/shadcn-config-file.txt`**
- Use exact CSS variable values for primary, secondary, muted, destructive colors
- Apply radius value (0.75rem) for all rounded corners
- Use shadow variables for card and table shadows
- Follow font family hierarchy (Inter for sans, JetBrains Mono for mono)
- Implement sidebar-specific color variables for navigation

**`planning/visuals/tweakcn — Theme Generator for shadcn_ui - Color Palette.html`**
- Reference for consistent color usage across all UI elements
- Primary orange for active/interactive elements
- Success green for positive indicators
- Destructive red for errors
- Muted for borders and secondary text

**`planning/visuals/tweakcn — Theme Generator for shadcn_ui - Typography.html`**
- Use proper heading sizes for page title ("Employees")
- Apply body text sizing for table cells and filter labels
- Use muted text color for placeholders and secondary information
- Follow demonstrated text hierarchy for breadcrumbs

## Existing Code to Leverage

**Backend: health.resolver.ts and health.service.ts patterns**
- Follow @Resolver, @Query decorator pattern for employees resolver
- Use PrismaService injection in service constructor like health.service.ts
- Implement try-catch error handling with Logger for database queries
- Return proper GraphQL object types with @ObjectType, @Field decorators
- Create separate DTO/entity file for Employee type definition

**Frontend: health-check.tsx component structure**
- Replicate useQuery hook pattern with loading, error, data destructuring
- Use same Lucide icons (Loader2, XCircle, CheckCircle2) for consistent iconography
- Follow conditional rendering pattern for loading/error/success states
- Apply same Tangerine theme classes for cards, borders, colors
- Maintain consistent spacing and layout patterns

**Frontend: health.ts GraphQL query pattern**
- Use gql template tag for query definition
- Co-locate TypeScript interface with query export
- Follow naming convention (uppercase QUERY constant, typed Data interface)
- Create in /src/graphql/queries/employees.ts following same structure

**Frontend: apollo-client.ts configuration**
- No changes needed - existing client configuration sufficient
- HttpLink already pointing to localhost:4000/graphql
- InMemoryCache ready for employee data caching
- Credentials included for future authentication

**Prisma Schema: Zamestnanci and ZamestnanecTyp models**
- Use Prisma relation Zamestnanci.ZamestnanecTyp for type resolution
- Access fields ID, Meno, Priezvisko, TitulPred, TitulZa, Dovolenka, IsAdmin, TypZamestnanca, PoslednyZaznam, ZamknuteK
- Join with ZamestnanecTyp using include in Prisma query to get Typ field
- Handle BigInt ID serialization for GraphQL (may need custom scalar or string conversion)

## Out of Scope
- Employee creation, editing, or deletion functionality (Phase 6, Items 20-22)
- Mobile responsive design and hamburger menu (Phase 12, Item 39)
- Pagination or infinite scroll for employee list
- Authentication and authorization (Phase 11, Items 34-36)
- Bilingual support Slovak/English (Phase 12, Item 37)
- Individual employee detail page or modal on row click
- Overtime hours display in employee table (Phase 6, Item 19)
- CSV export functionality
- Bulk operations on employees
- Profile pictures or avatars
- Advanced filtering by date ranges or vacation balance
- User preferences for table column visibility or layout
- Real-time updates via GraphQL subscriptions
- Server-side filtering or sorting (all client-side for Phase 1)
- Dark mode toggle (theme already supports dark mode CSS but no toggle UI)
