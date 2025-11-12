# Task Breakdown: Phase 4 - Smart Features & Usability

## Overview
Total Task Groups: 4
Estimated Complexity: Low-Medium (high code reuse)

This phase implements two usability-focused features:
1. **Record Copy Feature** - Reuses existing Add Entry dialog with pre-filled data
2. **CSV Export Feature** - Frontend-only export of filtered records

Both features maximize code reuse and require minimal new code.

## Task List

### Feature 1: Record Copy

#### Task Group 1: Copy Icon & Handler Setup
**Dependencies:** None
**Specialization:** Frontend UI (React/TypeScript)

- [ ] 1.0 Add copy icon and click handler to work records table
  - [ ] 1.1 Write 2-8 focused tests for copy functionality
    - Test copy icon renders in Actions column
    - Test copy icon is enabled for both locked and unlocked records
    - Test clicking copy icon captures correct record data
    - Test copy handler opens dialog with pre-filled data
    - Skip exhaustive testing of all edge cases at this stage
  - [x] 1.2 Add CopyPlus icon to Actions column
    - File: `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/work-records-table.tsx`
    - Location: Lines 217-242 (Actions column with Edit/Delete icons)
    - Import CopyPlus from lucide-react
    - Add Button with ghost variant matching existing pattern
    - Use existing icon sizing: h-4 w-4 classes
    - Enable for ALL records (locked and unlocked)
  - [x] 1.3 Create onCopy handler function
    - Add to parent component: `/Users/miro/Projects/dochadzkovy-system/frontend/src/app/work-records/page.tsx`
    - Follow existing `handleEdit` pattern (around line 400-420)
    - Capture full record data from clicked row
    - Set state to trigger dialog opening with pre-filled data
  - [x] 1.4 Wire copy handler to table component
    - Pass `onCopy` callback to WorkRecordsTable component
    - Connect CopyPlus button click to onCopy handler
    - Pass record data as parameter
  - [ ] 1.5 Ensure copy icon tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify icon renders and click handler works
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass
- CopyPlus icon appears in Actions column for all records
- Icon styling matches Edit and Delete icons (size, spacing, hover states)
- Clicking icon captures record data correctly
- No visual regressions in table layout

**Files to Modify:**
- `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/work-records-table.tsx`
- `/Users/miro/Projects/dochadzkovy-system/frontend/src/app/work-records/page.tsx`

**Code to Reference:**
- Actions column pattern (lines 217-242 in work-records-table.tsx)
- handleEdit function pattern in page.tsx

---

#### Task Group 2: Dialog Integration for Copy
**Dependencies:** Task Group 1
**Specialization:** Frontend UI (React/TypeScript)

- [ ] 2.0 Integrate copy data with existing Add Entry dialog
  - [ ] 2.1 Write 2-8 focused tests for dialog integration
    - Test dialog opens in create mode when copy is triggered
    - Test all fields pre-filled with copied record data
    - Test date field defaults to next working day
    - Test user can edit all pre-filled fields
    - Test form submission uses createWorkRecord mutation
    - Skip exhaustive validation testing at this stage
  - [x] 2.2 Extend WorkRecordDialog to accept copy data
    - File: `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/work-record-dialog.tsx`
    - Component already supports `initialData` prop (lines 88-151)
    - Add new prop: `copyFromRecord?: WorkRecord`
    - When copyFromRecord provided, use it instead of lastRecordData
    - Keep existing next working day logic (GET_NEXT_WORKDAY query)
  - [x] 2.3 Update dialog state management in page.tsx
    - Add state: `copyFromRecord: WorkRecord | null`
    - Set this state in onCopy handler
    - Pass to WorkRecordDialog as prop
    - Clear state on dialog close
  - [ ] 2.4 Test dialog pre-filling with copy data
    - Open dialog via copy icon
    - Verify all fields populated: project, absence type, productivity type, work type, start time, end time, description, km, trip flag
    - Verify date shows next working day
    - Verify user can modify all fields
  - [ ] 2.5 Ensure dialog integration tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify dialog opens with correct pre-filled data
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- Dialog opens in create mode when copy icon clicked
- All form fields pre-filled with data from selected record
- Date field shows next working day (reuses existing logic)
- User can edit any field before saving
- Form submission works using existing createWorkRecord mutation
- Dialog closes and shows success toast after save

**Files to Modify:**
- `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/work-record-dialog.tsx`
- `/Users/miro/Projects/dochadzkovy-system/frontend/src/app/work-records/page.tsx`

**Code to Reuse:**
- Existing initialData pre-fill logic (lines 88-151 in work-record-dialog.tsx)
- GET_NEXT_WORKDAY query (already implemented)
- useCreateWorkRecord hook (no changes needed)

