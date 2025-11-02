## RBAC and Permissions

We mirror legacy roles and derive Manager privileges by project ownership.

### Roles
- Admin: `Zamestnanci.IsAdmin = true`.
- Manager: any employee referenced by `Projects.Manager` for at least one project.
- Employee: default; type determined by `ZamestnanecTyp.Typ` (Zamestnanec, SZČO, Brigádnik, Študent).

### Permissions Matrix (Phase 1)
- Admin:
  - Full CRUD on Employees, Projects, Work Records, Overtime.
  - Can lock attendance (`ZamknuteK` and per-record `Lock`).
  - Can upload signatures.
- Manager:
  - Read all.
  - Edit Work Records of employees on projects they manage (server determines relation via `Projects.Manager`).
  - Approve/update Overtime for team; can create deduction entries with required note.
  - Cannot create/delete employees or change admin flags.
- Employee:
  - Read own data; CRUD on own Work Records unless locked (`Lock` or `date <= ZamknuteK`).
  - View own Overtime summary and entries; cannot approve; can request changes that create pending manual updates (Phase 2).
  - Contractors (SZČO): no automatic overtime; limited overtime features (view-only unless policy says otherwise).

### Lock Enforcement
- Mutations editing a work record must check:
  - Record `Lock = false` AND `recordDate > ZamknuteK`.
  - If not satisfied, respond with `FORBIDDEN_EDIT_LOCKED` or `FORBIDDEN_EDIT_LOCKDATE`.

### Auditing (near-term guidance)
- Log actor, action, target, timestamp for:
  - Lock changes, overtime updates (especially deductions), employee admin flag changes.
- Persist later in dedicated audit tables (Phase 2+).


