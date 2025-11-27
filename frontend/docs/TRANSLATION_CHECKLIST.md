# Translation Checklist

This document tracks the progress of adding i18n translations to all components and pages in the application.

## Legend

- ✅ **Done**: Component is fully translated
- 🔄 **In Progress**: Component migration started but not complete
- ⏳ **Pending**: Component not yet migrated
- ⚠️ **Needs Review**: Component translated but needs testing

## Priority 1: Critical User-Facing Pages

### Work Records
- ⏳ `app/[lang]/work-records/page.tsx` - Main work records page
  - [ ] Date range filters (From Date, To Date, Whole Month)
  - [ ] Export CSV button
  - [ ] Add Entry button
  - [ ] Empty state message
  - [ ] Loading states
  - [ ] Error messages
  - [ ] Record count display

### Work Record Management
- ⚠️ `components/delete-work-record-dialog.tsx` - Delete confirmation dialog
  - [x] Dialog title
  - [x] Dialog description
  - [x] Button labels
  - [x] Toast messages
  - [x] Record details labels
- ⏳ `components/work-record-dialog.tsx` - Create/Edit dialog
  - [ ] Dialog titles (create vs edit)
  - [ ] Form labels
  - [ ] Placeholders
  - [ ] Validation messages
  - [ ] Button labels
  - [ ] Toast messages
- ⏳ `components/work-record-form.tsx` - Work record form
  - [ ] Field labels
  - [ ] Placeholders
  - [ ] Help text
  - [ ] Error messages

### Tables
- ⏳ `components/work-records-table.tsx` - Main work records table
  - [ ] Column headers
  - [ ] Filter labels
  - [ ] Action buttons
  - [ ] Empty state
  - [ ] Loading state
- ⏳ `components/work-records-filter-controls.tsx` - Filter controls
  - [ ] Filter labels
  - [ ] Placeholders
  - [ ] Clear buttons
  - [ ] Search placeholder

### Employee Selection
- ✅ `components/employee-selector-i18n.tsx` - Example with translations
- ⏳ `components/employee-selector.tsx` - Original component (needs migration)
  - [ ] Label
  - [ ] Placeholder
  - [ ] Employee display format

### Login
- ⏳ `app/[lang]/login/page.tsx` - Login page
  - [ ] Page title
  - [ ] Form labels (Email, Password)
  - [ ] Button text (Sign In, Signing in...)
  - [ ] Error messages
  - [ ] Validation messages

## Priority 2: Admin Pages

### Employees
- ⏳ `app/[lang]/admin/employees/page.tsx` - Employees list page
  - [ ] Page title
  - [ ] Add Employee button
  - [ ] Search placeholder
  - [ ] Table headers
  - [ ] Empty state
  - [ ] Error messages
- ⏳ `components/employee-dialog.tsx` - Create/Edit employee dialog
  - [ ] Dialog titles
  - [ ] Form labels
  - [ ] Placeholders
  - [ ] Button labels
  - [ ] Validation messages
- ⏳ `components/employee-form.tsx` - Employee form
  - [ ] Field labels
  - [ ] Placeholders
  - [ ] Help text
  - [ ] Country selector
  - [ ] Manager selector
  - [ ] Employee type labels

### Projects
- ⏳ `app/[lang]/admin/projects/page.tsx` - Projects list page
  - [ ] Page title
  - [ ] Add Project button
  - [ ] Search placeholder
  - [ ] Table headers
  - [ ] Status labels
  - [ ] Empty state
- ⏳ `components/project-dialog.tsx` - Create/Edit project dialog (if exists)
  - [ ] Dialog titles
  - [ ] Form labels
  - [ ] Placeholders
  - [ ] Date pickers
  - [ ] Button labels

## Priority 3: Time Management Pages

### Overtime
- ⏳ `app/[lang]/overtime/page.tsx` - Overtime management page
  - [ ] Page title
  - [ ] Current Balance label
  - [ ] History section
  - [ ] Add Correction button
  - [ ] Table headers (Date, Type, Change, Note)
  - [ ] Overtime type labels
    - [ ] Flexi
    - [ ] SC SR Trip
    - [ ] SC Abroad
    - [ ] Unpaid
  - [ ] Form labels
  - [ ] Placeholders
  - [ ] Validation messages
  - [ ] Toast messages

