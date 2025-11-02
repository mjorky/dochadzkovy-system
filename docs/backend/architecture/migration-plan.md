## Data Ingestion, Seeding, and Migration Plan

### Current Strategy (Phase 1)
- Keep the legacy schema unchanged, including per-user tables and views.
- Use `docs/schema.sql` + `docs/schema_data.sql` as authoritative seed for local dev.
- Provide scripts to:
  - Restore schema (roles, tables, views, constraints).
  - Load seed data (catalogs, demo employees/projects, sample per-user tables).
  - Recreate `AllTData` view after seed import.

### Local Dev Setup
- Provide `.env` and `docker-compose` for Postgres.
- Seed command (example):
  - `psql -h localhost -U postgres -f docs/schema.sql`
  - `psql -h localhost -U postgres -f docs/schema_data.sql`
- After adding/removing employees in seed, run view regeneration.

### Optional Normalization (Phase 2)
- Introduce `WorkRecords` normalized table with an `employee_id` FK, keeping per-user tables as import sources.
- Provide ingestion utility:
  - For each per-user table:
    - Copy rows into `WorkRecords` with same fields and computed hours.
    - Preserve `Lock` and date for lock enforcement.
  - Keep a mapping table for original `t_{...}` → `employee_id`.
- Dual-write strategy during transition (optional): write to both normalized and per-user tables.

### Risk & Rollback
- Per-user dynamic model is not ORM-friendly; use raw SQL for those ops.
- Ensure all DDL for view regeneration is idempotent (CREATE OR REPLACE VIEW).


