## Legacy Parity and Behavior Spec (C# WPF → NestJS/Next.js)

This document captures concrete behaviors implemented in the legacy WPF app (`dochadzka-master/`) and maps them to our new stack. It is the single source for parity requirements and edge cases derived from code.

### Core Data Model (unchanged DB)
- Employees: `Zamestnanci` with fields incl. `Dovolenka`, `IsAdmin`, `TypZamestnanca`, `RocnyNadcasVPlate`, `PoslednyZaznam`, `ZamknuteK`, optional `Podpis` image (bytea).
- Projects: `Projects` with unique `Number`, `AllowAssignWorkingHours` (Active), `CountryCode`, `Manager` (FK to `Zamestnanci`). `ActiveProjects` view concatenates `Number/Name`.
- Catalogs: `CinnostTyp`, `HourType` (productivity buckets), `HourTypes` (types of work), `Countries`, `NadcasyTyp`.
- Overtime: `Nadcasy` with composite PK (`ZamestnanecID`, `Datum`, `Typ`, `Odpocet`).
- Per-user work tables: One physical table per user named `t_{MenoNoDiacritics}_{PriezviskoNoDiacritics}` with columns:
  - `ID`, `CinnostTypID`, `StartDate`, `ProjectID`, `HourTypeID`, `HourTypesID`, `StartTime`, `EndTime`, `Description`, `km`, `Lock`, `DlhodobaSC`.
- Reporting view: `AllTData` union across all per-user tables with computed `Hours` and joins to `Projects`, `HourType`, `HourTypes`. Hours handle overnight spans.

### Key Behaviors from Legacy Code
- User add/rename lifecycle (PostgreSQL.DB_UserAdd/Update):
  - Insert employee into `Zamestnanci`.
  - Create per-user table if missing on add; rename on name change.
  - Regenerate `AllTData` view after add/update to reflect the new/renamed per-user table set.
- Work records CRUD (PostgreSQL.DB_t_User*):
  - Insert/Update/Delete records in the correct per-user table.
  - Batch import supports `TRUNCATE` and removal of overtime for the user if `vymazatDataPredPridanim` true.
  - `StartTime/EndTime` persisted; hours computed downstream in view/queries, including overnight: if `EndTime < StartTime`, add 24h.
  - `Lock` boolean prevents editing in UI; lock mechanics documented below.
- Overtime (PostgreSQL.Nadcas*):
  - Sum by type and range (`NadcasSumGet`).
  - Get positive-only or total (`NadcasGet(celkovyNadcas)` toggle includes negative).
  - Insert (`NadcasSet`) refuses 0h, supports optional `Schvalil`, `Poznamka`, and `Odpocet` flag.
  - Update/Delete (`NadcasUpdate`): 0h deletes; otherwise updates hours and approver/note for the same key.
  - Bulk removal (`NadcasRemoveBulk`) only deletes app-created flexi entries (`Schvalil = 1`, `Odpocet = false`).
- Locking:
  - Per-record: `Lock = true` on work items prevents edits.
  - Employee-level: `ZamknuteK` stored on `Zamestnanci`. Helper `UzamkniDochadzku(kDatumu, meno, priezvisko)` sets `Lock = true` for all per-user records with `StartDate <= date`.
  - UI enforces read-only if `Lock = true` or `date <= ZamknuteK`.
- Holidays and working days:
  - `Extensions.GetWorkingDays` counts working days between two dates, excluding weekends and dates in `Holidays`.
  - Used to drive next-workday suggestions and legal counts.
- Enums and string mappings:
  - `NadcasTyp` ↔ DB strings: Flexi, SC SK Cesta, SC Zahraničie, Neplatený nadčas.
  - `ZamestnanecTyp` ↔ DB strings: Zamestnanec, SZČO, Brigádnik, Študent.
  - Diacritics removal for table names is deterministic (`Extensions.RemoveDiacritics`).
- Signatures:
  - `PodpisGet/Set` fetch/store image bytes in `Zamestnanci.Podpis` used in PDF exports.
- Reporting structures:
  - Work Report: `VykazDataObject` exposes `Meno`, day, date, `Od`, `Do` computed from `Od + Odpracovane`, `Odpracovane` double hours, `Dovod`, `IsCestovanie`, `IsSlovensko`, `IsLock`.
  - Worklist: `WorklistObject` aggregates per project `Number`, sums hours by `HourType` buckets (mapping IDs → Produktívne, ProduktívneZ, Produktívne70, Neproduktívne, NeproduktívneZ), sums `KM`, includes `PM`.
- Employee helpers:
  - `PoslednyZaznamSet` updates the last-entered date per employee.

### Derived Functional Requirements (to keep in new stack)
- Preserve per-user table architecture and `AllTData` view in Phase 1; update the view whenever employees are added/renamed.
- Implement CRUD on per-user tables via dynamic table name resolution derived from employee name without diacritics.
- Respect lock rules for edits: block mutations if target record has `Lock = true` or if record date `<= ZamknuteK`.
- Implement overtime ledger semantics exactly (types, composite key, 0h delete behavior, bulk removal constraints, positive-only sums vs total sums).
- Hours must compute like legacy (including overnight spans) in read models and reports.
- Keep `NadcasTyp`/`ZamestnanecTyp` string mappings for storage and display.
- Expose signatures for printing and optionally upload/update.

### Edge Cases & Validations
- Overnight work: `EndTime < StartTime` is valid; hours calculation adds 24h.
- Time entry granularity: UI constrains to 30-minute steps; backend accepts any valid `time` values but reports reflect legacy rounding only if applied client-side.
- Duplicate overtime entry on same composite key yields PK violation; legacy treats as no-op for app-created entries and uses `Update` for edits.
- Batch import with truncate must also clear overtime entries for the user (`DELETE FROM Nadcasy WHERE ZamestnanecID = @id`).
- Diacritics and renames: renaming employees renames the per-user table; regenerate `AllTData` after.

### Parity Checklist Anchors
- Employees: add/update/rename OK, per-user table lifecycle and view regeneration OK.
- Work Records: CRUD with lock and `ZamknuteK` enforcement, overnight-aware hours OK.
- Overtime: sum, set, update/delete, bulk remove (app-created only), types mapped OK.
- Projects: CRUD, active flag used for filtering selections; `ActiveProjects` used in dropdowns.
- Reports: Work Report and Worklist aggregations match legacy groupings and hour buckets.
- Holidays: next-workday and counts exclude weekends and `Holidays`.
- Signatures: fetch/store bytea; included in print outputs.

### Implementation Hints for New Stack
- Prefer SQL for dynamic per-user table access (Prisma/Drizzle raw queries). Use views for read aggregation (`AllTData`).
- Encapsulate diacritics removal and table name computation on server to avoid client inconsistencies.
- Regenerate `AllTData` via a stored procedure/function or server-side SQL when employee set changes.
- Gate mutations with centralized authorization + lock-date checks, returning typed GraphQL errors.


