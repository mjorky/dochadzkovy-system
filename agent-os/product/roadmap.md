# Product Roadmap

This roadmap prioritizes quick delivery of legacy application functionality using the modern tech stack, broken into small testable increments. Each phase ends with a working application that non-technical users can test in their browser.

---

## Phase 1: Foundation & First Testable Screen (2 weeks)

**Goal:** Get a working web application running with database connection and one complete feature users can test.

### 1. [x] Project Setup & Database Connection — Initialize NestJS backend with PostgreSQL connection to existing schema, set up environment variables, and verify database access with a simple health check query. `XS`

**Testing Guide (Non-Technical):**
- Your developer will share a URL like `http://localhost:4000/health`
- Open it in your browser - you should see "OK" or "Database connected"
- If you see an error, the database is not connected yet

### 2. [x] Basic GraphQL API Setup — Configure Apollo Server in NestJS with code-first schema generation, create first simple query (e.g., list employees), and set up GraphQL Playground for testing. `XS`

**Testing Guide (Non-Technical):**
- Open `http://localhost:4000/graphql` in your browser
- You'll see a query editor - don't worry about the code
- Your developer will show you how to click "Run" button
- You should see a list of employee names from your database

### 3. [x] Next.js Frontend Setup — Initialize Next.js 14 project with TypeScript, install TailwindCSS and shadcn/ui components, create basic layout with navigation sidebar matching legacy app structure. `S`

**Testing Guide (Non-Technical):**
- Open `http://localhost:3000` in your browser
- You should see a navigation menu on the left side
- Menu should have items like "Employee", "Data", "Overtime", "Reports", "Admin"
- Clicking menu items doesn't load content yet - that's normal

### 4. [x] GraphQL Client Integration — Set up Apollo Client in Next.js, configure CORS on backend, create connection between frontend and backend, verify end-to-end request flow with simple query. `S`

**Testing Guide (Non-Technical):**
- Open `http://localhost:3000` in your browser
- Click on "Employee" menu item
- If you see employee names from your database (even if layout is rough), integration works!
- If you see "Loading..." forever or error message, connection failed

### 5. [x] Employee Overview Screen (Read-Only) — Build complete "Employee" screen showing full name (with titles), employment type, vacation balance, and admin status. Fetch data via GraphQL query from Zamestnanci table, display in clean card layout with proper formatting. `M`

**Testing Guide (Non-Technical):**
- Open `http://localhost:3000` and click "Employee" (or Zamestnanec)
- You should see YOUR name at the top with your full title
- Vacation balance should match what's in the current system
- Employment type should say "Employee", "Contractor", "Student", or "Part-time"
- Everything should be READ-ONLY (no edit buttons yet)

**What to check:**
- Is your name displayed correctly with titles?
- Does vacation balance show the right number of days?
- Does it look clean and professional (not like the old desktop app)?

---

## Phase 2: Work Records - Read & Display (1 week)

**Goal:** Users can view their work records in a table, filter by date, and see the data they're used to from the legacy app.

### 6. [x] Work Records Read Query — Create GraphQL query that reads from per-user tables (t_{Name}_{Surname}), joins with Projects, CinnostTyp, HourType, HourTypes catalog tables, calculates hours (including overnight spans), and returns formatted work records. `M`

**Testing Guide (Non-Technical):**
- Your developer will test this in GraphQL Playground first
- They'll show you a list of your recent work records in the browser
- Check: do you recognize your recent entries from the desktop app?

### 7. [x] Data Screen - Table Display — Build "Data" screen with table showing work records: date, absence type, project, productivity type, work type, start time, end time, hours, description, km, trip flag. Default filter: last 31 days. Display lock icon for locked records. `M`

**Testing Guide (Non-Technical):**
- Open `http://localhost:3000` and click "Data" (or Dáta)
- You should see a table of your work entries from the last month
- Columns should include: Date, Project, Start Time, End Time, Hours, Description
- Hours should be calculated automatically (if you worked 8:00-16:00, it shows 8 hours)
- If a record is locked, you'll see a lock icon 🔒

**What to check:**
- Do you see your recent work entries?
- Are the hours calculated correctly?
- Do overnight shifts (e.g., 22:00-06:00) show 8 hours, not negative?
- Can you scroll through the table easily?

### 8. [x] Date Range Filter — Add date picker filter (from date, to date) above table with "Last 31 days" default and "Show whole month" checkbox toggle that expands to full calendar month of start date. Filter updates table without page reload. `S`

