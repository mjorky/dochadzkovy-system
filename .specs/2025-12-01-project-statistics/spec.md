# Project Statistics Feature Specification

**Version:** 1.0  
**Date:** 2025-12-01  
**Status:** Ready for Implementation

---

## 1. Overview

### 1.1 Summary
Add a "Project Statistics" section to the "Prehľad" (Overview/Balances) page that displays aggregated work hours per project within a date range. The feature provides employees with a clear breakdown of their work across projects, including hours split by productivity type and location, with man-day calculations.

### 1.2 Goals
- Allow users to see their project work statistics for any date range
- Provide hour breakdowns by type: Productive SK, Non-Productive SK, Productive Z, Non-Productive Z
- Calculate and display man-days (MD = Total Hours / 8)
- Enable admins/managers to view statistics for any employee
- Support filtering by Project ID and Project Name within the table

### 1.3 Non-Goals
- PDF export of statistics (out of scope for this feature)
- Editing work records from this view
- Historical comparison charts

---

## 2. User Stories

### 2.1 Regular Employee
> As an employee, I want to see a summary of my hours per project for a selected date range, so I can track my work distribution.

### 2.2 Admin/Manager
> As an admin or manager, I want to select any employee and view their project statistics, so I can monitor team productivity.

### 2.3 Filtering
> As a user, I want to filter the displayed projects by ID or name, so I can quickly find specific project data.

---

## 3. Functional Requirements

### 3.1 Employee Selection (Role-Based)

| User Role | Behavior |
|-----------|----------|
| **Admin** | Dropdown visible with all employees. Can view any employee's data. |
| **Manager** | Dropdown visible with managed employees. Can view managed employees' data. |
| **Regular User** | No dropdown visible. Only sees their own data. |

**Implementation:** Reuse `EmployeeSelector` component from `components/employee-selector.tsx`

### 3.2 Date Range Filter

- **Default:** Last 30 days (from `today - 30 days` to `today`)
- **Controls:** Two `DatePicker` components (From / To)
- **Validation:** "From" date cannot be after "To" date
- **Today Button:** Each date picker includes the "Today" button for quick navigation

### 3.3 Statistics Table

#### 3.3.1 Columns

| Column | Type | Filter | Sort | Description |
|--------|------|--------|------|-------------|
| Project Number | String | Checkbox multi-select | Yes | Project identifier |
| Project Name | String | Text search | Yes | Full project name |
| Productive SK | Number | No | Yes | Productive hours in Slovakia |
| Non-Prod SK | Number | No | Yes | Non-productive hours in Slovakia |
| Productive Z | Number | No | Yes | Productive hours abroad |
| Non-Prod Z | Number | No | Yes | Non-productive hours abroad |
| Total Hours | Number | No | Yes | Sum of all hour columns |
| Man Days | Number | No | Yes | Total Hours / 8 |

#### 3.3.2 Summary Row
- Fixed at bottom of table (within scroll area)
- Shows totals for each numeric column
- Bold styling to distinguish from data rows

#### 3.3.3 Empty State
- Display: "No data available for selected period"
- Standard empty state styling (centered, muted text)

### 3.4 Table Filtering (Client-Side)

Reuse `ColumnFilterHeader` pattern from existing tables:

**Project Number Filter:**
- Popover with checkboxes for each unique project number
- Multi-select capability
- "Clear filter" button

**Project Name Filter:**
- Popover with text search input
- Case-insensitive partial matching
- "Clear search" button

---

## 4. Technical Specification

### 4.1 New Components

#### `ProjectStatisticsSection`
**Path:** `frontend/src/components/project-statistics-section.tsx`

```typescript
interface ProjectStatisticsSectionProps {
  employeeId: string;
  isAdmin: boolean;
  isManager: boolean;
}
```

**Responsibilities:**
- Employee selector (conditionally rendered)
- Date range pickers
- Fetches data via GraphQL
- Renders `ProjectStatisticsTable`

#### `ProjectStatisticsTable`
**Path:** `frontend/src/components/project-statistics-table.tsx`

```typescript
interface ProjectStatisticsItem {
  projectNumber: string;
  projectName: string;
  productiveHours: number;
  nonProductiveHours: number;
  productiveZHours: number;
  nonProductiveZHours: number;
}

interface ProjectStatisticsTableProps {
  items: ProjectStatisticsItem[];
  isLoading: boolean;
  filters: ProjectStatsFilters;
  onFilterChange: (filters: ProjectStatsFilters) => void;
}

interface ProjectStatsFilters {
  selectedProjectNumbers: string[];
  projectNameSearch: string;
}
```

