# Product Mission

## Pitch
Attendance System is a web-based time tracking and workforce management platform that helps employers and employees streamline working hours, overtime calculation, and project reporting by providing a comprehensive, legally-compliant solution that automates time tracking, generates official reports, and enables efficient project-based hour allocation.

## Development Strategy
This project follows a **backend-first development approach** to ensure the complex business logic (Slovak labor law compliance, automatic overtime calculation, data locking mechanisms) is fully implemented, tested, and stable before building the user interface. The Node.js (Nest.js) + GraphQL backend serves as a robust API that can be consumed by multiple clients (web frontend, mobile apps, legacy C# WPF integration).

## Users

### Primary Customers
- **Small to Medium Businesses**: Companies needing a robust time tracking system with legal compliance for Slovak labor law (§99 č. 311/2001 Z.z. Zákonník práce)
- **Project-Based Organizations**: Businesses that need to track employee hours across multiple projects and generate project-specific statistics
- **International Teams**: Organizations with employees in multiple countries requiring multi-language support (Slovak/English)

### User Personas

**Employee** (25-60 years old)
- **Role:** Full-time staff member, contractor (SZČO), student worker, or part-time worker
- **Context:** Needs to track daily work activities, manage vacation balances, and monitor overtime
- **Pain Points:** Manual time tracking is tedious and error-prone; hard to remember exact hours worked; difficult to track overtime accumulation; vacation balance unclear
- **Goals:** Quickly log work hours with minimal effort; automatically calculate overtime; view remaining vacation days; generate work reports for compliance

**Manager** (30-55 years old)
- **Role:** Project manager overseeing one or more projects
- **Context:** Responsible for tracking team member hours on projects, approving overtime, and generating project statistics
- **Pain Points:** Difficult to see how many hours team members worked on specific projects; manual overtime approval is time-consuming; hard to generate project efficiency reports
- **Goals:** Monitor project hour allocation; approve/decline overtime requests; generate project-specific work lists; ensure team compliance with time tracking

**Employer/Admin** (35-65 years old)
- **Role:** Business owner or HR administrator
- **Context:** Manages employee master data, sets permissions, locks attendance periods, and oversees all time tracking operations
- **Pain Points:** Manual employee data management; no centralized control over time tracking; difficult to prevent retroactive time entry changes; complex legal reporting requirements
- **Goals:** Manage employee database efficiently; lock attendance records to prevent tampering; generate legally-compliant work reports; control access permissions; track total overtime costs

## The Problem

### Inefficient and Error-Prone Time Tracking
Businesses struggle with manual time tracking systems that require employees to maintain paper timesheets or use spreadsheets, leading to errors, lost records, and compliance risks. Managers spend hours consolidating data, calculating overtime, and generating reports. This manual process costs businesses an estimated 2-4 hours per week per manager in administrative overhead.

**Our Solution:** Automated time entry with smart suggestions (next workday calculation, record copying), automatic overtime calculation based on employee type, and one-click report generation that eliminates manual data consolidation.

### Lack of Legal Compliance and Audit Trail
Organizations face legal risks when they cannot produce properly formatted work reports that comply with Slovak labor law requirements (§99 č. 311/2001 Z.z.). Without proper locking mechanisms, employees can retroactively modify time entries, making audit trails unreliable and exposing the company to legal liability.

**Our Solution:** Built-in legal compliance with official work report generation (PDF format matching legal requirements), attendance record locking by date to prevent retroactive changes, and comprehensive audit trail through database-tracked modifications.

### Poor Project Hour Visibility
Project-based organizations cannot easily answer critical questions like "How many productive vs non-productive hours were spent on Project X?" or "Which projects are consuming the most resources?" This lack of visibility leads to poor resource allocation, inaccurate project pricing, and difficulty identifying inefficient projects.

**Our Solution:** Project-specific hour tracking with productivity categorization (productive, non-productive, productive abroad, etc.), automated work list generation showing hour breakdowns by project, and manager assignment to enable project-level oversight.

## Differentiators

### Per-Employee Table Architecture with Legacy Compatibility
Unlike traditional normalized database systems, we preserve the proven per-user table structure (`t_{FirstName}_{LastName}`) from the legacy C# WPF application. This enables seamless migration from the existing system while maintaining data integrity and performance. Each employee's work records are isolated in dedicated tables, with a union view (`AllTData`) providing global reporting capabilities. This architecture supports dynamic employee creation/renaming with automatic table management.

### Dual Employment Type Support with Smart Overtime
We support diverse employment types (Full Employee, Contractor/SZČO, Student, Part-time) with type-specific overtime calculation. Each employee type has a configurable daily hour threshold (`FondPracovnehoCasu`), enabling accurate overtime tracking. Contractors (SZČO) are excluded from overtime calculations entirely, while employees get automatic overtime ledger entries. This flexibility accommodates various worker classifications within a single system.

### Bilingual Interface with Slovak Legal Compliance
The system provides full English and Slovak language support, making it accessible to international teams while maintaining strict compliance with Slovak labor law (Zákonník práce §99). All catalog values, UI labels, and generated reports support both languages. Official work reports automatically format data according to Slovak legal requirements, including proper categorization of absence types (PN, OČR, Lekár, etc.) and overtime handling.

### Comprehensive Locking Mechanism for Data Integrity
We provide a two-tier locking system: (1) per-record lock flags that prevent individual record modification, and (2) employee-level lock dates (`ZamknuteK`) that freeze all records up to a specific date. This dual approach gives administrators fine-grained control over data immutability, ensuring that once payroll is processed or legal reports are filed, historical data cannot be altered. This prevents fraud and ensures audit compliance.

### Overnight Work Span Support
The system intelligently handles work sessions that span midnight by automatically adding 24 hours to the time calculation when `EndTime < StartTime`. This feature is essential for night shift workers, security personnel, or employees working late into the night. Most time tracking systems fail to handle this edge case, requiring manual workarounds or split entries.

## Key Features

### Core Features
- **Work Record Management:** Employees can create, view, edit, and delete work records with fields for date, project, productivity type, work type, start/end time, description, distance traveled (km), and long-term business trip flag. Smart defaults suggest the next workday, skip weekends/holidays, and enforce 30-minute time increments.
- **Automatic Overtime Calculation:** Daily hours are compared against employee type thresholds (`FondPracovnehoCasu`). Surplus hours automatically create overtime ledger entries with type (Flexi, Unpaid, Business Trip SK, Business Trip Abroad), approval tracking, and notes. Managers/admins can manually edit, approve, or create deduction entries to adjust balances.
- **Employee Balance Overview:** Displays vacation days remaining (from database field `Dovolenka`) and year-to-date hours consumed for Doctor, Doctor Accompaniment, and Doctor Accompaniment Disabled categories (computed from work records). Provides at-a-glance visibility into time-off balances.
- **Record Locking for Data Integrity:** Two-tier locking prevents retroactive changes: (1) per-record `Lock` flag makes individual entries read-only, (2) employee-level `ZamknuteK` date freezes all records on or before that date. Ensures audit compliance and prevents time entry fraud.

### Collaboration Features
- **Manager Oversight:** Managers (derived from `Projects.Manager` assignments) can view team member hours on their projects, approve/decline overtime requests, and access project-specific work lists. Provides accountability and enables resource management.
- **Admin Employee Management:** Admins can create/update/delete employees, set employee types, adjust vacation balances, configure admin privileges, and lock attendance periods. Automatic per-user table creation (`t_{Name}_{Surname}`) and union view regeneration on employee changes.
- **Admin Project Management:** Admins configure projects with number, name, description, country, manager assignment, and active status (`AllowAssignWorkingHours`). Active projects appear in work record dropdowns. Enables centralized project lifecycle control.

### Advanced Features
- **Official Work Report (PDF):** Generates legally-compliant Slovak work report (Zákonník práce §99) with two pages: (1) daily work table showing date, weekday, time from/to, hours, and absence reason; (2) four summary tables (Work summary, Weekend work, Holiday work, Business trips) with category breakdowns. Export to PDF for official filing.
- **Project Work List (PDF):** Produces project-specific hour statistics for a selected employee and month, showing hours grouped by productivity buckets (Produktívne, Neproduktívne, ProduktívneOutSKCZ, NeproduktívneZ, Produktívne70), total km traveled, project manager, and employee signature. Export to PDF for client billing or internal analysis.
- **CSV Export for Filtered Data:** Exports currently filtered work records to CSV format with user-selectable file path. Enables data portability for external analysis, backup, or integration with payroll systems.
- **Bilingual UI (Slovak/English):** All UI labels, catalog values, and reports support both Slovak and English. Language preference persists per user. Catalog translations are mapped at the UI layer for flexibility.
- **Holiday and Weekend Awareness:** Next workday suggestions automatically skip Saturdays, Sundays, and dates in the `Holidays` table (Slovak public holidays). Legal work day counts exclude these dates. Ensures accurate overtime calculation and compliance with labor law.