**Testing Guide (Non-Technical):**
- On the Data screen, look for date filter controls at the top
- Click on "From date" - a calendar should pop up
- Try changing to last week - table should update to show only last week's records
- Try checking "Show whole month" - if you picked November 15, it should show all of November
- Table should update immediately without reloading the whole page

**What to check:**
- Does the calendar picker work smoothly?
- Does the table update when you change dates?
- Is "Last 31 days" selected by default when you first load the page?

---

## Phase 3: Work Records - Create & Edit (1 week)

**Goal:** Users can add new work entries and edit existing ones, just like in the desktop app but in the browser.

### 9. [x] Work Record Create Dialog — Build "Add Entry" dialog with form fields: date picker, absence type dropdown, project dropdown (active only), productivity dropdown, work type dropdown, start time (30-min steps), end time (30-min steps), description text area, km number input, trip checkbox. Validate end >= start, allow overnight. `M`

**Testing Guide (Non-Technical):**
- On the Data screen, click "+ Add Entry" button (or similar)
- A popup form should appear
- Fill in: Today's date, select a project, set time 8:00 to 16:00, write description "Testing new system"
- Click "Save"
- The popup should close and your new entry should appear in the table immediately

**What to check:**
- Does the form have all the fields you're used to?
- Do dropdowns show your projects and work types?
- Time pickers: can you only select 8:00, 8:30, 9:00, etc. (30-minute steps)?
- Does your entry appear in the table after saving?

### 10. [x] Work Record Create Mutation — Implement GraphQL mutation that inserts into correct per-user table (t_{Name}_{Surname}), validates business rules (time constraints, lock status), returns created record with computed hours, handles errors gracefully. `S`

**Testing Guide (Non-Technical):**
- Try adding an entry for TODAY with project and times
- Then try adding an entry for a date that's LOCKED (if you have locked dates)
- First should succeed, second should show error message like "Cannot edit locked records"

**What to check:**
- Does saving work without errors?
- If you try to save something invalid (like end time before start time), do you get a helpful error message?

### 11. [x] Work Record Update Dialog & Mutation — Add "Edit" action on table rows (pencil icon), open same form pre-filled with existing values, implement update mutation that respects lock flags and ZamknuteK date, update table row without reload. `M`

**Testing Guide (Non-Technical):**
- In the Data table, hover over a row - you should see an edit icon (pencil)
- Click the pencil - form should open with all fields already filled in
- Change the description to add " - EDITED"
- Click "Save"
- The table row should update immediately with your change

**What to check:**
- Can you edit recent (unlocked) entries?
- If you try to edit a LOCKED entry, does it prevent you or show error?
- Does the change appear immediately without refreshing the browser?

### 12. [x] Work Record Delete Dialog & Mutation — Add "Delete" action (trash icon) with confirmation dialog, implement delete mutation that respects locks, remove from table on success with optimistic update. `S`

**Testing Guide (Non-Technical):**
- Hover over a work record row and click the trash icon
- A confirmation popup should ask "Are you sure you want to delete this entry?"
- Click "Yes" - the row should disappear from the table immediately
- Try deleting a LOCKED entry - it should prevent you

**What to check:**
- Does it ask for confirmation before deleting?
- Does the row disappear immediately after confirming?
- Are locked entries protected from deletion?

---

## Phase 4: Smart Features & Usability (1 week)

**Goal:** Add the convenience features from the legacy app that make daily time tracking faster.

### 13. [x] Next Workday Suggestion — Implement backend function that calculates next working day by skipping weekends (Sat/Sun) and dates in Holidays table, use as default date in "Add Entry" dialog, show helper text "Next workday: Monday, Nov 18". `S`

**Testing Guide (Non-Technical):**
- Open "Add Entry" dialog on a Friday afternoon
- The date field should automatically suggest next Monday (skipping weekend)
- If Monday is a holiday, it should suggest Tuesday instead
- You can still manually change the date if needed

**What to check:**
- Does it skip weekends correctly?
- Does it skip Slovak public holidays (like Christmas, Easter)?
- Can you still pick weekend dates manually if you need to?

### 14. [x] Record Copy Feature — Add "Copy" action (copy icon) on single row, open dialog showing selected record's fields, allow selecting multiple target dates with working day suggestions, create multiple entries with one save action. `M`

