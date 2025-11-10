# Spec Requirements: Phase 4 Smart Features & Usability

## Initial Description

Phase 4 focuses on smart features and usability improvements for the attendance system.

**IMPORTANT**: Item #13 (Next Workday Suggestion) is ALREADY IMPLEMENTED, TESTED, AND FULLY FUNCTIONAL - do not include this in the spec.

### Features to Implement

**14. Record Copy Feature**
Add "Copy" action (copy icon) on single row, open dialog showing selected record's fields and with working day suggestions.

Priority: M (Medium)

**15. CSV Export**
Add "Export CSV" button above table, generate CSV file from currently filtered records with all columns, trigger browser download with filename including date range (e.g., "work-records-2025-11-01-to-2025-11-30.csv").

Priority: S (Small)

**Goal**: Add convenience features that make daily time tracking faster and more efficient.

## Requirements Discussion

### Record Copy Feature - SIMPLIFIED APPROACH

**Key insight**: This is NOT a separate copy dialog - it's simply reusing the existing "Add Entry" dialog with pre-filled data!

**Q1: What is the simplified approach for the copy feature?**

**Answer**: Instead of creating a new copy dialog, we reuse the existing "Add Entry" dialog with pre-filled data from the selected record. This dramatically simplifies implementation and maintains UI consistency.

**Q2: Where should the copy icon be placed and should it respect lock status?**

**Answer**:
- Add "CopyPlus" icon from lucide-react in the Actions column alongside Edit (pencil) and Delete (trash) icons
- The icon should be ENABLED even for locked records - copying locked records is allowed
- This allows users to duplicate historical locked entries to new dates

**Q3: What happens when the user clicks the copy icon?**

**Answer**:
- Open the EXISTING "Add Entry" dialog (reuse completely)
- Pre-fill ALL fields from the selected record:
  - Project
  - Absence type
  - Productivity type
  - Work type
  - Start time
  - End time
  - Description
  - Kilometers (km)
  - Trip flag (DlhodobaSC)
- Date field should be pre-filled with "next working day" (this calculation is ALREADY IMPLEMENTED in the Add Entry dialog - reuse it!)
- User can freely edit all fields before saving

**Q4: What validation rules should apply to copied records?**

**Answer**:
- Check for completely identical records - ALL fields must match including description and date!
- If a duplicate exists, reject the creation and show a toast warning
- Validate that the selected date is not in the locked date range
  - Example: If locked until Aug 31, 2025, cannot create record for Aug 21, 2025
- Do NOT prevent wrong date selection in the picker - allow user to select any date, then warn/reject on save attempt
- Show toast rejection message if a locked date is selected

**Q5: How should success be handled?**

**Answer**:
- Toast notification is already implemented for successful/rejected creation
- No changes needed to existing success flow
- The copied record simply appears in the table like any other newly created record

**Q6: Should we support bulk copying to multiple dates?**

**Answer**: No. Scope is single record copy only - NO bulk copy to multiple dates. This keeps the feature simple and aligned with the existing UI patterns.

### CSV Export Feature

**Q7: Where should the CSV export button be placed?**

**Answer**:
- Add "Export CSV" button on the LEFT side of the screen
- Position it immediately to the RIGHT of the "Add Entry" button
- Use Download or FileDown icon from lucide-react

**Q8: What data should be exported?**

**Answer**:
- Export ONLY filtered/visible records (respect ALL active filters)
- Generation happens on FRONTEND using already-fetched filtered records
- No backend mutation needed - use client-side CSV generation

**Q9: What should the CSV format look like?**

**Answer**:
- Columns: Exactly match the work records table display
- Date format: YYYY-MM-DD
- Time format: HH:MM
- Boolean fields (Trip, Lock): TRUE/FALSE

**Q10: How should the filename be generated?**

**Answer**:
- Pattern: work-records-{employee-name}-{start-date}-to-{end-date}.csv
- Example: work-records-milan-smotlak-2025-11-01-to-2025-11-30.csv
- Date filter always exists, so no need to handle "no filter" case

### Existing Code to Reference

Based on user's response about similar features:

**Similar Features Identified:**

**Feature: Add Entry Dialog**
- Path: Already implemented in the work records feature
- Components to potentially reuse:
  - Entire "Add Entry" dialog form
  - All form fields and validation
  - Next working day calculation logic
  - Toast notification system
  - Form submission and error handling

**Feature: Work Records Table**
- Path: Already implemented
- Components to potentially reuse:
  - Actions column pattern (Edit, Delete icons)
  - Table structure and data display
  - Filtering logic (date range filtering)
  - GraphQL queries for work records

**Feature: shadcn/ui Component Library**
- Path: `/Users/miro/Projects/dochadzkovy-system/shadcn-cheatsheet`
- Description: Contains working examples of all shadcn components
- Usage: Copy and adapt components as needed for new UI elements

**Feature: Design Reference**
- Path: `/Users/miro/Projects/dochadzkovy-system/agent-os/specs/2025-11-05-work-records-read-display/planning/visuals/`
- Description: Mockups that are already implemented in the app
- Usage: Maintain consistent design style with existing implementation

## Visual Assets

### Files Provided:
All examples of shadcn objects are in help reference folder `/Users/miro/Projects/dochadzkovy-system/shadcn-cheatsheet`. Other than that reuse styling that is already implemented within app.

### Visual Insights:
Design should follow existing patterns from the implemented work records feature. Reference existing UI for:
- Action button placement and styling
- Dialog/modal patterns
- Toast notification styling
- Icon usage and sizing
- Table action column layout

## Requirements Summary

### Functional Requirements