---

#### Task Group 3: Duplicate & Lock Validation (Backend)
**Dependencies:** Task Group 2
**Specialization:** Backend API (NestJS/GraphQL)

- [ ] 3.0 Add validation for duplicate records and locked dates
  - [ ] 3.1 Write 2-8 focused tests for validation logic
    - Test duplicate record detection (all fields match)
    - Test locked date rejection
    - Test successful creation when validations pass
    - Test appropriate error messages returned
    - Skip exhaustive edge case testing at this stage
  - [x] 3.2 Implement duplicate record detection
    - File: Work record resolver/service (backend)
    - Before INSERT, query for existing record with ALL matching fields
    - Fields to compare: employeeId, date, absenceTypeId, projectId, productivityTypeId, workTypeId, startTime, endTime, description, km, isTripFlag
    - If exact duplicate found, throw error: "This record already exists"
  - [x] 3.3 Implement locked date validation
    - Validate selected date against ZamknuteK (lock date) field
    - If date <= ZamknuteK, reject creation
    - Throw error: "Cannot create record for locked date"
    - Reuse existing lock date validation logic if available
  - [x] 3.4 Update GraphQL mutation error handling
    - Ensure validation errors return proper GraphQL error responses
    - Include clear error messages for frontend toast display
    - Maintain existing error handling patterns
  - [ ] 3.5 Ensure validation tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify duplicate detection and locked date validation work
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass
- Duplicate records (exact match on all fields) are rejected
- Records for locked dates are rejected
- Clear error messages returned to frontend
- Existing record creation still works when validations pass
- No breaking changes to existing createWorkRecord mutation

**Files to Modify:**
- Backend work record resolver/service files
- May need to check existing validation logic

**Code to Reference:**
- Existing lock date validation (if available)
- Existing createWorkRecord mutation implementation

---

### Feature 2: CSV Export

#### Task Group 4: CSV Export Button & Logic
**Dependencies:** None (independent feature)
**Specialization:** Frontend UI (React/TypeScript)

- [ ] 4.0 Implement CSV export functionality
  - [ ] 4.1 Write 2-8 focused tests for CSV export
    - Test export button renders correctly
    - Test CSV generation from filtered records
    - Test CSV column format matches table
    - Test filename generation pattern
    - Test browser download is triggered
    - Skip exhaustive data format testing at this stage
  - [x] 4.2 Add Export CSV button to page layout
    - File: `/Users/miro/Projects/dochadzkovy-system/frontend/src/app/work-records/page.tsx`
    - Location: Around line 546 (near Add Entry button)
    - Position: LEFT of screen, immediately RIGHT of Add Entry button
    - Import Download or FileDown icon from lucide-react
    - Use Button component matching Add Entry styling
    - Button always visible when records are displayed
  - [x] 4.3 Create CSV generation utility function
    - Create new file or add to existing utils
    - Function: `generateCSV(records: WorkRecord[]): string`
    - Columns: Date, Absence, Project, Productivity, Work Type, Start, End, Hours, Description, KM, Trip, Lock
    - Date format: YYYY-MM-DD
    - Time format: HH:MM (truncate seconds)
    - Boolean fields: TRUE/FALSE
    - Null values: empty string
    - Include header row with column names
    - Use CSV escaping for description field (may contain commas/quotes)
  - [x] 4.4 Create filename generation function
    - Function: `generateFilename(employeeName: string, startDate: string, endDate: string): string`
    - Pattern: `work-records-{employee-name}-{start-date}-to-{end-date}.csv`
    - Example: `work-records-milan-smotlak-2025-11-01-to-2025-11-30.csv`
    - Convert employee name to lowercase, replace spaces with hyphens
    - Use date format: YYYY-MM-DD
  - [x] 4.5 Implement export button click handler
    - Get filtered records from existing `filteredRecords` array (line 292 in page.tsx)
    - Get employee name from `selectedEmployeeId` state
    - Get date range from `filters.fromDate` and `filters.toDate`
    - Generate CSV string using utility function
    - Generate filename using utility function
    - Create Blob from CSV string
    - Trigger browser download using URL.createObjectURL
    - Clean up object URL after download
  - [x] 4.6 Add error handling for export
    - Try-catch around CSV generation and download
    - Show toast error on failure: "Failed to export CSV. Please try again."
    - Console.error for debugging
    - Keep button enabled after error (allow retry)
  - [ ] 4.7 Ensure CSV export tests pass
    - Run ONLY the 2-8 tests written in 4.1
    - Verify CSV generation and download work
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 4.1 pass
- Export CSV button renders next to Add Entry button
- Button styling matches existing patterns
- CSV exports ONLY filtered/visible records
- CSV columns match table exactly
- Date/time formats are consistent (YYYY-MM-DD, HH:MM)
- Boolean fields show TRUE/FALSE
- Filename follows pattern with employee name and date range
- Browser download triggered automatically
- Error toast shown if export fails