**Testing Guide (Non-Technical):**
- Find a work entry you want to duplicate (e.g., Monday's meeting entry)
- Click the copy icon on that row
- Dialog should show the entry details and ask "Copy to which dates?"
- Select Tuesday, Wednesday, Thursday from date picker
- Click "Copy" - three new identical entries should appear in the table

**What to check:**
- Can you copy one entry to multiple days easily?
- Do the copied entries keep all details (project, times, description)?
- Is this faster than creating each entry manually?

### 15. [x] CSV Export — Add "Export CSV" button above table, generate CSV file from currently filtered records with all columns, trigger browser download with filename including date range (e.g., "work-records-2025-11-01-to-2025-11-30.csv"). `S`

**Testing Guide (Non-Technical):**
- Set date filter to "Last 31 days" (or any range you want)
- Click "Export CSV" button at the top of the table
- Your browser should download a file named something like "work-records-2025-11-01-to-2025-11-30.csv"
- Open the file in Excel or Google Sheets
- You should see all your filtered work records in spreadsheet format

**What to check:**
- Does the file download automatically?
- Can you open it in Excel/Google Sheets?
- Does it contain all the entries visible in the filtered table?
- Are all columns included (date, project, hours, description, etc.)?

---

## Phase 5: Projects Management (Admin) (4 days)

**Goal:** Administrators can manage projects without touching the database directly.

### 16. [x] Projects List Screen — Build "Admin > Projects" screen with table showing all projects: Number, Name, Description, Country, Manager (full name), Active checkbox. Add filtering by active status and search by name/number. `S`

**Testing Guide (Admin User):**
- Log in and click "Admin" → "Projects" in menu
- You should see all your company's projects in a table
- Try checking "Show only active" checkbox - table should filter to active projects only
- Try searching for a project name - table should filter as you type

**What to check:**
- Do you see all your projects?
- Is each manager's name shown correctly?
- Does the Active column show checkmarks for active projects?

### 17. [x] Project Create/Edit Dialog & Mutations — Add "Add Project" button opening form with fields: Number (unique), Name, Description, Country dropdown, Manager dropdown (all employees), Active checkbox. Implement create and update mutations with validation. `M`

**Testing Guide (Admin User):**
- Click "+ Add Project" button
- Fill in: Number "PRJ-123", Name "Test Project", Description "Testing system", select Country and Manager
- Check "Active" checkbox
- Click "Save" - new project should appear in table
- Click edit icon on the new project, change description, save - should update immediately

**What to check:**
- Can you create a new project successfully?
- Does it prevent duplicate project numbers?
- Can you edit existing projects?
- Do your changes save properly?

### 18. [x] Project Activation Toggle — Allow clicking Active checkbox in table to toggle AllowAssignWorkingHours without opening edit dialog, update backend immediately, show success/error notification, reflect in work record project dropdowns. `S`

**Testing Guide (Admin User):**
- In the Projects table, click the Active checkbox on a project to uncheck it
- The project should immediately be marked as inactive (no reload)
- Now go to Data screen → Add Entry
- The project you deactivated should NOT appear in the project dropdown anymore
- Go back to Projects, re-activate it
- Return to Data → Add Entry - project should now appear in dropdown again

**What to check:**
- Does activation/deactivation work with one click?
- Does it immediately affect the project dropdown in Add Entry form?
- Do you see a confirmation message after toggling?

---

## Phase 6: Employee Management (Admin) (5 days)

**Goal:** Administrators can manage employee data and see overtime totals.

### 19. [x] Employees List Screen — Build "Admin > Employees" screen with table showing all employees: Full Name (with titles), Employment Type, Vacation balance, Admin flag, Total Overtime (sum from Nadcasy), Last Entry date, Locked Until date. Add search and sorting. `S`

**Testing Guide (Admin User):**
- Click "Admin" → "Employees" in menu
- You should see all employees in a table
- Columns: Name, Type, Vacation Days, Is Admin (checkmark), Total Overtime (hours), Last Entry (date), Locked Until (date)
- Try searching for an employee name - table should filter
- Try clicking column headers - table should sort

**What to check:**
- Do you see all your employees?
- Are names formatted correctly with titles?
- Do overtime hours make sense (total accumulated overtime)?
- Is vacation balance shown as decimal (e.g., 15.5 days)?

### 20. [x] Employee Create Dialog & Mutation — Add "Add Employee" button with form: First Name, Last Name, Title Prefix, Title Suffix, Employment Type dropdown, Vacation Days number, Is Admin checkbox. Implement mutation that creates Zamestnanci record AND creates per-user table t_{Name}_{Surname} AND regenerates AllTData view. `M`

**Testing Guide (Admin User):**
- Click "+ Add Employee" button
- Fill in: First Name "Test", Last Name "User", Employment Type "Employee", Vacation Days "20"
- Click "Save"
- New employee should appear in employees table
- Go to Data screen and try adding a work entry - the new employee's personal table is ready (you won't see this directly, but backend created it)