### 4.2 GraphQL

#### New Query: `GET_PROJECT_STATISTICS`

```graphql
query GetProjectStatistics($input: ProjectStatisticsInput!) {
  getProjectStatistics(input: $input) {
    items {
      projectNumber
      projectName
      productiveHours
      nonProductiveHours
      productiveZHours
      nonProductiveZHours
    }
  }
}

input ProjectStatisticsInput {
  employeeId: Int!
  fromDate: String!
  toDate: String!
}
```

**Note:** Can potentially reuse/extend `GET_WORK_LIST_REPORT` if backend supports date range instead of month/year.

### 4.3 Backend Changes

#### New Resolver: `getProjectStatistics`
**Path:** `src/reports/reports.resolver.ts`

```typescript
@Query(() => ProjectStatisticsResponse)
async getProjectStatistics(
  @Args('input') input: ProjectStatisticsInput
): Promise<ProjectStatisticsResponse>
```

#### New Service Method
**Path:** `src/reports/reports.service.ts`

```typescript
async getProjectStatistics(input: ProjectStatisticsInput): Promise<ProjectStatisticsResponse> {
  // Query work records for employee within date range
  // Group by project
  // Sum hours by type (Productive SK, NonProd SK, Productive Z, NonProd Z)
  // Return aggregated results
}
```

### 4.4 Modified Files

| File | Changes |
|------|---------|
| `frontend/src/app/[lang]/balances/page.tsx` | Add `ProjectStatisticsSection` below `BalancesOverview` |
| `frontend/src/dictionaries/sk.json` | Add translation keys (see Section 5) |
| `frontend/src/dictionaries/en.json` | Add translation keys (see Section 5) |
| `backend/src/reports/reports.module.ts` | Register new resolver/service if needed |

### 4.5 Component Reuse

| Component | Source | Usage |
|-----------|--------|-------|
| `EmployeeSelector` | `components/employee-selector.tsx` | Employee dropdown |
| `DatePicker` | `components/ui/date-picker.tsx` | Date range selection |
| `ColumnFilterHeader` | Pattern from `work-records-table.tsx` | Table header filters |
| `Table`, `TableHeader`, etc. | `components/ui/table.tsx` | Table structure |
| `Card`, `CardHeader`, etc. | `components/ui/card.tsx` | Section wrapper |

---

## 5. Translations

### 5.1 Slovak (`sk.json`)

```json
{
  "projectStatistics": {
    "title": "Štatistika projektov",
    "description": "Prehľad odpracovaných hodín podľa projektov",
    "fromDate": "Od",
    "toDate": "Do",
    "projectNumber": "Č. projektu",
    "projectName": "Názov projektu",
    "productiveSK": "Prod SK",
    "nonProductiveSK": "NonProd SK",
    "productiveZ": "Prod Z",
    "nonProductiveZ": "NonProd Z",
    "totalHours": "Spolu hodín",
    "manDays": "MD",
    "total": "Spolu",
    "noData": "Žiadne dáta pre vybrané obdobie",
    "last30Days": "Posledných 30 dní"
  }
}
```

### 5.2 English (`en.json`)

```json
{
  "projectStatistics": {
    "title": "Project Statistics",
    "description": "Overview of hours worked per project",
    "fromDate": "From",
    "toDate": "To",
    "projectNumber": "Project No.",
    "projectName": "Project Name",
    "productiveSK": "Prod SK",
    "nonProductiveSK": "NonProd SK",
    "productiveZ": "Prod Z",
    "nonProductiveZ": "NonProd Z",
    "totalHours": "Total Hours",
    "manDays": "MD",
    "total": "Total",
    "noData": "No data for selected period",
    "last30Days": "Last 30 days"
  }
}
```

---

## 6. UI/UX Specification

