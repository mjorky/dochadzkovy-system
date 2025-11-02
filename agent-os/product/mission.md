# Product Mission

## Pitch
Attendance System is a modern web-based time tracking and workforce management platform that helps Slovak businesses, project managers, and employees streamline working hours, automate overtime calculation, and generate legally-compliant reports by providing a comprehensive, testable solution that migrates legacy C# WPF functionality to a modern TypeScript stack while preserving proven data architecture and adding bilingual support.

## Users

### Primary Customers
- **Small to Medium Slovak Businesses**: Companies needing robust time tracking with Slovak labor law compliance (§99 č. 311/2001 Z.z. Zákonník práce)
- **Project-Based Organizations**: Businesses tracking employee hours across multiple projects requiring project-specific statistics and resource allocation visibility
- **International Teams with Slovak Operations**: Organizations with multilingual teams needing Slovak/English support while maintaining Slovak legal compliance

### User Personas

**Employee** (25-60 years old)
- **Role:** Full-time staff, contractor (SZČO), student worker, or part-time worker
- **Context:** Daily work activity tracking, vacation balance monitoring, overtime accumulation oversight
- **Pain Points:** Manual time tracking is tedious and error-prone; difficult to remember exact hours worked; unclear overtime accumulation; vacation balance confusion; legacy desktop app limits mobility
- **Goals:** Quickly log work hours with minimal effort; view automatic overtime calculations; check remaining vacation days; access system from web browser anywhere; generate work reports for compliance

**Manager** (30-55 years old)
- **Role:** Project manager overseeing one or more projects
- **Context:** Tracking team member hours on projects, approving overtime, generating project efficiency statistics
- **Pain Points:** Difficult to see project hour allocation; manual overtime approval is time-consuming; hard to generate project efficiency reports; no visibility into productive vs non-productive hours; legacy desktop app requires VPN access
- **Goals:** Monitor project hour allocation in real-time; approve/decline overtime requests efficiently; generate project-specific work lists; ensure team time tracking compliance; access data remotely via web

**Employer/Admin** (35-65 years old)
- **Role:** Business owner or HR administrator
- **Context:** Managing employee master data, setting permissions, locking attendance periods, overseeing all time tracking operations
- **Pain Points:** Manual employee data management in desktop app; no centralized web-based control; difficult to prevent retroactive time entry tampering; complex legal reporting requirements; legacy system requires local installation
- **Goals:** Manage employee database efficiently from anywhere; lock attendance records to prevent tampering; generate legally-compliant work reports; control access permissions; track total overtime costs; modernize system without losing data

## The Problem

### Legacy Desktop Application Limits Modern Workflows
The existing C# WPF desktop application, while functionally robust, requires local installation, limits remote access, and lacks modern web-based collaboration features. Employees working remotely or traveling cannot easily access the system. The desktop-only architecture creates deployment complexity, version control challenges, and prevents mobile access. This legacy approach costs businesses flexibility in an increasingly remote work environment.

**Our Solution:** Modern web-based architecture accessible from any browser, mobile-responsive design enabling time tracking from smartphones/tablets, centralized deployment eliminating installation overhead, and progressive web app capabilities for offline work entry.

### Inefficient and Error-Prone Time Tracking
Businesses struggle with time tracking systems requiring manual data entry, leading to errors, lost records, and compliance risks. Managers spend 2-4 hours per week per manager in administrative overhead consolidating data, calculating overtime, and generating reports. The legacy system's complexity intimidates non-technical users.

**Our Solution:** Automated time entry with smart suggestions (next workday calculation skipping weekends/holidays, record copying across days), automatic overtime calculation based on employee type and daily thresholds, one-click report generation eliminating manual consolidation, and modern UI with intuitive workflows reducing training time.

### Lack of Legal Compliance and Audit Trail
Organizations face legal risks when they cannot produce properly formatted work reports complying with Slovak labor law requirements. Without robust locking mechanisms, employees can retroactively modify time entries, making audit trails unreliable and exposing companies to legal liability and payroll fraud.

**Our Solution:** Built-in Slovak legal compliance with official work report generation (PDF format matching legal requirements), two-tier attendance record locking (per-record and employee-level by date) preventing retroactive changes, comprehensive audit trail through database-tracked modifications, and automated overnight work span calculation handling night shift workers.

### Poor Project Hour Visibility
Project-based organizations cannot easily answer critical questions like "How many productive vs non-productive hours were spent on Project X?" or "Which projects consume the most resources?" This lack of visibility leads to poor resource allocation, inaccurate project pricing, and difficulty identifying inefficient projects.