**What to check:**
- Can you create a new employee?
- Does it appear in the table immediately?
- Does validation work (e.g., required fields)?

### 21. [x] Employee Update Dialog & Mutation — Add "Edit" action on employee rows with form pre-filled, allow changing all fields including name, implement mutation that updates Zamestnanci AND renames per-user table if name changed AND regenerates AllTData view. `M`

**Testing Guide (Admin User):**
- Click edit icon (pencil) on an employee row
- Form opens with all current values filled in
- Change vacation days from 20 to 22
- Click "Save" - table should update immediately
- Now try changing an employee's last name (be careful! This is a real test)
- After saving, the system should have renamed their personal work records table in the background

**What to check:**
- Can you edit employee details successfully?
- Do changes save and reflect in the table?
- If you change someone's name, does everything still work?

### 22. [x] Employee Lock Attendance Feature — Add "Lock Attendance" action button on employee row, open dialog asking for "Lock until date", implement mutation that sets Zamestnanci.ZamknuteK to chosen date AND updates all work records in t_{Name}_{Surname} with StartDate <= chosen date to set Lock=true, show success message. `M`
*Note: Implemented as read-only display of lock date per user request.*

**Testing Guide (Admin User):**
- Find an employee who has work entries in October
- Click "Lock Attendance" action for that employee
- Dialog asks "Lock attendance until which date?"
- Select "October 31, 2025"
- Click "Lock"
- System should process for a moment, then show "Attendance locked successfully"
- Ask that employee to log in and try editing an October entry - they should get "This entry is locked" error
- Entries in November should still be editable

**What to check:**
- Does locking work without errors?
- Are old entries (before lock date) now uneditable?
- Are new entries (after lock date) still editable?
- Can you see the lock date in the Locked Until column?

---

## Phase 7: Overtime View (Read-Only) (3 days)

**Goal:** Users can view their overtime ledger with all details.

### 23. [ ] Overtime Ledger Query — Create GraphQL query that fetches Nadcasy records for logged-in employee, joins with NadcasyTyp and Zamestnanci (for Schvalil approver name), calculates running total and sum by type, returns overtime entries sorted by date. `S`

**Testing Guide (Non-Technical):**
- Your developer will test this query first
- They'll show you a list of overtime entries in GraphQL Playground
- Check if you recognize your overtime history

### 24. [ ] Overtime Screen - Display Ledger — Build "Overtime" (Nadčasy) screen showing table with columns: Date, Hours (+/- signed), Type, Approved By (full name or "—"), Note, Deduction flag (icon or checkbox). Display running total at bottom. Filter by date range and type. `M`

**Testing Guide (Non-Technical):**
- Click "Overtime" (or Nadčasy) in menu
- You should see a table of your overtime entries
- Columns: Date, Overtime Hours (e.g., +2:30 or -1:00), Type (Flexi, Business Trip, etc.), Approved By (manager name or empty), Note
- At the bottom, see your total overtime balance (e.g., "Total: 12:30 hours")
- Positive entries (surplus hours) should be in green or have + sign
- Negative entries (deductions) should be in red or have - sign

**What to check:**
- Do you see your overtime history?
- Do the hours match what you expect?
- Is the total at the bottom correct?
- Can you see who approved each entry?

### 25. [ ] Overtime Type and Date Filters — Add filter controls: Type dropdown (All, Flexi, Business Trip SK, Business Trip Abroad, Unpaid), Date range picker (default: this year), update table based on filters without reload. `S`

**Testing Guide (Non-Technical):**
- On Overtime screen, look for filter controls at top
- Try selecting "Flexi" from Type dropdown - table should show only Flexi overtime
- Try changing date range to "Last 3 months" - table should update
- Try "All types" - full list should return