### Balances
- ⏳ `app/[lang]/balances/page.tsx` - My Balances page
  - [ ] Page title
  - [ ] Current Balances heading
  - [ ] Balance type labels
    - [ ] Vacation Balance
    - [ ] Sick Leave Balance
    - [ ] Overtime
  - [ ] Units (days, hours)
  - [ ] Loading state
  - [ ] Error messages
- ⏳ `components/balances-overview.tsx` - Balances display component
  - [ ] Balance card titles
  - [ ] Value formatting
  - [ ] Tooltips

## Priority 4: Reports

### Work Report
- ⏳ `app/[lang]/reports/work-report/page.tsx` - Work report generation
  - [ ] Page title
  - [ ] Form labels
    - [ ] Select Employee
    - [ ] Select Month
    - [ ] Select Year
  - [ ] Generate PDF button
  - [ ] Loading text (Generating Report...)
  - [ ] Download PDF button
  - [ ] Signature upload section
    - [ ] Upload Signature label
    - [ ] Signature Preview
    - [ ] Remove Signature
  - [ ] Toast messages
    - [ ] PDF generated successfully
    - [ ] PDF downloaded successfully
    - [ ] Failed messages
    - [ ] Validation warnings

### Work List
- ⏳ `app/[lang]/reports/work-list/page.tsx` - Work list report
  - [ ] Page title
  - [ ] Form labels
  - [ ] Date range pickers
  - [ ] Generate PDF button
  - [ ] Loading states
  - [ ] Empty state messages
  - [ ] Toast messages

### Report Configuration
- ⏳ `components/report-configuration.tsx` - Report config component
  - [ ] Form labels
  - [ ] Placeholders
  - [ ] Button labels
  - [ ] Validation messages

## Priority 5: Data Management

### Data Page
- ⏳ `app/[lang]/data/page.tsx` - Data management hub
  - [ ] Page title
  - [ ] Page description
  - [ ] Section titles
    - [ ] Absence Types
    - [ ] Productivity Types
    - [ ] Work Types
    - [ ] Holidays
    - [ ] Settings

## Priority 6: Shared Components

### Filters
- ⏳ `components/filter-chips.tsx` - Filter chip display
  - [ ] Filter labels
  - [ ] Clear button aria-label
  - [ ] Remove filter aria-label
- ⏳ `components/projects-filter-controls.tsx` - Project filters
  - [ ] Filter labels
  - [ ] Placeholders
  - [ ] Status options

### Dialogs
- ⏳ `components/reset-password-dialog.tsx` - Password reset
  - [ ] Dialog title
  - [ ] Dialog description
  - [ ] Button labels
  - [ ] Success/error messages
- ⏳ `components/pdf-viewer-dialog.tsx` - PDF viewer
  - [ ] Dialog title
  - [ ] Loading message
  - [ ] Error message
  - [ ] Close button

### Layout Components
- ✅ `components/sidebar.tsx` - Sidebar navigation (DONE)
- ✅ `components/app-layout.tsx` - App layout wrapper (DONE)
- ✅ `components/unified-header.tsx` - Page header (DONE)

## Dictionary Keys Added

### ✅ Completed Categories
- [x] sidebar - All sidebar navigation items
- [x] common - Common UI elements (buttons, actions, states)
- [x] workRecords - Work records page labels
- [x] workRecordDialog - Work record dialog labels
- [x] deleteDialog - Delete confirmation dialog
- [x] employees - Employee management labels
- [x] projects - Project management labels
- [x] overtime - Overtime management labels
- [x] balances - Balance display labels
- [x] reports - Report generation labels
- [x] data - Data management labels
- [x] login - Login page labels
- [x] filters - Filter control labels
- [x] absenceTypes - Absence type labels
- [x] validation - Form validation messages
- [x] table - Table UI labels
- [x] toast - Toast notification messages
- [x] navigation - Navigation/breadcrumb labels

