#!/usr/bin/env bash
set -euo pipefail

# First-run setup: copy env template if .env doesn't exist
if [ ! -f .env ]; then
  cp .env.example .env
  echo "⚠️  Created .env from .env.example — edit it before production use."
fi

docker compose up --build -d
echo ""
echo "✅ Lumintora is running!"
echo "   App → http://localhost:${APP_PORT:-3000}"
echo ""
echo "Services:"
echo "   gateway       → http://localhost:${APP_PORT:-3000}"
echo "   auth-service  → internal port 8081"
echo "   core-api      → internal port 8082"
echo "   ai-service    → internal port 8083"
echo ""
echo "To stop: docker compose down"
echo "To wipe DB: docker compose down -v"