**What to check:**
- Do filters update the table immediately?
- Does the total at the bottom recalculate when you filter?
- Can you easily see how much Flexi overtime vs Business Trip overtime you have?

---

## Phase 8: Overtime Management (Admin/Manager) (4 days)

**Goal:** Managers and admins can add, edit, approve, and bulk-delete overtime entries.

### 26. [ ] Overtime Create Dialog & Mutation — Add "+ Add Overtime" button (managers/admins only) with form: Employee dropdown, Date, Hours (time input or number with +/-), Type dropdown, Approved By (defaults to current user), Note (required for manual entries), Deduction checkbox. Implement mutation that inserts into Nadcasy with composite key validation. `M`

**Testing Guide (Manager/Admin User):**
- On Overtime screen, click "+ Add Overtime" button
- Select an employee, today's date, +2 hours, Type "Flexi", write Note "Extra project work"
- Click "Save" - entry should appear in employee's overtime ledger
- Try adding a deduction: select same employee, today, -1 hour, check "Deduction" checkbox, write Note "Correction"
- Both entries should appear in the table

**What to check:**
- Can you add overtime for employees?
- Does it require a note for manual entries?
- Can you add both positive and negative (deduction) entries?
- Do entries appear immediately?

### 27. [ ] Overtime Update/Delete Actions — Add "Edit" and "Delete" icons on overtime ledger rows (managers/admins only for entries they can modify), implement update mutation (0 hours = delete) and explicit delete mutation, respect business rules (can't delete manually created entries in bulk delete, only app-created). `M`

**Testing Guide (Manager/Admin User):**
- Find an overtime entry you created manually
- Click edit icon - form opens with values pre-filled
- Change hours from +2:00 to +3:00
- Click "Save" - entry updates immediately
- Click delete icon (trash) on another entry
- Confirm deletion - entry should disappear
- Automatic entries (created by system) should be deletable, manual entries require manager approval flag

**What to check:**
- Can you edit overtime entries?
- Can you delete entries with confirmation?
- Does deletion work without errors?

### 28. [ ] Bulk Delete Overtime Tool — Add "Bulk Delete" button (admins only) opening dialog with filters: Date range, Employee (optional), Type (optional), confirm checkbox "I understand this will delete automatic entries only". Implement mutation that deletes Nadcasy records WHERE Schvalil = 1 AND Odpocet = false matching filters. `S`

**Testing Guide (Admin User):**
- On Overtime screen, click "Bulk Delete" button
- Dialog opens with warning: "This will delete AUTOMATIC overtime entries only"
- Select date range: "October 1 to October 31"
- Check confirmation checkbox
- Click "Delete" - system should process and show "Deleted X automatic entries"
- Manual overtime entries (created by managers) should NOT be deleted

**What to check:**
- Does it require explicit confirmation?
- Does it only delete automatic entries (not manually added ones)?
- Does it show how many entries were deleted?
- Does overtime table update immediately?

---

## Phase 9: Official Work Report (5 days)

**Goal:** Generate legally-compliant Slovak work reports as PDF.

### 29. [x] Work Report Data Query — Create GraphQL query that aggregates work records for selected employee and month, computes total workdays (excluding weekends and Holidays), calculates total hours with overnight support, groups absences by CinnostTyp category, calculates weekend/holiday work hours. `M`

**Testing Guide (Manager/Admin User):**
- Your developer will test this in GraphQL Playground
- Select employee and month (e.g., October 2025)
- Query should return summary data: total work days, total hours, breakdown by absence type
- Check with your knowledge: do the numbers make sense?

### 30. [x] Work Report PDF Generation — Implement server-side PDF generation (using library like pdfkit or puppeteer) with two-page layout: Page 1 - daily table (date, weekday, time from/to, hours, absence reason), Page 2 - four summary tables (Work, Weekend, Holiday, Business trips) with category rows matching legacy format. Include employee signature if available. `L`

**Testing Guide (Manager/Admin User):**
- Go to "Reports" → "Work Report" screen
- Select employee from dropdown, select month (e.g., October 2025)
- Click "Generate PDF"
- PDF file should download automatically
- Open the PDF - you should see:
  - Page 1: Table with every workday, times, hours worked
  - Page 2: Four summary tables showing category breakdowns (Present at work, Travel, Vacation, Sick leave, Doctor, etc.)
- Compare with legacy app report - format should be similar