### ⏳ Additional Categories Needed
- [ ] absenceTypes - Extended absence type labels (if more types exist)
- [ ] productivityTypes - Productivity type labels
- [ ] workTypes - Work type labels
- [ ] holidays - Holiday management labels
- [ ] settings - Settings page labels
- [ ] profile - User profile labels (if exists)
- [ ] dashboard - Dashboard labels (if exists)

## Testing Checklist

For each migrated component, verify:

### Visual Testing
- [ ] Component renders correctly in Slovak (SK)
- [ ] Component renders correctly in English (EN)
- [ ] No layout shifts when switching languages
- [ ] No truncated text
- [ ] No overflow issues
- [ ] Proper text alignment

### Functional Testing
- [ ] All buttons work correctly
- [ ] Form validation shows translated messages
- [ ] Toast messages appear in correct language
- [ ] Empty states show translated text
- [ ] Loading states show translated text
- [ ] Error messages show translated text

### Interaction Testing
- [ ] Language switch updates all visible text
- [ ] No console errors when switching languages
- [ ] Form submissions work correctly
- [ ] Dialogs open/close properly
- [ ] Tables filter/sort correctly

### Accessibility Testing
- [ ] Screen reader announces text correctly
- [ ] ARIA labels are translated
- [ ] Focus management works properly
- [ ] Keyboard navigation works correctly

## Known Issues

Document any issues found during translation:

1. **Issue**: [Description]
   - **Location**: [File path]
   - **Status**: [Open/Fixed]
   - **Notes**: [Additional context]

## Migration Notes

### Common Patterns Found

1. **Date Formatting**: Many components format dates - consider creating a date formatting utility that respects locale
2. **Number Formatting**: Hours, counts, etc. should use locale-aware formatting
3. **Pluralization**: Some messages need plural forms (e.g., "1 record" vs "5 records")
4. **Dynamic Content**: Some labels include dynamic data - ensure proper string interpolation

### Best Practices Learned

1. Always import `useTranslations` at the top of client components
2. Use `getDictionary` for server components
3. Group related translations in the dictionary structure
4. Keep translation keys semantic (e.g., `workRecords.addEntry` not `buttons.add1`)
5. Test both languages after each component migration
6. Update TypeScript types when adding new dictionary keys

### Performance Notes

- Dictionary loading is done once per request (server-side)
- Client components access translations via React Context (no re-fetching)
- Language switching is near-instant (uses React transition)
- No noticeable performance impact from i18n implementation

## Progress Summary

### Overall Progress
- **Total Components**: ~40
- **Completed**: 4 (10%)
- **In Progress**: 1 (2.5%)
- **Remaining**: 35 (87.5%)

### By Priority
- **Priority 1 (Critical)**: 0/9 = 0%
- **Priority 2 (Admin)**: 0/6 = 0%
- **Priority 3 (Time)**: 0/4 = 0%
- **Priority 4 (Reports)**: 0/4 = 0%
- **Priority 5 (Data)**: 0/1 = 0%
- **Priority 6 (Shared)**: 4/16 = 25%

### Dictionary Completeness
- **SK Dictionary**: 290+ keys
- **EN Dictionary**: 290+ keys
- **Type Definitions**: ✅ Complete
- **Coverage**: ~80% of application UI text

## Next Steps

### Immediate (This Sprint)
1. Complete Priority 1 components (Work Records, Login)
2. Test language switching thoroughly
3. Fix any layout issues with translated text

### Short Term (Next Sprint)
1. Complete Priority 2 components (Admin pages)
2. Complete Priority 3 components (Time management)
3. Add more comprehensive tests

### Long Term
1. Complete all remaining components
2. Add date/number locale formatting
3. Consider adding pluralization support
4. Consider adding more languages (e.g., Czech)
5. Optimize dictionary loading if needed

## Resources

- **Migration Guide**: `docs/I18N_MIGRATION_GUIDE.md`
- **Implementation Summary**: `docs/I18N_IMPLEMENTATION.md`
- **Example Component**: `components/employee-selector-i18n.tsx`
- **Dictionary Files**: `dictionaries/sk.json`, `dictionaries/en.json`
- **Type Definitions**: `lib/dictionary-types.ts`

---

**Last Updated**: 2024
**Maintained By**: Development Team
**Status**: Active Development