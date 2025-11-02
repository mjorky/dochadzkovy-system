## Resolver and Service Mapping (Legacy → NestJS/Prisma or Drizzle)

This document describes how each operation in the legacy app maps to GraphQL resolvers and SQL in the new backend. We will preserve the per-user table model and `AllTData` view in Phase 1.

### Table Name Resolution
- Compute per-user table name server-side from `Zamestnanci.Meno/Priezvisko` with diacritics removed: `t_{MenoNoDia}_{PriezviskoNoDia}`.
- Expose a helper in the service layer; do not trust client-provided table names.

### Employees
- Query: `employees`, `employee(id)` → SELECT from `ZamestnanciFullName` or `Zamestnanci` joined with `ZamestnanecTyp` to get `FondPracovnehoCasu`.
- Mutation: `createEmployee(input)` →
  1) INSERT into `Zamestnanci` (nullable titles as NULL, `RocnyNadcasVPlate` NULL for 0),
  2) CREATE TABLE `t_{...}` with FKs (same as legacy DDL),
  3) Recreate `AllTData` view.
- Mutation: `updateEmployee(id, input)` →
  1) UPDATE `Zamestnanci`,
  2) if name changed, `ALTER TABLE t_old RENAME TO t_new`,
  3) Recreate `AllTData` view.
- Mutation: `deleteEmployee(id)` → DELETE from `Zamestnanci` (legacy does not cascade drop per-user table; we follow legacy unless decided otherwise).
- Fields:
  - `fullName`: server-computed exactly like `ZamestnanciFullName` view.
  - `tableName`: computed, not exposed publicly (internal use only).
  - `signature`: bytea fetch via separate field resolver.

### Projects
- Queries: list/filter projects; `ActiveProjects` view used for selection UIs.
- Mutations: insert/update mirror legacy SQL; `Number` remains unique.

### Work Records (per-user tables)
- Queries:
  - `workRecords(employeeId, filter)`:
    - Resolve employee, compute table name.
    - SELECT with date range filter and optional project/hour-type filters.
    - Hours are not stored; compute derived `hours` field in resolver as:
      - if `EndTime >= StartTime`: `(EndTime - StartTime)`
      - else: `(EndTime - StartTime) + 24h`.
  - For cross-employee reporting, query `AllTData` with filters.
- Mutations:
  - `createWorkRecord(employeeId, input)` → INSERT into `t_{...}`. After insert:
    - Update `Zamestnanci.PoslednyZaznam` to the entry date.
    - Optionally trigger overtime reconciliation (see background jobs doc).
  - `updateWorkRecord(employeeId, id, input)` → UPDATE `t_{...}`.
  - `deleteWorkRecord(employeeId, id)` → DELETE `t_{...}`.
- Guards for all mutations:
  - Reject when target record has `Lock = true`.
  - Reject when `recordDate <= ZamknuteK` for the employee.

### Overtime (Nadcasy)
- Queries:
  - `overtimeSum(employeeId, from, to, type, mode)`:
    - `mode = POSITIVE_ONLY` or `TOTAL` (mirrors legacy `celkovyNadcas` flag).
    - For `TOTAL`: sum signed intervals; for `POSITIVE_ONLY`: include only positive values.
  - `overtimeEntries(employeeId, from, to, type?, deduction?)`: list raw entries.
- Mutations:
  - `setOvertime(employeeId, date, hours, type, approvedBy?, note?, deduction?)` → INSERT; 0h returns error (legacy returns false).
  - `updateOvertime(employeeId, date, type, hours, approvedBy?, note?, deduction?)` → UPDATE or DELETE when `hours = 0`.
  - `removeOvertimeBulk(employeeId, dates)` → DELETE where `Schvalil = 1 AND Odpocet = false`.

### Locks
- `lockAttendance(employeeId, untilDate)`:
  - `UPDATE t_{...} SET "Lock" = true WHERE "StartDate" <= untilDate`.
  - `UPDATE Zamestnanci SET ZamknuteK = untilDate`.

### Signatures
- `employeeSignature(id)` → `SELECT Podpis FROM Zamestnanci` and return as a base64 string or dedicated type.
- `setEmployeeSignature(id, file)` → `UPDATE Zamestnanci SET Podpis = $1` with uploaded bytes; limit size and validate image.

### Implementation Notes
- Prisma/Drizzle: use `queryRaw`/`executeRaw` for per-user tables and view regeneration. Model standard tables as schema where possible.
- View regeneration: encapsulate legacy `GenerateCreateViewAllTData()` SQL. Consider a small SQL function or a service method that composes the UNION ALL from current employees.
- Diacritics: implement the exact mapping in TS to match C# `RemoveDiacritics` behavior to avoid table name mismatches.
- Errors: map DB constraints to GraphQL errors with codes (`FORBIDDEN_EDIT_LOCKED`, `FORBIDDEN_EDIT_LOCKDATE`, `OVERTIME_ZERO_NOT_ALLOWED`, `UNIQUE_CONFLICT`, etc.).