**What to check:**
- Does PDF download successfully?
- Is the layout professional and printable?
- Are all dates, times, and hours correct?
- Does it match Slovak legal requirements (compare to old reports)?
- Is employee signature included if available?

### 31. [x] Work Report UI Screen — Build "Reports > Work Report" screen with form: Employee dropdown, Month picker, "Generate PDF" button, preview area showing summary stats (total days, total hours) before generating PDF. Add loading state during PDF generation. `S`

**Testing Guide (Manager/Admin User):**
- Click "Reports" → "Work Report" in menu
- You should see a simple form: Employee dropdown, Month picker
- Select an employee and month
- Before clicking Generate, you should see preview summary: "25 work days, 187.5 hours" (example)
- Click "Generate PDF" button
- Loading spinner should appear
- After 2-5 seconds, PDF should download
- Preview stats should match PDF content

**What to check:**
- Is the interface simple and clear?
- Does preview give you confidence before generating PDF?
- Does loading state show while processing?
- Does PDF download reliably?

---

## Phase 10: Project Work List Report (4 days)

**Goal:** Generate project-specific hour statistics for billing and analysis.

### 32. [x] Work List Data Query — Create GraphQL query that aggregates work records for selected employee and month grouped by project Number, sums hours by HourType productivity buckets (Produktívne, Neproduktívne, ProduktívneOutSKCZ, NeproduktívneZ, Produktívne70), sums km traveled, includes project manager full name from Projects.Manager FK. `M`

**Testing Guide (Manager/Admin User):**
- Your developer will test this query in GraphQL Playground
- Select employee and month
- Query returns projects with hour breakdowns: Productive hours, Non-productive hours, Travel hours, etc.
- Check: do the project numbers and hour totals look correct?

### 33. [x] Work List PDF Generation & UI — Implement PDF generation for work list with table: Project Number, hour columns (Produktívne, Neproduktívne, ProduktívneZ, NeproduktívneZ, Produktívne70), KM column, Project Manager column, employee signature. Build UI screen "Reports > Work List" with form: Employee dropdown, Month picker, "Generate PDF" button, preview table before PDF. `M`

**Testing Guide (Manager/Admin User):**
- Go to "Reports" → "Work List"
- Select employee, select month
- You should see preview table showing:
  - Each project the employee worked on
  - Hour breakdown: Productive, Non-productive, etc.
  - Total kilometers traveled
  - Project manager name for each project
- Click "Generate PDF"
- PDF should download with same table layout
- Compare with legacy app work list - format should be similar

**What to check:**
- Does the preview table show all projects worked on that month?
- Are hour breakdowns correct (sum should match total hours for that project)?
- Are project manager names shown correctly?
- Does PDF look professional for client billing?
- Is employee signature included?

---

## Phase 11: Authentication & Security (1 week)

**Goal:** Protect the application with login and role-based permissions.

### 34. [x] JWT Authentication Backend — Implement JWT token generation and validation in NestJS using @nestjs/jwt and @nestjs/passport, create login mutation accepting email/password (or username/password), return access token and refresh token, create auth guard for protecting resolvers. `M`

**Testing Guide (Admin User - Initial Setup):**
- Your developer will set up initial admin credentials in database
- Try accessing GraphQL Playground - should now require authentication token
- Developer will show you how to log in and get token
- This is backend-only testing - frontend comes next

### 35. [x] Login Screen & Auth State Management — Build login screen with email/password form, implement login flow using Apollo Client, store JWT tokens in localStorage or httpOnly cookies, create auth context/hook for global auth state, redirect to Data screen after successful login. `M`

**Testing Guide (All Users - First Real Login):**
- Open `http://localhost:3000` in a FRESH browser (or incognito mode)
- You should see a login screen (not the app directly)
- Try logging in with WRONG credentials - should show error message
- Try logging in with correct credentials - should redirect to main app (Data or Employee screen)
- Close browser and reopen - you should still be logged in (session persisted)
- Look for "Logout" button in navigation - clicking it should return you to login screen

**What to check:**
- Can you log in successfully?
- Does it remember you after closing browser?
- Does logout work properly?
- Are wrong credentials rejected with clear error message?

### 36. [x] Role-Based Access Control (RBAC) — Implement authorization guards checking IsAdmin flag and Projects.Manager relationships, protect admin mutations (create/update/delete employees, lock attendance, bulk overtime delete), protect manager mutations (approve overtime, edit others' records), regular employees can only edit their own data. `M`

