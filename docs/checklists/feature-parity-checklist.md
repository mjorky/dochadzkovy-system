## Feature Parity Checklist

Use this to track parity with the legacy app.

### Employees
- [ ] List/read employees with `FondPracovnehoCasu` and `FullName` composition
- [ ] Create employee (creates per-user table, regenerates `AllTData`)
- [ ] Update employee (rename per-user table if name changed, regenerate view)
- [ ] Delete employee
- [ ] Upload/get signature (bytea)

### Projects
- [ ] CRUD projects; `Number` unique; `AllowAssignWorkingHours` (Active)
- [ ] `ActiveProjects` view for dropdowns

### Work Records
- [ ] List by employee with filters; default last 31 days; whole-month expansion
- [ ] Create/update/delete with 30-minute steps, end ≥ start, overnight support
- [ ] Copy to multiple days with working-day suggestion (skip weekends/holidays)
- [ ] Enforce `Lock` and `ZamknuteK` on mutations
- [ ] CSV export of filtered table

### Overtime
- [ ] Sum by type and range (positive-only vs total)
- [ ] Insert/update/delete entries with `Schvalil`, `Poznamka`, `Odpocet`
- [ ] Bulk remove app-created entries (Schvalil=1, Odpocet=false)
- [ ] Auto-recalc job creates/removes Flexi entries based on surplus hours

### Reports
- [ ] Work Report: header info, table fields, PDF export
- [ ] Work List: per-project buckets (Produktívne, Neproduktívne, ProduktívneZ, NeproduktívneZ, Produktívne70), KM, PM, signature; PDF export

### Admin/Locks
- [ ] Set `ZamknuteK` and lock per-user records up to date
- [ ] Enforced read-only for locked dates/items

### Holidays
- [ ] Seed/maintain `Holidays`; next-workday logic skips weekends/holidays