**Files to Modify:**
- `/Users/miro/Projects/dochadzkovy-system/frontend/src/app/work-records/page.tsx`
- Create new utility file or add to existing utils (e.g., csv-utils.ts)

**Code to Reference:**
- WorkRecord interface: `/Users/miro/Projects/dochadzkovy-system/frontend/src/graphql/queries/work-records.ts` (lines 93-108)
- filteredRecords array: page.tsx line 292
- Existing toast notification pattern (sonner already imported)

**Libraries to Consider:**
- Manual CSV generation (simple string building with escaping)
- OR: papaparse library (if already in dependencies)
- Use Blob and URL.createObjectURL for download (standard Web APIs)

---

### Final Testing & Verification

#### Task Group 5: Integration Testing & Polish
**Dependencies:** Task Groups 1-4
**Specialization:** Full-stack Testing & QA

- [ ] 5.0 Comprehensive testing and polish
  - [ ] 5.1 Review and run feature-specific tests
    - Review tests written in Task Groups 1-4 (approximately 8-32 tests)
    - Ensure all feature tests pass
    - Do NOT add exhaustive test coverage at this stage
  - [ ] 5.2 Perform manual browser testing
    - Test record copy flow end-to-end
    - Test copy from locked record to unlocked date
    - Test copy triggering duplicate detection
    - Test copy triggering locked date rejection
    - Test CSV export with various filters
    - Test CSV file opens correctly in Excel/Google Sheets
    - Test on different browsers (Chrome, Firefox, Safari)
    - Test responsive behavior on mobile/tablet
  - [ ] 5.3 Identify critical workflow gaps (if any)
    - Analyze if any critical user workflows lack coverage
    - Focus ONLY on this phase's features
    - Identify maximum 3-5 critical gaps
  - [ ] 5.4 Write up to 5 additional strategic tests (if needed)
    - Add maximum 5 new integration tests for critical gaps
    - Focus on end-to-end workflows
    - Examples:
      - Copy record, edit fields, save successfully
      - Copy record to locked date, verify rejection
      - Create duplicate via copy, verify rejection
      - Export CSV after applying multiple filters
      - Verify CSV data accuracy for edge cases
    - Skip if no critical gaps found
  - [ ] 5.5 UI/UX polish and consistency check
    - Verify icon sizing and alignment in Actions column
    - Verify button placement and spacing for Export CSV
    - Check hover states and focus indicators
    - Verify toast messages are clear and helpful
    - Ensure no layout shifts or visual bugs
    - Check keyboard navigation works
  - [ ] 5.6 Performance verification
    - Test CSV export with large dataset (100+ records)
    - Verify no UI lag when opening copy dialog
    - Check browser download performance
    - Verify table refresh after copy is smooth
  - [ ] 5.7 Error handling verification
    - Manually trigger duplicate error, verify toast
    - Manually trigger locked date error, verify toast
    - Simulate CSV generation failure, verify error handling
    - Verify all error messages are user-friendly
  - [ ] 5.8 Run all feature-specific tests
    - Run all tests from Task Groups 1-5
    - Expected total: approximately 15-40 tests maximum
    - Do NOT run entire application test suite
    - Verify all Phase 4 features work correctly

**Acceptance Criteria:**
- All feature-specific tests pass (15-40 tests maximum)
- Manual browser testing shows no bugs or regressions
- No more than 5 additional integration tests added
- UI is polished and consistent with existing design
- Error handling is clear and helpful
- Performance is acceptable with realistic data volumes
- Features work across different browsers
- Mobile/responsive behavior is correct

**Testing Checklist:**
- [ ] Copy unlocked record to future date - success
- [ ] Copy locked record to future date - success
- [ ] Copy record to locked date - rejection with toast
- [ ] Copy record creating exact duplicate - rejection with toast
- [ ] Edit copied record before saving - success
- [ ] Export CSV with date filter - success
- [ ] Export CSV with multiple filters - success
- [ ] Verify CSV data accuracy - success
- [ ] Verify CSV filename format - success
- [ ] Test on mobile/tablet - success
- [ ] Test keyboard navigation - success
- [ ] Test error scenarios - success

---

## Execution Order

Recommended implementation sequence:

### Phase 1: Record Copy Feature (Task Groups 1-3)
1. **Task Group 1**: Copy icon and handler setup (frontend)
2. **Task Group 2**: Dialog integration with copy data (frontend)
3. **Task Group 3**: Duplicate and lock validation (backend)