**Testing Guide (Test with 3 Users):**
- **As Regular Employee:** Log in, try to access "Admin" menu - should be hidden or show "Access Denied"
- **As Manager:** Log in, you should see projects you manage, you can approve overtime for your team members, but you can't access full Admin > Employees screen
- **As Admin:** Log in, you should see all menu items, you can access Admin > Employees, Admin > Projects, you can edit anyone's data

**What to check:**
- Do regular employees see only their own data?
- Can managers approve overtime for their teams?
- Can admins access everything?
- Are unauthorized actions blocked with clear error messages?

---

## Phase 12: Polish & Enhancements (1 week)

**Goal:** Add final touches for production readiness and user experience improvements.

### 37. [ ] Bilingual Support (Slovak/English) — Implement internationalization using next-intl or react-i18next, create translation files for SK and EN, add language switcher in navigation, translate all UI labels and error messages, map catalog values (CinnostTyp, HourType) to translated labels. `M`

**Testing Guide (All Users):**
- Look for language switcher in top navigation (flag icon or "SK / EN" toggle)
- Click to switch from Slovak to English - entire UI should translate immediately
- Check: menu items, form labels, button text, error messages, table headers
- Switch back to Slovak - everything should return to Slovak
- Generated PDFs should also support selected language (if implemented)

**What to check:**
- Does language switching work smoothly?
- Are ALL parts of the UI translated (not just some)?
- Does your browser remember your language preference?
- Do absence types and work types show in correct language?

### 38. [ ] Loading States & Error Handling — Add skeleton loaders for all data tables during fetch, implement error boundary components catching React errors, show user-friendly error messages for GraphQL errors (not raw JSON), add retry buttons on failed requests, implement optimistic UI updates for mutations. `S`

**Testing Guide (All Users):**
- Reload any screen with a data table - you should see "skeleton" loading animation (gray placeholder boxes)
- Try adding a work entry with END TIME before START TIME - should show clear error: "End time must be after start time" (not technical error)
- Disconnect your internet, try saving something - should show "Network error. Retry?" with retry button
- Click retry after reconnecting - should work

**What to check:**
- Do loading states look professional (not just "Loading..." text)?
- Are error messages helpful and in plain language?
- Can you retry failed actions easily?
- Does the app feel responsive?

### 39. [ ] Mobile Responsive Design — Ensure all screens work on mobile devices (phones/tablets) using TailwindCSS responsive utilities, convert data tables to card layout on mobile, make forms touch-friendly with larger tap targets, test on iPhone/Android. `M`

**Testing Guide (All Users - Mobile):**
- Open `http://localhost:3000` on your smartphone
- Try logging in - form should be easy to tap
- Navigate to Data screen - table should adapt to small screen (possibly cards instead of table)
- Try adding a work entry - all form fields should be easily tappable (not too small)
- Try date pickers and dropdowns - should show mobile-native pickers where appropriate

**What to check:**
- Can you use the app comfortably on your phone?
- Is text readable without zooming?
- Are buttons easy to tap (not too small)?
- Does navigation menu work on mobile (hamburger menu)?

### 40. [ ] Performance Optimization — Implement GraphQL query result caching in Apollo Client, add pagination for large tables (employees, projects), lazy load components using React.lazy, optimize bundle size, add indexes to database queries if needed. `S`

**Testing Guide (Admin User - Large Dataset):**
- Go to Admin > Employees screen (if you have 50+ employees)
- Page should load quickly (under 2 seconds)
- Scroll through table - should be smooth without lag
- Go to Data screen, load "Last year" filter with hundreds of records
- Should paginate (load 50 at a time with "Load More" button or infinite scroll)

**What to check:**
- Does the app feel fast even with lots of data?
- Do large tables load incrementally (not all at once)?
- Is scrolling smooth?
- Do filters apply quickly?

### 41. [ ] Automatic Overtime Calculation Job — Implement scheduled background job (using @nestjs/schedule or Bull queue) that runs nightly, calculates daily surplus hours for each employee by comparing work record hours against FondPracovnehoCasu threshold, creates automatic Nadcasy entries (Typ='Flexi', Schvalil=1) for surplus, deletes old automatic entries if hours drop below threshold. `M`

