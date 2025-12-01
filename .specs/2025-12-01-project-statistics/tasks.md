# Project Statistics - Implementation Tasks

**Spec:** `.specs/2025-12-01-project-statistics/spec.md`  
**Created:** 2025-12-01  
**Status:** ✅ Implementation Complete

---

## Task Groups Overview

| Group | Description | Tasks | Est. Time |
|-------|-------------|-------|-----------|
| **A** | Backend - GraphQL & Service | 3 | 2-3 hrs |
| **B** | Frontend - Components | 4 | 5-7 hrs |
| **C** | Frontend - Integration | 2 | 1-2 hrs |
| **D** | Translations | 1 | 30 mins |
| **E** | Testing & Polish | 2 | 1-2 hrs |

**Total Estimated Time:** 10-14 hours

---

## Group A: Backend - GraphQL & Service

### Task A1: Create DTOs and Types
**Priority:** High | **Depends on:** None

Create input/output types for the project statistics query.

**Files to create/modify:**
- `backend/src/reports/dto/project-statistics.input.ts`
- `backend/src/reports/dto/project-statistics.response.ts`

**Implementation:**
```typescript
// project-statistics.input.ts
@InputType()
export class ProjectStatisticsInput {
  @Field(() => Int)
  employeeId: number;

  @Field()
  fromDate: string;

  @Field()
  toDate: string;
}

// project-statistics.response.ts
@ObjectType()
export class ProjectStatisticsItem {
  @Field()
  projectNumber: string;

  @Field()
  projectName: string;

  @Field(() => Float)
  productiveHours: number;

  @Field(() => Float)
  nonProductiveHours: number;

  @Field(() => Float)
  productiveZHours: number;

  @Field(() => Float)
  nonProductiveZHours: number;
}

@ObjectType()
export class ProjectStatisticsResponse {
  @Field(() => [ProjectStatisticsItem])
  items: ProjectStatisticsItem[];
}
```

**Acceptance:**
- [x] DTOs created with proper decorators
- [x] Types match spec requirements

---

### Task A2: Implement Service Method
**Priority:** High | **Depends on:** A1

Add `getProjectStatistics` method to reports service.

**Files to modify:**
- `backend/src/reports/reports.service.ts`

**Implementation:**
- Query `PracovneZaznamy` table for employee within date range
- Group by project (Zakazka)
- Sum hours by productivity type and location
- Return aggregated results

**SQL Logic (Prisma):**
```typescript
async getProjectStatistics(input: ProjectStatisticsInput): Promise<ProjectStatisticsResponse> {
  const records = await this.prisma.pracovneZaznamy.findMany({
    where: {
      ZamestnanecID: input.employeeId,
      Datum: {
        gte: new Date(input.fromDate),
        lte: new Date(input.toDate),
      },
    },
    include: {
      Zakazka: true,
    },
  });
  
  // Group and aggregate by project
  // Calculate hours by type (Prod SK, NonProd SK, Prod Z, NonProd Z)
  // Return ProjectStatisticsResponse
}
```

**Acceptance:**
- [x] Method queries correct date range
- [x] Hours are correctly categorized by productivity type
- [x] Hours are correctly categorized by location (SK vs abroad)
- [x] Results grouped by project

---

### Task A3: Add GraphQL Resolver
**Priority:** High | **Depends on:** A2

Add `getProjectStatistics` query to resolver.

**Files to modify:**
- `backend/src/reports/reports.resolver.ts`

**Implementation:**
```typescript
@Query(() => ProjectStatisticsResponse)
async getProjectStatistics(
  @Args('input') input: ProjectStatisticsInput,
): Promise<ProjectStatisticsResponse> {
  return this.reportsService.getProjectStatistics(input);
}
```

**Acceptance:**
- [x] Query accessible via GraphQL
- [x] Returns correct data structure
- [x] Test with GraphQL playground

---

## Group B: Frontend - Components