**Record Copy Feature:**
- Enable copying work records by clicking a CopyPlus icon in the Actions column
- Reuse existing "Add Entry" dialog with pre-filled data from selected record
- Allow copying even locked records (icon always enabled)
- Pre-fill all fields: project, absence type, productivity type, work type, times, description, km, trip flag
- Default date to next working day using existing calculation logic
- Allow user to edit any field before saving
- Validate for duplicate records (all fields must match)
- Validate against locked date range (reject if date is locked)
- Show toast warnings for rejections (duplicate or locked date)
- Use existing toast success notification on successful copy

**CSV Export Feature:**
- Add "Export CSV" button left of screen, next to "Add Entry" button
- Use Download or FileDown icon from lucide-react
- Export only filtered/visible records
- Generate CSV on frontend (no backend call needed)
- Match table columns exactly in CSV output
- Use consistent date format (YYYY-MM-DD) and time format (HH:MM)
- Boolean fields as TRUE/FALSE
- Generate filename: work-records-{employee-name}-{start-date}-to-{end-date}.csv
- Trigger browser download automatically

### Reusability Opportunities

**Components that already exist:**
- Add Entry dialog (complete reuse for copy feature)
- Next working day calculation
- Toast notification system
- Form validation patterns
- GraphQL work records queries
- Date range filtering logic
- Table Actions column pattern
- shadcn/ui component examples

**Backend patterns to reference:**
- Work record creation mutation
- Duplicate detection logic
- Lock date validation
- Date range filtering

**Similar features to model after:**
- Edit functionality (opens dialog with pre-filled data)
- Delete functionality (shows confirmation, updates table)
- Add Entry flow (form validation, submission, success handling)

### Scope Boundaries

**In Scope:**

**Record Copy:**
- Single record copy via CopyPlus icon
- Reuse existing Add Entry dialog
- Pre-fill all fields from selected record
- Default to next working day
- Allow editing before save
- Duplicate validation (all fields)
- Locked date validation
- Toast notifications for success/rejection
- Copy works even on locked records

**CSV Export:**
- Frontend-only CSV generation
- Export filtered/visible records only
- Button placement next to Add Entry
- Filename with employee name and date range
- Standard CSV format matching table columns
- Automatic browser download

**Out of Scope:**
- Bulk copy to multiple dates (future enhancement)
- Backend CSV generation endpoint
- CSV import functionality
- Custom CSV column selection
- CSV format customization
- Copy multiple records at once
- Scheduled/automated CSV exports
- Email CSV functionality

### Technical Considerations

**Integration points:**
- Reuse existing Add Entry dialog component completely
- Reuse next working day calculation (already implemented)
- Use existing toast notification system
- Use existing GraphQL queries for work records
- No new backend mutations needed for CSV export
- Frontend CSV generation using existing filtered data

**Technology preferences:**
- Frontend: Next.js with TypeScript
- UI: TailwindCSS + shadcn/ui components
- Icons: lucide-react (CopyPlus, Download/FileDown)
- CSV generation: Client-side library (e.g., papaparse or custom implementation)
- State management: Existing patterns for dialog state
- Validation: Reuse existing form validation patterns

**Existing system constraints:**
- Must respect lock date validation (ZamknuteK field)
- Must respect per-record lock flags
- Must work with per-user table architecture (t_{Name}_{Surname})
- Must integrate with existing filtering system
- Must maintain existing UI/UX patterns
- Must use existing GraphQL schema

**Similar code patterns to follow:**
- Dialog opening pattern from Edit functionality
- Pre-filling form pattern from Edit dialog
- Icon placement in Actions column (pencil, trash icons)
- Toast notification pattern from create/edit/delete
- Filter-aware data access pattern from existing queries
- Filename generation pattern (date formatting, employee name)

### Design Guidelines

**UI Consistency:**
- Match existing button styles and placement
- Use consistent icon sizing in Actions column
- Follow existing dialog/modal patterns
- Maintain existing color scheme and spacing
- Use existing toast notification styling

**User Experience:**
- Keep copy flow simple and intuitive
- Minimize clicks required for common operations
- Provide clear feedback on all actions
- Maintain existing keyboard navigation patterns
- Ensure mobile responsiveness

**Accessibility:**
- Maintain ARIA labels on new buttons/icons
- Ensure keyboard accessibility
- Provide screen reader support
- Use semantic HTML elements

### Implementation Notes

**Record Copy Implementation:**
1. Add CopyPlus icon to Actions column in work records table
2. On click, capture selected record data
3. Open existing Add Entry dialog
4. Pre-populate all form fields with captured data
5. Set date to next working day using existing logic
6. On submit, run existing validations PLUS duplicate check
7. Show appropriate toast based on result

**CSV Export Implementation:**
1. Add Export CSV button component
2. Get currently filtered records from table state
3. Transform records to CSV format (match table columns)
4. Generate filename with employee name and date range
5. Trigger browser download using Blob/URL.createObjectURL

**Key Simplifications:**
- No new dialog needed for copy (reuse existing)
- No backend changes needed for CSV (frontend generation)
- No new validation logic needed (reuse existing + simple duplicate check)
- No new date calculation needed (reuse next working day logic)

**Testing Focus:**
- Test copy on locked vs unlocked records
- Test duplicate detection (exact match required)
- Test locked date rejection
- Test CSV export with various filters
- Test CSV filename generation
- Test CSV data accuracy
- Test browser download trigger
- Test mobile responsiveness of new buttons

**Performance Considerations:**
- CSV generation should be fast (frontend, already-loaded data)
- No additional backend queries needed
- Reuse existing filtered dataset
- Consider large datasets (500+ records) for CSV generation timing

**Error Handling:**
- Handle duplicate record scenario with clear message
- Handle locked date scenario with clear message
- Handle CSV generation failures gracefully
- Provide retry options where appropriate
- Log errors for debugging