### Phase 2: CSV Export Feature (Task Group 4)
4. **Task Group 4**: CSV export button and logic (frontend only)

### Phase 3: Final Testing (Task Group 5)
5. **Task Group 5**: Integration testing and polish

**Rationale:**
- Task Groups 1-2 can be implemented together as they're tightly coupled frontend work
- Task Group 3 (backend validation) is independent and can be done in parallel with frontend if multiple developers
- Task Group 4 is completely independent and can be done in any order
- Task Group 5 requires all features complete for end-to-end testing

---

## Key Implementation Notes

### Maximum Code Reuse
- **No new dialog needed** - Reuse WorkRecordDialog component completely
- **No new date logic needed** - Reuse GET_NEXT_WORKDAY query
- **No new mutation needed** - Reuse useCreateWorkRecord hook
- **No backend changes for CSV** - Frontend-only generation
- **No new GraphQL queries** - Use existing filteredRecords array

### Files That Will Be Modified
**Frontend:**
- `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/work-records-table.tsx`
- `/Users/miro/Projects/dochadzkovy-system/frontend/src/components/work-record-dialog.tsx`
- `/Users/miro/Projects/dochadzkovy-system/frontend/src/app/work-records/page.tsx`
- New file: CSV utility functions (optional, can be inline)

**Backend:**
- Work record resolver/service files (for validation logic)

### Files That Will NOT Be Modified
- No changes to GraphQL schema
- No changes to database schema/migrations
- No changes to existing hooks (useCreateWorkRecord, etc.)
- No changes to toast notification system
- No changes to date picker or form components

### Design References
- **shadcn/ui examples:** `/Users/miro/Projects/dochadzkovy-system/shadcn-cheatsheet`
- **Existing patterns:** Follow Edit/Delete icons in Actions column
- **Button styling:** Match Add Entry button
- **Toast notifications:** Reuse existing sonner toast system

### Testing Strategy
- **Focused approach:** 2-8 tests per task group during development
- **Feature-specific:** Run only Phase 4 tests, not entire suite
- **Manual testing:** Critical for UI/UX verification
- **Integration gaps:** Maximum 5 additional tests if critical gaps found
- **Total tests:** Approximately 15-40 tests for entire phase

### Success Criteria for Phase 4
- [ ] Copy icon visible in Actions column for all records
- [ ] Clicking copy opens Add Entry dialog with pre-filled data
- [ ] Copied records validate for duplicates (all fields)
- [ ] Copied records validate for locked dates
- [ ] Appropriate toast warnings shown for rejections
- [ ] Export CSV button visible next to Add Entry
- [ ] CSV exports only filtered/visible records
- [ ] CSV format matches table columns exactly
- [ ] Filename follows pattern with employee name and date range
- [ ] All feature-specific tests pass
- [ ] No regressions in existing functionality
- [ ] UI is polished and consistent
- [ ] Performance is acceptable

---

## Risk Mitigation

### Potential Challenges

**1. Duplicate Detection Complexity**
- **Risk:** Comparing ALL fields (including description, times) may have edge cases
- **Mitigation:** Write specific tests for exact match scenarios, handle null/undefined consistently

**2. CSV Special Characters**
- **Risk:** Description field may contain commas, quotes, newlines
- **Mitigation:** Use proper CSV escaping (wrap in quotes, escape internal quotes)

**3. Large Dataset Export**
- **Risk:** Exporting 500+ records may be slow
- **Mitigation:** Test with realistic data volumes, add loading indicator if needed

**4. Browser Download Compatibility**
- **Risk:** Different browsers may handle Blob downloads differently
- **Mitigation:** Test on Chrome, Firefox, Safari, use standard Web APIs

**5. Locked Date Edge Cases**
- **Risk:** Timezone issues or date comparison bugs
- **Mitigation:** Reuse existing lock date validation logic, write specific tests

### Dependencies on Existing Code
- WorkRecordDialog component must support initialData prop (currently does)
- GET_NEXT_WORKDAY query must be working (confirmed already implemented)
- Toast notification system must be available (sonner already imported)
- filteredRecords array must be accessible in page.tsx (confirmed at line 292)
- Lock date validation logic must exist or be implementable

---

## Estimated Effort

**Task Group 1 (Copy Icon):** 2-3 hours
**Task Group 2 (Dialog Integration):** 3-4 hours
**Task Group 3 (Backend Validation):** 3-4 hours
**Task Group 4 (CSV Export):** 4-5 hours
**Task Group 5 (Testing & Polish):** 3-4 hours

**Total Estimated Effort:** 15-20 hours

**Note:** Estimates assume high code reuse and familiarity with existing codebase. Actual time may vary based on debugging and testing needs.