### 6.1 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Prehľad (Overview) Page                                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │  BalancesOverview (existing)                            ││
│  │  [Vacation] [Doctor] [Accompanying] [Disabled Child]    ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Project Statistics (NEW)                               ││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │  CardHeader: "Štatistika projektov"                 │││
│  │  │  CardDescription: "Prehľad odpracovaných hodín..."  │││
│  │  ├─────────────────────────────────────────────────────┤││
│  │  │  [Employee Dropdown*] [From Date] [To Date]         │││
│  │  ├─────────────────────────────────────────────────────┤││
│  │  │  ┌─────────────────────────────────────────────────┐│││
│  │  │  │  Table with sticky headers                      ││││
│  │  │  │  • Project Number (filter)                      ││││
│  │  │  │  • Project Name (search filter)                 ││││
│  │  │  │  • Prod SK | NonProd SK | Prod Z | NonProd Z   ││││
│  │  │  │  • Total Hours | MD                             ││││
│  │  │  │  ───────────────────────────────────────────────││││
│  │  │  │  Summary Row (bold)                             ││││
│  │  │  └─────────────────────────────────────────────────┘│││
│  │  │  Footer: "Showing X records"                        │││
│  │  └─────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘

* Employee Dropdown only visible to Admins/Managers
```

### 6.2 Styling

- **Card:** Standard `Card` component with `CardHeader` and `CardContent`
- **Table wrapper:** `rounded-md border border-border max-h-[500px] overflow-y-auto relative bg-background flex flex-col`
- **Table headers:** Sticky with filter buttons (same as work-records-table)
- **Summary row:** `bg-primary/5 font-bold`
- **Footer:** `p-2 border-t border-border bg-muted/20 text-xs text-muted-foreground text-center`

### 6.3 Responsive Behavior

- **Desktop:** Full table with all columns visible
- **Tablet/Mobile:** Horizontal scroll enabled for table
- **Filter controls:** Stack vertically on smaller screens (grid responsive)

---

## 7. Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  User Input │ ──► │  GraphQL     │ ──► │  Backend        │
│  - Employee │     │  Query       │     │  - Filter DB    │
│  - DateFrom │     │              │     │  - Aggregate    │
│  - DateTo   │     │              │     │  - Return JSON  │
└─────────────┘     └──────────────┘     └─────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Frontend    │
                    │  - Store     │
                    │  - Filter    │
                    │  - Render    │
                    └──────────────┘
```

---

## 8. Acceptance Criteria

### 8.1 Must Have
- [ ] Project statistics table displays below balance cards
- [ ] Date range filter with "last 30 days" default
- [ ] Hours split by: Prod SK, NonProd SK, Prod Z, NonProd Z
- [ ] Total Hours and Man Days (MD) columns calculated
- [ ] Summary row with totals at bottom
- [ ] Project Number filter (checkbox multi-select)
- [ ] Project Name filter (text search)
- [ ] Admin/Manager can select any employee
- [ ] Regular users see only their own data
- [ ] Empty state when no data
- [ ] Loading state while fetching
- [ ] Slovak and English translations

### 8.2 Should Have
- [ ] Sorting on all columns
- [ ] Responsive design for mobile
- [ ] Smooth animations (fade-in on load)

### 8.3 Could Have
- [ ] Remember last selected date range (localStorage)
- [ ] Quick date presets (This week, This month, This quarter)

---

## 9. Dependencies

### 9.1 Frontend Dependencies
- All required components already exist in the codebase
- No new npm packages required

### 9.2 Backend Dependencies
- Prisma schema supports required queries
- No schema changes needed

---

## 10. Testing Considerations

### 10.1 Unit Tests
- `ProjectStatisticsTable` component rendering
- Filter logic (project number, project name)
- Man-day calculation (hours / 8)
- Summary row calculation

### 10.2 Integration Tests
- GraphQL query returns correct aggregated data
- Role-based employee selection

### 10.3 Manual Testing
- Verify data matches work records for date range
- Test with 0 records, 1 record, many records
- Test date edge cases (same day, large range)

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large date ranges cause slow queries | Medium | Add reasonable date range limits or pagination |
| Many projects cause scroll performance issues | Low | Virtual scrolling if needed (future enhancement) |
| Calculation discrepancies with other reports | High | Ensure same aggregation logic as work-list report |

---

## 12. Timeline Estimate

| Task | Estimated Time |
|------|----------------|
| Backend: New query/resolver | 2-3 hours |
| Frontend: ProjectStatisticsSection | 2-3 hours |
| Frontend: ProjectStatisticsTable | 3-4 hours |
| Translations | 30 mins |
| Integration & Testing | 2-3 hours |
| **Total** | **~10-14 hours** |

---

*Specification complete. Ready for implementation.*