**Our Solution:** Project-specific hour tracking with productivity categorization (productive, non-productive, productive abroad SK/CZ, non-productive abroad, productive 70%), automated work list generation showing hour breakdowns by project, manager assignment enabling project-level oversight, and CSV export for external analysis.

## Differentiators

### Proven Per-Employee Table Architecture with Legacy Compatibility
Unlike traditional normalized database systems, we preserve the battle-tested per-user table structure (`t_{FirstName}_{LastName}`) from the legacy C# WPF application. This architecture enabled seamless migration from the existing system while maintaining data integrity and query performance. Each employee's work records are isolated in dedicated tables, with a union view (`AllTData`) providing global reporting capabilities. This approach supports dynamic employee creation/renaming with automatic table management and view regeneration, eliminating migration risk.

### Dual Employment Type Support with Smart Overtime
We support diverse employment types (Full Employee, Contractor/SZČO, Student, Part-time) with type-specific overtime calculation. Each employee type has a configurable daily hour threshold (`FondPracovnehoCasu` from `ZamestnanecTyp` table), enabling accurate overtime tracking. Contractors (SZČO) are excluded from overtime calculations entirely, while employees get automatic overtime ledger entries with type classification (Flexi, Unpaid, Business Trip SK, Business Trip Abroad). This flexibility accommodates various worker classifications within a single system, matching Slovak employment law nuances.

### Bilingual Interface with Slovak Legal Compliance
The system provides full English and Slovak language support, making it accessible to international teams while maintaining strict compliance with Slovak labor law (Zákonník práce §99). All catalog values, UI labels, and generated reports support both languages. Official work reports automatically format data according to Slovak legal requirements, including proper categorization of absence types (PN, OČR, Lekár, Dovolenka, etc.) and overtime handling. Unlike generic time tracking tools, our system understands Slovak employment regulations.

### Comprehensive Two-Tier Locking Mechanism
We provide dual locking for data integrity: (1) per-record lock flags preventing individual record modification, and (2) employee-level lock dates (`ZamknuteK`) freezing all records up to a specific date. This dual approach gives administrators fine-grained control over data immutability, ensuring that once payroll is processed or legal reports are filed, historical data cannot be altered. This prevents fraud, ensures audit compliance, and provides legal protection unavailable in typical time tracking systems.

### Intelligent Overnight Work Span Support
The system intelligently handles work sessions spanning midnight by automatically adding 24 hours to time calculations when `EndTime < StartTime`. This feature is essential for night shift workers, security personnel, IT operations, or employees working late into the night. Most time tracking systems fail to handle this edge case, requiring manual workarounds or split entries. Our legacy-proven algorithm ensures accurate hour calculation regardless of shift timing.

### Modern Stack with Backward Compatibility
We modernize the proven legacy C# WPF codebase using NestJS (TypeScript backend) + Next.js 14 (TypeScript frontend) + GraphQL, providing type safety end-to-end while preserving 100% of legacy functionality. The database schema remains unchanged for zero-risk migration. The example-reference implementation demonstrates successful frontend-backend-database integration with working UI screens, proving the architecture viability before full development.

## Key Features

### Core Features
- **Work Record Management:** Employees create, view, edit, and delete work records with fields for date, project, productivity type (HourType), work type (HourTypes), start/end time, description, distance traveled (km), and long-term business trip flag. Smart defaults suggest next workday (skipping weekends/holidays from `Holidays` table), enforce 30-minute time increments, and allow overnight spans. Per-user tables (`t_{Name}_{Surname}`) store records with automatic table creation/rename on employee lifecycle events.

- **Automatic Overnight Hour Calculation:** Work sessions spanning midnight are automatically detected (when `EndTime < StartTime`) and correctly calculated by adding 24 hours to the time difference. This legacy-proven algorithm ensures accurate hour tracking for night shifts without manual intervention or split entries.

- **Automatic Overtime Calculation:** Daily hours are compared against employee type thresholds (`ZamestnanecTyp.FondPracovnehoCasu`). Surplus hours automatically create overtime ledger entries in `Nadcasy` table with type (Flexi, Unpaid Overtime, Business Trip SK, Business Trip Abroad), approval tracking (`Schvalil`), and notes (`Poznamka`). Automated entries default to `Typ='Flexi'` with `Schvalil=NULL`. Managers/admins can manually edit, approve, or create deduction entries (`Odpocet=true`) to adjust balances.

- **Employee Balance Overview:** Displays vacation days remaining (from `Zamestnanci.Dovolenka` float field) and year-to-date hours consumed for Doctor, Doctor Accompaniment, and Doctor Accompaniment Disabled categories (computed from work records filtering `CinnostTyp`). Provides at-a-glance visibility into time-off balances and entitlement consumption.

