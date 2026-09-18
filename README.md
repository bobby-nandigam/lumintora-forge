# Lumintora Forge

**Refresh anything. Master what's missing. Prove you still know it.**

An AI-powered adaptive learning platform. Its flagship feature, **Forge**, finds
what you've forgotten and rebuilds it with targeted, adaptive practice — instead
of making you relearn a whole course.

> Built for the Nerdy AI Hackathon Challenge. A project by Bobby Nandigam.

- **Live app:** https://lumintora.in (frontend on Cloudflare Pages)
- **API:** https://lumintora-api.onrender.com (Go, on Render)

## What's inside

| Folder | Stack | What it is |
|---|---|---|
| `lumintora-backend` | Go (chi) + Postgres | API monolith: auth, learning paths, **Forge**, AI interview, code judge, AI debug, email |
| `lumintora-frontend` | React + Vite | SPA: dashboard, Forge (refresh/master/interview), coding playground |
| `lumintora-database` | Postgres + SQL | Schema migrations (schema-per-tenant) |
| `lumintora-infra` | Docker Compose + nginx | Deployment/orchestration |

## Key features

- **Forge — adaptive refresh:** a short diagnostic maps what you know vs. forgot
  (skill graph + mastery/decay), then rebuilds the gaps with AI-generated,
  behaviour-driven activities. Works for any topic.
- **AI Interview:** a live interviewer asks contextual follow-ups, optionally
  reads face/voice as a *delivery signal*, and emails a dimensional debrief.
- **AI Debug in coding:** reviews your code for real bugs, edge cases and perf,
  and proposes a fix you can apply.
- **Architecture:** deterministic Go owns mastery/decay/grading/plan; the LLM
  (Cloudflare Workers AI) only generates & evaluates, with every output
  schema-validated — the model can't fabricate a score.

## Run locally (Docker)

```bash
cp .env.forge.example .env   # optional: add Google/SMTP creds
docker compose -f docker-compose.forge.yml up --build -d
# App → http://localhost:3000   API → http://localhost:8080
```

Or run pieces directly — see each folder's files. The backend applies all SQL
migrations automatically on startup.

## Deployment

- **Backend → Render** (`lumintora-backend/render.yaml`), Docker, free plan,
  health check at `/health`. `DATABASE_URL` (Neon) and `JWT_SECRET` are set in
  the Render dashboard.
- **Frontend → Cloudflare Pages** (`wrangler pages deploy dist`).
- **Database → Neon** (serverless Postgres); migrations run on backend boot.
- **Keep-awake:** `.github/workflows/keepalive.yml` pings `/health` every 5 min
  so the free backend doesn't cold-start.