**Testing Guide (Admin User - Day After):**
- This job runs automatically at night (e.g., 2 AM)
- Next morning, check Overtime screen for employees
- Employees who worked >8 hours yesterday (or their threshold) should have new automatic overtime entry for yesterday
- Entry should show: Date (yesterday), Hours (surplus amount), Type "Flexi", Approved By "—", Note "Calculated automatically"
- Ask employees: did they work overtime yesterday? Does the automatic entry match?

**What to check:**
- Do automatic entries appear the next day?
- Are hours calculated correctly (only surplus over threshold)?
- Are contractors (SZČO) excluded from automatic overtime?
- Can admins manually edit or delete automatic entries if needed?

---

## Phase 13: Final Testing & Documentation (3 days)

**Goal:** Ensure production readiness with comprehensive testing and user documentation.

### 42. [ ] End-to-End Testing Suite — Write E2E tests using Playwright or Cypress covering critical flows: login, add work entry, edit work entry, generate work report, lock attendance, create employee. Set up CI/CD pipeline to run tests on every deployment. `M`

**Testing Guide (Developer QA):**
- Developer runs automated test suite
- Tests simulate real user clicking through the app
- Tests should pass 100% before production deployment
- Non-technical users don't need to do anything here

### 43. [ ] User Documentation & Testing Guides — Create user manual with screenshots for each feature: how to log in, add work entries, view overtime, generate reports, manage employees (admin), manage projects (admin). Include troubleshooting section. Write migration guide from legacy desktop app. `M`

**Testing Guide (All Users - Final Validation):**
- You'll receive a user manual (PDF or web page)
- Follow the manual step-by-step for YOUR role (Employee, Manager, or Admin)
- Try each feature described in the manual
- Check if instructions match what you see in the app
- Report any confusing parts or missing information

**What to check:**
- Is the manual clear and easy to follow?
- Are screenshots up-to-date?
- Does troubleshooting section address common issues?
- Is the migration guide helpful?

### 44. [ ] Production Deployment & Handover — Deploy backend to production server (Railway/Fly.io/Render), deploy frontend to Vercel, configure production database, set up monitoring (error tracking, performance), create admin accounts, train users, perform final acceptance testing with real data. `L`

**Testing Guide (All Users - Production Launch):**
- You'll receive production URL (e.g., `https://attendance.yourcompany.com`)
- Log in with your credentials
- Verify YOUR real work data is present and correct
- Try all features you use regularly (add entry, view overtime, generate report)
- This is LIVE DATA - be careful not to delete important records
- Report any issues immediately

**What to check (Critical Final Validation):**
- Is all your historical data present and correct?
- Can you access the app from your usual work location?
- Does it work on your usual browser and devices?
- Are locked dates still enforced correctly?
- Can you generate official reports that match legal requirements?

---

## Notes

- **Effort Scale:** XS (1 day), S (2-3 days), M (1 week), L (2 weeks), XL (3+ weeks)
- **Dependencies:** Items are ordered by technical dependencies - each builds on previous work
- **Testing Focus:** Every phase ends with a testable milestone that non-technical users can validate in their browser
- **Legacy Parity Priority:** Phases 1-10 focus on replicating legacy functionality; Phases 11-13 add modern enhancements
- **Incremental Delivery:** Application is usable after Phase 4 (read-only), functional after Phase 8 (CRUD complete), production-ready after Phase 13

## Testing Principles for Non-Technical Users

**What "Testing" Means:**
- Open the web app in your browser (Chrome, Firefox, Safari)
- Click around like you would use the app normally
- Try to break things (enter wrong data, click rapidly, etc.)
- Check if what you see matches what you expect from the old desktop app
- Tell your developer: "This works!" or "This is broken because..."

**You Don't Need To:**
- Write code or look at code
- Understand technical terms like "GraphQL" or "mutation"
- Use developer tools or command line
- Fix bugs yourself - just report them

**What To Report:**
- "I can't see my vacation balance" (missing feature)
- "When I click Save, nothing happens" (broken functionality)
- "The hours are calculated wrong for night shifts" (business logic bug)
- "This button is too small on my phone" (usability issue)
- "I don't understand what 'HourType' means" (unclear labeling)

---

**Target Timeline:** 12-14 weeks (3-3.5 months) for complete legacy parity + modern enhancements + production deployment

**Success Criteria:** Non-technical users can perform all legacy desktop app functions in web browser with equal or better user experience, all Slovak legal requirements met, production deployed with authentication and role-based access control.
