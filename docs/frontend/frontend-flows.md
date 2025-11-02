## Frontend Flows (Next.js + GraphQL)

High-level flows and validations aligned to legacy behavior and PRD.

### Pages
- Employee (Zamestnanec): balances overview
  - Shows `Dovolenka` (float).
  - Shows YTD computed hours for selected absence categories (Doctor, etc.) using server aggregates (Phase 2).
  - Read employee identity, type, admin flag.

- Data (Main table of work records)
  - Default filter: last 31 days. Toggle “show whole month” → expand to the month of start date.
  - Table columns: absence (CinnostTyp), date, project, productivity (HourType), type of work (HourTypes), start, end, hours (derived), description, km, long-term trip.
  - Editing constraints: disallow edit if `Lock = true` OR `date <= ZamknuteK`.
  - Entry UX:
    - 30-minute time steps, end ≥ start; overnight spans allowed.
    - Next-day suggestion skips weekends and `Holidays`.
    - Copy records across days (multi-insert).
  - Export CSV of current filter (client-side or server-side CSV endpoint).

- Overtime (Nadčasy)
  - Display daily ledger sums per type from start of year to now.
  - Manager/Admin can add/update: positive entries (surplus) and deduction entries with required note and approver.
  - Bulk remove app-created entries (Schvalil=1, Odpocet=false).

- Work Report (Official)
  - Header: month range, count of workdays, hours in range.
  - Table: name, weekday, date, time from/to, hours, reason of absence.
  - PDF export (client render → PDF or server render).

- Work List (Project stats)
  - Table by project Number: Produktívne, Neproduktívne, ProduktívneZ, NeproduktívneZ, Produktívne70, KM, PM, Podpis.
  - PDF export.

- Admin – Employees
  - Editable: `Meno`, `Priezvisko`, `TitulPred`, `TitulZa`, `IsAdmin`, `TypZamestnanca`.
  - Derived: Total overtime, Posledný záznam, Zamknuté k.
  - Actions: Save, Lock attendance to date (sets `ZamknuteK` and per-record `Lock`), Export JSON, Upload signature.

- Admin – Projects
  - CRUD, Active checkbox maps to `AllowAssignWorkingHours`.
  - Filtering/sorting; export JSON.

### Forms & Validation
- React Hook Form + Zod schemas mirror DB constraints; time fields step = 30m; start/end validation; date range filters.
- Error surfaces for lock violations and PK/unique conflicts.

### State & Data
- Zustand for local UI state (filters, selections). Apollo/urql for GraphQL cache.
- Infinite scroll for work records via offset pagination.


