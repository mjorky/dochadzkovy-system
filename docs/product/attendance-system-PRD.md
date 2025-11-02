## Attendance System – Product Requirements Document (PRD)

Last updated: 2025-10-21

### Purpose
This PRD consolidates product requirements by merging: (a) the conceptual specification in `docs/product/attendance-system-descriprion.md`, (b) our current Go/GraphQL/PostgreSQL implementation under `backend/`, and (c) the fully working legacy application in `dochadzka-master/` (C# WPF + PostgreSQL). When inconsistencies occur, the live codebases take precedence, with the legacy app used to clarify intended behavior.

### Scope and Priorities
- **Primary sources of truth**:
  - New stack: `backend/db/schema.sql` and GraphQL schema in `backend/internal/graph/schema.graphqls`.
  - Legacy app reference: `dochadzka-master/dochadzka/DB/database.sql`, `PostgreSQLobjects.cs`, `PublicObjects.cs`, `Extensions.cs`.
- **Database policy**: Keep the existing database structure unchanged, including per-user `t_{Meno}_{Priezvisko}` tables and views. No normalization in this version.
- **Phase 1 (Now)**: Expose legacy behaviors as-is (per-user daily records, overtime ledger, locking, reports) through the NestJS GraphQL backend. Existing GraphQL read (to be ported from Go) remains.
- **Phase 2 (Planned)**: Full-feature Data screen CRUD, automated overtime reconciliation, reporting (official PDF and worklist), Admin UI (Employees/Projects), RBAC, localization.

---

## Tech Stack

Backend (NestJS):
- Framework: NestJS (v10+)
- Language: TypeScript
- API: GraphQL (code-first with `@nestjs/graphql`)
- ORM: Prisma (preferred TypeScript DX) or Drizzle (lighter, flexible)
- Database: PostgreSQL (unchanged)
- Testing: Jest (built into NestJS)
- Real-time: GraphQL Subscriptions via WebSocket

Frontend (Next.js):
- Framework: Next.js 14+ (App Router)
- Language: TypeScript
- GraphQL Client: Apollo Client or urql
- UI: TailwindCSS + shadcn/ui (modern, accessible)
- Forms: React Hook Form + Zod
- State: Zustand (simpler than Redux)
- Testing: Vitest + React Testing Library

---

## Personas and Access Levels

Based on current schema and planned roles:
- **Employee (Zamestnanec)**: Standard user. Employment type recorded via `Zamestnanci.TypZamestnanca` → `ZamestnanecTyp.Typ`.
- **Contractor / Freelancer (SZČO)**: Modeled via `ZamestnanecTyp.Typ = 'SZČO'`.
- **Student (Študent)** and **Part-time (Brigádnik)**: Modeled via `ZamestnanecTyp`.
- **Manager**: Derived role – any `Zamestnanci` referenced by `Projects.Manager` (owns at least one project).
- **Employer/Admin**: Explicit via `Zamestnanci.IsAdmin = true`.

Access policy (initial):
- Admin: `Zamestnanci.IsAdmin = true`.
- Manager: any employee referenced by `Projects.Manager` (legacy behavior uses project-manager linkage for responsibility; we retain this in new stack).
- Other users: Employee or Contractor based on `ZamestnanecTyp`.

---

## Internationalization (EN/SK)

- The product must support English and Slovak UI labels. Current seed data values and aliases are in Slovak (e.g., `CinnostTyp.Alias`). UI must map these values to localized labels where applicable.
- Content values (e.g., employee name fields) remain as stored; catalog values should support display translation.

---

## Functional Requirements by Screen

### Employee (Zamestnanec)
**Purpose**: Quick overview of balances (vacation, selected hour-based entitlements), and identity basics.

Current data support:
- `Zamestnanci` fields: first/last name, title prefix/suffix, `Dovolenka` (float), `IsAdmin`, `TypZamestnanca`, `PoslednyZaznam`, `ZamknuteK`, `RocnyNadcasVPlate`, `Podpis`.
- `ZamestnanecTyp.FondPracovnehoCasu` determines standard daily hours for overtime thresholding.

Requirements:
- Display `Dovolenka` (remaining vacation, float). Additional balances like Doctor hours are not yet modeled – defer to Phase 2 (requires new tables/fields).
- Display computed `FullName` (titles + name). Current server composes this; DB view `ZamestnanciFullName` also exists.

Status: Partially supported (Vacation only). Additional balances deferred.

### Data
**Purpose**: Main table with individual work records, filtering, entry, export.

Per legacy model (authoritative and unchanged):
- Per-user work records live in `t_{MenoNoDiacritics}_{PriezviskoNoDiacritics}` with columns:
  - `ID` (PK), `CinnostTypID` (FK), `StartDate` (date), `ProjectID` (FK), `HourTypeID` (FK), `HourTypesID` (FK), `StartTime` (time), `EndTime` (time), `Description` (text), `km` (int), `Lock` (bool), `DlhodobaSC` (bool).
- On employee creation/rename, the system creates/renames this per-user table and regenerates the `AllTData` view (union of all user tables) for global reporting. Hours calculation accounts for overnight spans (if `EndTime < StartTime`, add 24h).

Behavioral requirements (from legacy, to be cloned):
- Default filter: last 31 days; “show whole month” expands to full month of start date.
- Next workday suggestion skips weekends and `Holidays` (see `Extensions.GetWorkingDays` usage and holiday table).
- Record copy across days; 30-minute time steps; end ≥ start; hours auto-calculated with overnight support.
- Respect locking: records with `Lock = true` or dates ≤ `ZamknuteK` become read-only.
- CSV export for filtered data.

Status: Use existing per-user tables; no schema change. Implement GraphQL resolvers to target the correct per-user table.

### Overtime (Nadčasy)
**Purpose**: Automatically and manually managed overtime ledger per employee.

Current schema:
- Table `Nadcasy`: (`ZamestnanecID`, `Datum`, `Nadcas` interval, `Schvalil` employee ID, `Poznamka` text, `Typ` FK to `NadcasyTyp`, `Odpocet` boolean). PK: (`ZamestnanecID`, `Datum`, `Typ`, `Odpocet`).
- Table `NadcasyTyp`: seeded with `Flexi`, `Neplatený nadčas`, `SC SK Cesta`, `SC Zahraničie`.

Requirements (aligned with legacy):
- Daily overtime threshold uses `ZamestnanecTyp.FondPracovnehoCasu`.
- Overtime stored in `Nadcasy` with composite PK and `Odpocet` deduction flag. Save positive `Nadcas` for surplus hours and separate negative/deduction entries for resets/declines.
- Default automated entries: `Typ='Flexi'`, `Schvalil=NULL`, `Poznamka='Calculated automatically'` (localized); allow manual edit by manager/admin.
- Bulk removal tool exists in legacy (`NadcasRemoveBulk`) for dates with `Schvalil = 1` and `Odpocet=false`; provide equivalent admin action.
- Display: Date, Overtime hh:mm (signed), Type, Approved by (resolver to full name), Note, and whether it is deduction (`Odpocet`).

Status: Data model present; calculation and UI logic pending until WorkRecords exist.

### Work Report (Official)
**Purpose**: Legal work report over a selected month.

Requirements:
- Header info: month range, count of workdays, count of hours in range.
- Table: name, weekday, date, time from, time till, hours, reason of absence.
- PDF export of the view (2 pages):
  - Page 1: the table above.
  - Page 2: four summary tables (Work summary, Weekend work, Holiday work, Business trips) with rows: `Prítomný v práci`, `Mimo pracoviska`, `Dovolenka`, `Práce neschopnosť`, `Ošetrenie člena rodiny`, `Lekár`, `Lekár doprovod`, `Lekár dopr. zdrav. postih.`, `Paragraf`, `Spolu`.

Schema and legacy alignment:
- Categories map to `CinnostTyp` (`Typ` and `Alias`). Legacy code composes report rows from per-user tables and flags travel (`HourTypes` category) and territory (SK vs abroad) via project/country and HourType value.
- Overtime, weekend, and holiday calculations use `Holidays` and calendar, with time computed as in `AllTData` view (overnight aware).

Status: Not yet implemented (requires WorkRecords and reporting layer).

### Work List
**Purpose**: Project-specific hour statistics for a user/month with PDF export.

Requirements:
- Columns: Order ID (Projects.Number), hours grouped by productivity `HourType` buckets (`Produktívne`, `Neproduktívne`, `ProduktívneOutSKCZ`, `NeproduktívneZ`, `Produktívne70`), `KM` (sum distance), `Projekt manažér` (Projects.Manager → `Zamestnanci`), `Podpis` (employee signature from `Zamestnanci.Podpis`).

Schema and legacy alignment:
- Projects and managers exist; productivity catalog exists. Legacy aggregates by `Project.Number` and `HourType` id into fields: Produktívne, Neproduktívne, ProduktívneZ, NeproduktívneZ, Produktívne70; sums `KM`; and fetches PM.
- Implement same aggregation over `WorkRecords` in new stack.

Status: Not yet implemented (requires WorkRecords and aggregation queries).

### Admin – Employees
**Purpose**: Manage employee master data and lock dates.

Columns and mapping:
- ID → `Zamestnanci.ID`
- Meno (Name) → `Zamestnanci.Meno` (editable)
- Priezvisko (Surname) → `Zamestnanci.Priezvisko` (editable)
- Titul pred (Prefix) → `Zamestnanci.TitulPred` (editable)
- Titul za (Suffix) → `Zamestnanci.TitulZa` (editable)
- Dovolenka (Vacation) → `Zamestnanci.Dovolenka` (float)
- Nadčas v plate [h/rok] → `Zamestnanci.RocnyNadcasVPlate`
- Je admin → `Zamestnanci.IsAdmin` (checkbox)
- Typ → `Zamestnanci.TypZamestnanca` (combobox from `ZamestnanecTyp`)
- Celkový nadčas [h] → aggregation over `Nadcasy` (sum intervals, considering `Odpocet` entries)
- Posledný záznam → `Zamestnanci.PoslednyZaznam` (system-maintained)
- Zamknuté k → `Zamestnanci.ZamknuteK` (lock date)

Actions (per legacy behavior; to be cloned):
- Create employee: insert into `Zamestnanci`, create per-user table `t_{MenoNoDiacritics}_{PriezviskoNoDiacritics}`, and regenerate `AllTData`.
- Update and rename: if name changes, rename the per-user table accordingly and regenerate `AllTData`.
- Lock attendance up to date: set `ZamknuteK` and set `Lock = true` for per-user records ≤ date.
- Export JSON.

Status: Data model present; UI and mutations pending.

### Admin – Projects
**Purpose**: Manage projects lifecycle and attributes.

Columns and mapping:
- ID → `Projects.ID`
- Name → `Projects.Name` (clickable link to detail in UI)
- Project number (Číslo projektu) → `Projects.Number`
- Description → `Projects.Description`
- Assigned Hours → NOT PRESENT in schema; defer to Phase 2 (new column)
- Active Project (Aktívny) → mapped to `Projects.AllowAssignWorkingHours` (boolean)
- Country (Krajina) → `Projects.CountryCode` → `Countries`
- Manager (Manažér) → `Projects.Manager` → `Zamestnanci`

Interactivity:
- Filtering/sorting by any column; checkbox to show only active projects (`AllowAssignWorkingHours = true`).
- Real-time updates after edit.
- Export JSON with selectable columns.

Status: Data model present; UI and mutations pending.

---

## Data Model (Current Schema + Legacy Reference)

Authoritative definitions from `backend/db/schema.sql` (summarized):
- `ZamestnanecTyp(Typ PK, FondPracovnehoCasu int)` – employment types and daily standard hours.
- `Zamestnanci` – employee master: identity, vacation (float), admin flag, employment type FK, signature, yearly overtime in salary, last record date, locked-until date.
- `Countries(CountryCode PK, CountryName)`.
- `Projects` – project master: unique `Number`, country FK, manager FK (`Zamestnanci`), `AllowAssignWorkingHours` boolean (used as Active).
- `Nadcasy` – overtime ledger with composite PK and `Odpocet` boolean for deduction records.
- `NadcasyTyp` – overtime types.
- `HourType` – productivity categories (Produktívne, ProduktívneOutSKCZ, Produktívne70, Neproduktívne, NeproduktívneZ).
- `HourTypes` – types of work (Rezia, Cestovanie, ... Generator).
- `Holidays(Den PK)` – public holidays (Slovak republic target; can be extended).
- `CinnostTyp(ID PK, Typ, Alias, Zmazane)` – attendance/absence categories and display alias, with soft-delete flag.
- Views: `ActiveProjects` (Number/Name joined label), `ZamestnanciFullName` (title-aware name rendering, special case for ID=1 → "Aplikácia").
- `Verzia` – schema versioning table; current set to 1.4.1.

Legacy structures (authoritative):
- Per-user `t_{Meno}_{Priezvisko}` tables with structure shown above; `AllTData` union view; dynamic creation/rename on employee add/update.

---

## API (GraphQL) – Target (NestJS) and Planned

Target GraphQL API (NestJS):
- Code-first schema using `@nestjs/graphql` with TypeScript decorators.
- Queries for listing and fetching employees, projects, catalogs, overtime, and per-user work records.
- Mutations for creating/updating employees (including per-user table lifecycle hooks), projects, work records, and overtime (including deductions and bulk removal), and for lock actions.
- Subscriptions (optional, Phase 2) for real-time updates to work records and overtime changes.

Frontend integration (Next.js):
- Apollo Client or urql for queries/mutations/subscriptions.
- Infinite scroll via offset-based pagination for work records (newest first).

Planned extensions (Phase 2):
- Queries & Mutations for `Projects`, `Nadcasy` (overtime), catalogs (`CinnostTyp`, `HourType`, `HourTypes`, `Countries`), per-user WorkRecords CRUD mirroring legacy.
- Pagination, filtering, and sorting across main lists.
- Admin actions (save fields, lock attendance, export triggers if needed server-side).

---

## Business Rules and Validations

General:
- Dates and times must be valid; time inputs in 30-minute increments.
- Locking: If `Zamestnanci.ZamknuteK` is set, no edits (WorkRecords or Overtime) are allowed for that employee with `date ≤ ZamknuteK`.

Overtime:
- Threshold hours per day are from `ZamestnanecTyp.FondPracovnehoCasu`.
- Automatic overtime entries: created for days where total hours exceed threshold; default `Typ = 'Flexi'`, `Schvalil = NULL`.
- Resets require `Odpocet = true`, non-empty `Poznamka`, and an acting `Schvalil` (manager/admin). Bulk deletions permitted for app-created entries where appropriate.

Absence and Presence:
- `CinnostTyp` governs valid absence/presence types; records mapped to `Alias` for reports. Records where `Zmazane = true` must be excluded from new selections but remain readable historically.

Projects:
- Only projects with `AllowAssignWorkingHours = true` appear in active assignments and the `ActiveProjects` view.

Holidays and Weekends:
- Date suggestions and legal counts exclude Saturdays/Sundays and any date in `Holidays`.

Localization:
- All fixed labels must support EN/SK display. Catalog labels (e.g., `Alias`) currently seeded in SK; UI must render English equivalents via translation mapping (to be defined in UI tier or a translation table in Phase 2). Legacy UI uses Slovak; new UI adds bilingual support.

---

## Non-Functional Requirements

- Security: Authentication required for all non-public endpoints; RBAC enforced based on `IsAdmin`, project manager derivation, and user identity. Transport must be HTTPS in production.
- Auditability: Future audit trails for Admin edits (employees/projects) and overtime resets (who, when, what changed, reason) – via additional audit tables or structured logs.
- Performance: Queries should be index-backed (PKs/unique constraints already present). Pagination required for large lists (employees, projects, work records).
- Reliability: DB migrations must be versioned and idempotent (pattern already present via `Verzia`).

---

## Deliverables and Acceptance Criteria

Phase 1 (now):
- Employee read API: `employees`, `employee(id)` – implemented.
- DB catalogs seeded: `ZamestnanecTyp`, `CinnostTyp`, `HourType`, `HourTypes`, `Holidays`, `NadcasyTyp`, `Countries` – present.
- Overtime model present (`Nadcasy`) with constraints and keys – present.
- Legacy parity documented here for: per-user work record storage, locking, overtime flows, reporting aggregations.

Phase 2 (planned):
- Implement `WorkRecords` table and GraphQL CRUD (overnight-aware time diff, lock flag).
- Migration/ingestion utility to import legacy per-user tables into `WorkRecords`.
- Data screen with filtering, entry assistance, copy, and CSV export.
- Overtime auto-calculation job/process using WorkRecords and `FondPracovnehoCasu`; add admin tools for bulk remove/reset.
- Work Report and Work List generation with PDF export, matching legacy calculations.
- Admin UI + GraphQL mutations for Employees and Projects (including lock date setting and signature upload).
- RBAC rules enforced for Admin and Manager roles.
- Localization coverage for EN/SK across UI and exported documents.

---

## Decisions and Open Questions

1. Assigned Hours on Projects
   - Decision: Keep as future enhancement; no DB change now. Leave as backlog item (`Projects.AssignedHours` candidate).
2. Doctor hours and additional balances beyond vacation
   - Open: Clarify with customer. For now, compute year-to-date from work records; no DB quotas per employee.
3. Manager privileges vs separate role mapping table
   - Decision: Keep it simple now. Manager privileges derive from `Projects.Manager`; Admin can do everything Manager can. Optional role-mapping table may be added later.
4. Signature storage and usage
   - Decision: Store as PNG in `Zamestnanci.Podpis` (bytea). Recommended max size 256 KB; suggested dimensions ~600×300 px; grayscale/PNG-8 acceptable. Used in all generated documents; optional feature; subject to change.
5. Translation source of truth
   - Decision: UI-only translations. No DB translation tables at this time.
6. Preserve per-user physical tables vs normalize
   - Decision: Preserve existing per-user `t_{...}` tables for now. Future migration to a normalized table can be considered later.

---

## Appendix – Catalog Value Mappings

- Absence/Presence (`CinnostTyp.Typ` → `Alias`): seeded as `Prítomnosť → Prítomný v práci`, `PN → Práce neschopnosť`, `Paragraf → Paragraf`, `RD → Dovolenka`, `OČR → Ošetrenie člena rodiny`, `SC → Mimo pracoviska`, `NV → Náhradné voľno`, `PVZ → Platené voľno - zákonné (Zmazane=true)`, `Lekár → Lekár`, `Doprovod → Lekár doprovod`, `DoprovodZP → Lekár dopr. zdrav. postih.`
- Productivity (`HourType.HourType`): `Produktívne`, `ProduktívneOutSKCZ`, `Produktívne70`, `Neproduktívne`, `NeproduktívneZ`.
- Type of work (`HourTypes.HourType`): `Rezia`, `Cestovanie`, `Studium podkladov`, `Porada`, `Programovanie`, `Navrh riesenia`, `Bug Fix`, `Praca na ponukach`, `Programovanie PLC`, `Programovanie SCADA`, `Programovanie HMI`, `sysDOC`, `Praca na Zavaznom Zadani`, `Praca na Test Casoch`, `Ozivenie konfiguracie - stavba`, `Testovanie I/O - stavba`, `Ladenie automatik - stavba`, `Testovanie so zakaznikom [SAT/SCT] - stavba`, `Doprovod vyroby [SOP/OPT] - stavba`, `FAT so zakaznikom`, `Firemne IT`, `IoT`, `Tunel model`, `Generator`.