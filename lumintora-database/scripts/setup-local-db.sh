#!/usr/bin/env bash
# Provision a SEPARATE local Postgres database + role for running the backend
# outside of docker-compose. Connects to a locally-running Postgres as a
# superuser (defaults to your OS user) and creates the project role/database.
#
# Usage:
#   ./scripts/setup-local-db.sh
#
# Override the admin connection / target names via env vars if needed:
#   ADMIN_DB   admin database to connect to for setup   (default: postgres)
#   DB_USER    project role to create                   (default: lumintora)
#   DB_PASSWORD project role password                   (default: lumintora_secret)
#   DB_NAME    project database to create               (default: lumintora)
set -euo pipefail

ADMIN_DB="${ADMIN_DB:-postgres}"
DB_USER="${DB_USER:-lumintora}"
DB_PASSWORD="${DB_PASSWORD:-lumintora_secret}"
DB_NAME="${DB_NAME:-lumintora}"

echo "→ Using admin database '$ADMIN_DB' to create role '$DB_USER' and database '$DB_NAME'"

# Create the login role if it does not already exist.
psql -d "$ADMIN_DB" -v ON_ERROR_STOP=1 <<SQL
DO \$\$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='$DB_USER') THEN
    CREATE ROLE $DB_USER LOGIN PASSWORD '$DB_PASSWORD';
  END IF;
END \$\$;
SQL

# Create the database if it does not already exist (CREATE DATABASE can't run
# inside a DO block / transaction).
if psql -d "$ADMIN_DB" -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
  echo "→ Database '$DB_NAME' already exists, leaving it as-is"
else
  psql -d "$ADMIN_DB" -v ON_ERROR_STOP=1 -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
  echo "→ Created database '$DB_NAME'"
fi

echo "✅ Local database ready. Start the API with:  make run"
echo "   (schema is applied automatically by the server's migration runner on startup)"
