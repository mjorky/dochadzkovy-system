#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Detect docker compose command (v2 plugin or v1 binary)
detect_compose() {
  if command -v docker >/dev/null 2>&1; then
    if docker compose version >/dev/null 2>&1; then
      echo "docker compose"
      return 0
    fi
  fi
  if command -v docker-compose >/dev/null 2>&1; then
    echo "docker-compose"
    return 0
  fi
  return 1
}

if ! command -v docker >/dev/null 2>&1; then
  echo "[reset] ERROR: docker CLI not found. Install Docker Desktop or 'brew install docker'." >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "[reset] ERROR: Docker daemon not running. Start Docker Desktop or 'colima start'." >&2
  exit 1
fi

if ! DC_CMD=$(detect_compose); then
  echo "[reset] ERROR: docker compose not found. Install Docker Desktop or 'brew install docker-compose'." >&2
  exit 1
fi

echo "[reset] Using compose command: $DC_CMD"
echo "[reset] Stopping and removing any existing DB container and volume..."
$DC_CMD down -v --remove-orphans || true

echo "[reset] Starting Postgres and importing schema/data (first run only)..."
$DC_CMD up -d --wait || $DC_CMD up -d

echo "[reset] Waiting for database readiness..."
if docker ps --format '{{.Names}}' | grep -q '^dochadzka-postgres$'; then
  docker exec dochadzka-postgres bash -lc 'until pg_isready -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -h 127.0.0.1 ; do sleep 1; done'
fi

echo "[reset] Ready. Connection string: postgres://dochadzka:dochadzka@localhost:5433/dochadzka"
echo "[reset] Example: psql postgres://dochadzka:dochadzka@localhost:5433/dochadzka"