### Task B1: Create GraphQL Query
**Priority:** High | **Depends on:** A3

Define the frontend GraphQL query.

**Files to create:**
- `frontend/src/graphql/queries/project-statistics.ts`

**Implementation:**
```typescript
import { gql } from '@apollo/client';

export const GET_PROJECT_STATISTICS = gql`
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
`;

export interface ProjectStatisticsItem {
  projectNumber: string;
  projectName: string;
  productiveHours: number;
  nonProductiveHours: number;
  productiveZHours: number;
  nonProductiveZHours: number;
}

export interface ProjectStatisticsResponse {
  getProjectStatistics: {
    items: ProjectStatisticsItem[];
  };
}
```

**Acceptance:**
- [x] Query defined with correct types
- [x] TypeScript interfaces match backend response

---

### Task B2: Create ProjectStatisticsTable Component
**Priority:** High | **Depends on:** B1

Build the table component with filtering and totals.

**Files to create:**
- `frontend/src/components/project-statistics-table.tsx`

**Implementation:**
- Reuse `ColumnFilterHeader` pattern from `work-records-table.tsx`
- Columns: Project No., Project Name, Prod SK, NonProd SK, Prod Z, NonProd Z, Total Hours, MD
- Project Number filter: checkbox multi-select
- Project Name filter: text search
- Summary row with totals
- Footer with record count

**Component Structure:**
```typescript
interface ProjectStatsFilters {
  selectedProjectNumbers: string[];
  projectNameSearch: string;
}

interface ProjectStatisticsTableProps {
  items: ProjectStatisticsItem[];
  isLoading: boolean;
  filters: ProjectStatsFilters;
  onFilterChange: (filters: ProjectStatsFilters) => void;
}

export function ProjectStatisticsTable({ ... }) {
  // Sorting state
  // Client-side filtering
  // Calculate totals
  // Render table with ColumnFilterHeader
}
```

**Styling:**
- Table wrapper: `rounded-md border border-border max-h-[500px] overflow-y-auto relative bg-background flex flex-col`
- Summary row: `bg-primary/5 font-bold`
- Use `tabular-nums` for numeric columns

**Acceptance:**
- [x] Table renders with all columns
- [x] Project Number filter works (checkbox)
- [x] Project Name filter works (text search)
- [x] Sorting works on all columns
- [x] Summary row shows correct totals
- [x] Man Days calculated as Total Hours / 8
- [x] Empty state displays correctly
- [x] Loading state displays correctly

---

### Task B3: Create ProjectStatisticsSection Component
**Priority:** High | **Depends on:** B2

Build the container component with filters and data fetching.

**Files to create:**
- `frontend/src/components/project-statistics-section.tsx`

**Implementation:**
```typescript
interface ProjectStatisticsSectionProps {
  employeeId: string;
  isAdmin: boolean;
  isManager: boolean;
}

export function ProjectStatisticsSection({ employeeId, isAdmin, isManager }) {
  // State: selectedEmployeeId (default: employeeId)
  // State: fromDate (default: 30 days ago)
  // State: toDate (default: today)
  // State: filters for table
  
  // GraphQL query with useLazyQuery
  // Refetch when employee/dates change
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.projectStatistics.title}</CardTitle>
        <CardDescription>{t.projectStatistics.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filter row */}
        <div className="flex flex-wrap gap-4 mb-4">
          <EmployeeSelector ... /> {/* Only for admin/manager */}
          <DatePicker label="From" ... />
          <DatePicker label="To" ... />
        </div>
        
        {/* Table */}
        <ProjectStatisticsTable ... />
      </CardContent>
    </Card>
  );
}
```

**Acceptance:**
- [x] Employee selector visible only for admin/manager
- [x] Date pickers default to last 30 days
- [x] Data fetches on mount and filter change
- [x] Loading state during fetch
- [x] Error handling

---

