### Local PostgreSQL for dochadzkovy-system

This sets up a local PostgreSQL with your checked-in schema and real data dumps.

### Credentials

- **Host**: localhost
- **Port**: 5433
- **Database**: dochadzka
- **User**: dochadzka
- **Password**: dochadzka
- **Connection string**: `postgres://dochadzka:dochadzka@localhost:5433/dochadzka`

You can override credentials by exporting `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` before starting Docker Compose.

### One-time prerequisites

- Install Docker Desktop (macOS)
- Ensure Docker Engine is running

### Start or reset the database (recommended)

From the project root or this folder:

```bash
cd docs/db
# First time or whenever you want a fresh DB reflecting schema + data
chmod +x ./reset_local_db.sh 2>/dev/null || true
./reset_local_db.sh
```

What it does:
- Stops and removes any existing container + volume for this DB
- Starts a new Postgres 17 (port 5433) and imports `schema.sql` then `schema_data.sql` on first init

### Manual start (without reset)

```bash
cd docs/db
docker compose up -d --wait
```

If this is the first-ever start for the `db_data` volume, the schema and data will be imported automatically. To re-import, use the reset script above to drop the volume.

### Login guide

psql (CLI):

```bash
psql postgres://dochadzka:dochadzka@localhost:5433/dochadzka
```

psql (env vars):

```bash
PGHOST=localhost PGPORT=5433 PGDATABASE=dochadzka PGUSER=dochadzka PGPASSWORD=dochadzka \
psql
```

pgAdmin or any SQL client:
- Host: `localhost`
- Port: `5433`
- Database: `dochadzka`
- User: `dochadzka`
- Password: `dochadzka`

### Troubleshooting

- Port already in use: change the mapping in `docker-compose.yml` from `5433:5432` to a free port (or stop your local Postgres if you want to use `5432`).
- Re-import data: run `./reset_local_db.sh` which performs `docker compose down -v` then `up`.
- Verify container: `docker ps | grep dochadzka-postgres`
- Logs: `docker compose logs -f`

### Homebrew (alternative, optional)

If you prefer the host Postgres instead of Docker, create/reset only the target DB (non-destructive to other DBs):

```bash
brew services start postgresql@17 || true
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"

createdb dochadzka 2>/dev/null || true
dropdb --if-exists dochadzka
createdb dochadzka

psql -d dochadzka -f schema.sql
psql -d dochadzka -f schema_data.sql
```

Notes:
- The dump was created by pg_dump v17 and contains `SET transaction_timeout = 0;`, which requires PostgreSQL 17+. Using Docker (Postgres 17) is recommended. If you must use PostgreSQL 16, remove that single line near the top of `schema.sql` before importing.
- The checked-in `schema.sql` uses schema-qualified tables under `public` and does not attempt to create a database, so importing into any pre-created DB is fine.