- **Two-Tier Record Locking:** Prevents retroactive changes via dual mechanism: (1) per-record `Lock` boolean flag makes individual entries read-only, (2) employee-level `ZamknuteK` date field freezes all records on or before that date. Admin action "Lock attendance up to date" sets both `ZamknuteK` and bulk-updates per-user table records with `Lock=true` for dates ≤ specified date. Ensures audit compliance and prevents time entry fraud after payroll processing.

### Collaboration Features
- **Manager Oversight:** Managers (derived from `Projects.Manager` FK assignments) view team member hours on their projects, approve/decline overtime requests, and access project-specific work lists. Provides accountability and enables resource management without granting full admin privileges.

- **Admin Employee Management:** Admins create/update/delete employees (`Zamestnanci` table), set employee types (`TypZamestnanca` FK), adjust vacation balances (`Dovolenka`), configure admin privileges (`IsAdmin`), set yearly overtime in salary (`RocnyNadcasVPlate`), upload signatures (`Podpis` bytea), and lock attendance periods. Automatic per-user table creation (`CREATE TABLE t_{Name}_{Surname}`) and `AllTData` union view regeneration on employee changes. Employee rename triggers table rename and view regeneration.

- **Admin Project Management:** Admins configure projects with unique number (`Projects.Number`), name, description, country (`CountryCode` FK to `Countries`), manager assignment (`Manager` FK to `Zamestnanci`), and active status (`AllowAssignWorkingHours` boolean). Active projects appear in work record dropdowns via `ActiveProjects` view. Enables centralized project lifecycle control and manager assignment.

### Advanced Features
- **Official Work Report (PDF):** Generates legally-compliant Slovak work report (Zákonník práce §99) over selected month with two pages: (1) Daily work table showing employee name, weekday, date, time from/to, hours worked, and absence reason (mapped from `CinnostTyp.Alias`); (2) Four summary tables (Work summary, Weekend work, Holiday work, Business trips) with category breakdowns (Prítomný v práci, Mimo pracoviska, Dovolenka, Práce neschopnosť, Ošetrenie člena rodiny, Lekár, etc.). Header includes month range, count of workdays (excluding weekends/holidays), and total hours. Export to PDF for official filing with labor authorities.

- **Project Work List (PDF):** Produces project-specific hour statistics for selected employee and month, aggregating hours by project number (`Projects.Number`) and grouping by productivity buckets: Produktívne, Neproduktívne, ProduktívneOutSKCZ (productive outside SK/CZ), NeproduktívneZ (non-productive abroad), Produktívne70 (70% productive). Includes total km traveled (sum of `km` field), project manager name (from `Projects.Manager` → `Zamestnanci` with full name composition), and employee signature (from `Zamestnanci.Podpis`). Export to PDF for client billing or internal project analysis.

- **CSV Export for Filtered Data:** Exports currently filtered work records to CSV format with user-selectable file path. Default filter shows last 31 days; "show whole month" toggle expands to full month of start date. Enables data portability for external analysis, backup, or integration with payroll systems.

- **Bilingual UI (Slovak/English):** All UI labels, catalog values, and reports support both Slovak and English. Language preference persists per user session. Catalog translations (e.g., `CinnostTyp.Alias`, `HourType.HourType`) are mapped at UI layer for flexibility. Database stores Slovak values; UI renders English equivalents via translation mapping.

- **Holiday and Weekend Awareness:** Next workday suggestions automatically skip Saturdays, Sundays, and dates in `Holidays` table (seeded with Slovak public holidays). Legal work day counts (for Work Report) exclude these dates. Working day calculation function (`GetWorkingDays` from legacy) counts days between ranges excluding weekends/holidays. Ensures accurate overtime calculation and compliance with Slovak labor law regarding work day definitions.

- **Bulk Overtime Operations:** Admin/manager can bulk remove app-created overtime entries (where `Nadcasy.Schvalil = 1` and `Odpocet = false`) for date ranges, enabling correction of automatic calculations during system adjustments. Manual overtime entries (where `Schvalil != 1`) are protected from bulk removal to preserve intentional manager decisions.

- **Record Copy Across Days:** Users can select work records and duplicate them to multiple dates with single action. System suggests next working days (skipping weekends/holidays) and creates multiple insert operations. Reduces repetitive data entry for recurring tasks.

- **Dynamic Per-User Table Lifecycle:** System automatically creates per-user work record tables (`CREATE TABLE public."t_{FirstName}_{LastName}"`) on employee creation, renames tables on employee name change, and regenerates `AllTData` union view to reflect current employee set. This legacy-proven architecture ensures data isolation and query performance while supporting dynamic employee management.
