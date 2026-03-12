# Acquisitions API Docker Setup (Neon Local + Neon Cloud)

This project is dockerized with separate development and production flows:

- Development: app container + Neon Local proxy container
- Production: app container only, connected to Neon Cloud via `DATABASE_URL`

## Files Added

- `Dockerfile`
- `docker-compose.dev.yml`
- `docker-compose.prod.yml`
- `.env.development`
- `.env.production`

## 1) Development (Local) with Neon Local

### Prerequisites

- Docker + Docker Compose
- Neon account values:
  - `NEON_API_KEY`
  - `NEON_PROJECT_ID`
  - optional `PARENT_BRANCH_ID`

### Environment

Edit `.env.development`:

- `DATABASE_URL=postgres://neon:npg@neon-local:5432/neondb?sslmode=no-verify`
- `NEON_LOCAL_FETCH_ENDPOINT=http://neon-local:5432/sql`
- set `NEON_API_KEY` and `NEON_PROJECT_ID`

`DATABASE_URL` points to the `neon-local` service on the compose network.

### Start

```bash
docker compose -f docker-compose.dev.yml --env-file .env.development up --build
```

The API is available at `http://localhost:3000`.

Neon Local runs in the `neon-local` container and can create ephemeral branches for dev/testing when configured with your Neon credentials.

### Stop

```bash
docker compose -f docker-compose.dev.yml down
```

## 2) Production with Neon Cloud

In production, do not run Neon Local. Use Neon Cloud connection string in `.env.production`.

Edit `.env.production`:

- `DATABASE_URL=postgres://...neon.tech...`
- `NODE_ENV=production`
- `ARCJET_API_KEY` (if used)

### Start

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d
```

The app container reads secrets from environment variables only.

### Stop

```bash
docker compose -f docker-compose.prod.yml down
```

## 3) How Env Switching Works

- Dev compose file loads `.env.development` and connects to Neon Local.
- Prod compose file loads `.env.production` and connects directly to Neon Cloud.

No database URL is hardcoded in application code; runtime uses `process.env.DATABASE_URL`.

## 4) Notes

- `src/config/database.js` supports Neon Local by honoring:
  - `NEON_LOCAL_FETCH_ENDPOINT`
- `src/server.js` binds to `0.0.0.0` by default for container networking.
testing ci/cd pipelines