### Task B4: Integrate into Balances Page
**Priority:** High | **Depends on:** B3

Add the section to the balances page.

**Files to modify:**
- `frontend/src/app/[lang]/balances/page.tsx`

**Implementation:**
```typescript
import { ProjectStatisticsSection } from '@/components/project-statistics-section';

// In the return statement, after BalancesOverview:
return (
  <div className="space-y-6">
    <BalancesOverview employeeId={user.id} year={currentYear} />
    <ProjectStatisticsSection 
      employeeId={user.id}
      isAdmin={user.isAdmin}
      isManager={user.isManager}
    />
  </div>
);
```

**Acceptance:**
- [x] Section appears below balance cards
- [x] Correct props passed from auth context
- [x] Page layout maintains proper spacing

---

## Group C: Frontend - Integration

### Task C1: Add Error Handling
**Priority:** Medium | **Depends on:** B3

Ensure proper error states and edge cases.

**Files to modify:**
- `frontend/src/components/project-statistics-section.tsx`

**Implementation:**
- GraphQL error display
- Date validation (from ≤ to)
- Handle empty employee selection

**Acceptance:**
- [x] Error message displayed on query failure
- [x] Invalid date range shows validation message
- [x] No crash on edge cases

---

### Task C2: Add Loading States
**Priority:** Medium | **Depends on:** B3

Implement skeleton/loading states.

**Files to modify:**
- `frontend/src/components/project-statistics-section.tsx`
- `frontend/src/components/project-statistics-table.tsx`

**Implementation:**
- Skeleton rows in table during load
- Disabled state for filters during load

**Acceptance:**
- [x] Loading skeleton appears during fetch
- [x] Smooth transition to loaded state

---

## Group D: Translations

### Task D1: Add Translation Keys
**Priority:** Medium | **Depends on:** None

Add all required translation strings.

**Files to modify:**
- `frontend/src/dictionaries/sk.json`
- `frontend/src/dictionaries/en.json`

**Slovak translations:**
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
    "noData": "Žiadne dáta pre vybrané obdobie"
  }
}
```

**English translations:**
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
    "noData": "No data for selected period"
  }
}
```

**Acceptance:**
- [x] All keys added to both language files
- [x] No missing translations in UI

---

## Group E: Testing & Polish

### Task E1: Manual Testing
**Priority:** Medium | **Depends on:** B4, D1

Test all functionality end-to-end.

**Test Cases:**
1. Regular user sees only their data (no employee dropdown)
2. Admin sees employee dropdown with all employees
3. Date range filter works correctly
4. Project filters work (number checkbox, name search)
5. Totals match sum of individual rows
6. Man Days = Total Hours / 8
7. Empty state when no records
8. Large date range performance
9. Mobile responsiveness

**Acceptance:**
- [x] All test cases pass
- [x] No console errors
- [x] Data matches work records

---

### Task E2: Code Review & Cleanup
**Priority:** Low | **Depends on:** E1

Final polish and code quality.

**Checklist:**
- [x] Remove console.logs
- [x] Consistent naming conventions
- [x] No TypeScript errors
- [x] No ESLint warnings
- [x] Comments where needed

---

## Implementation Order

```
A1 → A2 → A3 → B1 → B2 → B3 → B4
                              ↓
D1 (parallel) ────────────────┤
                              ↓
                     C1 → C2 → E1 → E2
```

**Recommended sequence:**
1. Start with backend (A1-A3) - can be tested independently
2. Add translations (D1) - parallel work
3. Build frontend components (B1-B4)
4. Add error handling and loading states (C1-C2)
5. Test and polish (E1-E2)

---

## Quick Start Commands

```bash
# Backend development
cd backend
npm run start:dev

# Frontend development  
cd frontend
npm run dev

# Test GraphQL (after A3)
# Open http://localhost:3000/graphql
# Run getProjectStatistics query
```

---

*Implementation complete: 2025-12-01*

