## Background Jobs and Domain Processes

This document captures server-side processes that run on events or schedules.

### Overtime Recalculation
Objective: Maintain `Nadcasy` ledger aligned with daily totals vs `FondPracovnehoCasu`.

- Trigger: on WorkRecord create/update/delete; optionally nightly reconciliation.
- Scope: per employee per day.
- Inputs: sum of hours from per-user table on date D; employee type → `FondPracovnehoCasu`.
- Behavior:
  - If totalHours(D) > threshold → ensure a positive `Nadcasy` entry of type `Flexi` for date D equals the surplus; `Schvalil=NULL`, `Poznamka='Calculated automatically'` (localized), `Odpocet=false`.
  - If totalHours(D) ≤ threshold → remove app-created flexi entry for D (where `Schvalil = 1` matching legacy bulk removal semantics) or set to 0 (delete via update path).
  - Manual edits (non-null `Schvalil` or with `Odpocet=true`) must not be overwritten.
- Bulk tools:
  - Admin job: re-scan a period for an employee/team and re-apply the above rules.
  - Support legacy-like `NadcasRemoveBulk` for app-created entries.

### Lock Attendance
- Action: Admin/Manager sets lock date `ZamknuteK`.
- Effects:
  - `UPDATE t_{...} SET "Lock" = true WHERE "StartDate" <= date`.
  - `UPDATE Zamestnanci SET ZamknuteK = date`.
- Guard: Mutations must reject edits for dates `<= ZamknuteK` or records with `Lock=true`.

### Reports Generation
- Work Report / Work List PDF
  - Strategy: server-side generation (more consistent) or client-side (faster iteration). Either way, keep aggregation identical to legacy (`AllTData` and per-user tables).
  - Include signatures if available; constrain max image size.

### Holidays Maintenance
- Yearly seed/update for `Holidays` table; optional auto-import from authoritative sources.


