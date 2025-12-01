# Project Statistics Feature - Shape Notes

## Feature Summary
Add a new "Project Statistics" section to the "Prehľad" (My Balances) page that displays aggregated work hours per project with date filtering.

## User Description
> There will be new section with the information on how many hours, man days (1 MD = 8 hours) did user work on projects that fits the filters. There will be the date filter and table with Project IDs, Project names, hours count from that specific date and time and hours recalculated to man days. It is just informational table to display some statistics. On the table header click there will be filtering of currently displayed projects possible.

## Existing Patterns to Reuse

### 1. Table Design Pattern
- Standard table wrapper: `rounded-md border border-border max-h-[600px] overflow-y-auto relative bg-background flex flex-col`
- Sticky headers with filtering capability
- Footer with record count

### 2. ColumnFilterHeader Component
Already implemented in:
- `work-records-table.tsx`
- `employee-table.tsx`
- `projects-table.tsx`

Provides:
- Sorting on column click
- Filter popover with checkbox/search options
- Active filter indication

### 3. Date Picker Component
- `DatePicker` component with "Today" button
- `Calendar` component with month navigation

### 4. GraphQL Query Pattern
Similar to `GET_WORK_LIST_REPORT` query which aggregates project hours

## Key Components Identified

| Component | File | Purpose |
|-----------|------|---------|
| BalancesOverview | `balances-overview.tsx` | Current balances display |
| ColumnFilterHeader | `work-records-table.tsx` | Filterable table headers |
| DatePicker | `date-picker.tsx` | Date selection |
| Table components | `ui/table.tsx` | Table structure |

## Data Requirements

### Input
- Employee ID (from auth context)
- Date range (from/to)

### Output per Project
- Project ID/Number
- Project Name
- Total Hours
- Man Days (hours / 8)

## Requirements (User Answers)

### 1. Employee Selection (Role-Based)
**Admin users:** Dropdown to select any employee from the system
**Non-admin users:** Only see their own data (no dropdown visible)
- Pattern: Same as `ReportConfiguration` component in work-list page
- Default: Current logged-in user

### 2. Date Range Default
**Last 30 days** - Default filter will show from (today - 30 days) to today.

### 3. Table Filtering Options
**Both Project ID and Project Name** - ColumnFilterHeader on both columns with:
- Project Number: Checkbox multi-select filter
- Project Name: Text search filter

### 4. Hours Breakdown
**Split by type:**
- Productive SK
- Non-Productive SK
- Productive Z (abroad)
- Non-Productive Z (abroad)
- *(Plus calculated totals: Total Hours, MD)*

### 5. Summary Row/Totals
**Yes** - Summary row at bottom with:
- Total hours per column
- Total MD (sum of all hours / 8)

### 6. Section Placement
**Below existing balance cards** - New Card component under BalancesOverview

### 7. Empty State
**Simple "No data" message** - Standard empty state pattern

### 8. Visual Design
**Reuse existing components** - Same design patterns as:
- `work-list/page.tsx` project breakdown table
- `ColumnFilterHeader` from work-records-table
- Standard table wrapper styling
- Card with CardHeader/CardContent structure

---

## Implementation Plan

### New Components
1. `ProjectStatisticsTable` - New component in `/components/project-statistics-table.tsx`

### Modified Files
1. `balances/page.tsx` - Add ProjectStatisticsTable below BalancesOverview
2. `dictionaries/sk.json` - Add translation keys
3. `dictionaries/en.json` - Add translation keys

### GraphQL
- Reuse existing `GET_WORK_LIST_REPORT` query or create new optimized query
- Query by employee ID + date range (not month/year)

### Data Flow
```
User → Employee Select (admin only) → Date Filter → GraphQL Query → Project aggregation → Table display
                                                                 ↓
                                                    ColumnFilterHeader filters (client-side)
```

### Role-Based Behavior
| Role | Employee Dropdown | Data Visible |
|------|-------------------|--------------|
| Admin | Yes (all employees) | Selected employee's data |
| Manager | Yes (managed employees) | Selected employee's data |
| Regular | Hidden | Own data only |

---
*Spec shaped: 2025-12-01*
*Requirements gathered: Complete*

