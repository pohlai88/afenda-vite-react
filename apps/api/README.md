# @afenda/api

**Node HTTP server** in `apps/api` — PostgreSQL, Drizzle, governed audit writes. This is **not** the Vite browser client; that lives at `apps/web/src/app/_platform/api-client` (import `@/app/_platform/api-client` or the `@/app/_platform` barrel). See [App Platform: HTTP surfaces](../web/src/app/_platform/README.md#http-surfaces-afenda).

Minimal HTTP boundary for **governed audit emission** and future REST surfaces. It uses `@afenda/database` (`insertGovernedAuditLog`) and maps request headers into audit correlation fields.

## Prerequisites

- PostgreSQL with migrations applied: from repo root, with `DATABASE_URL` set:

  ```bash
  pnpm --filter @afenda/database db:migrate
  ```

## Run locally

```bash
# Terminal 1 — API (requires DATABASE_URL)
set DATABASE_URL=postgres://...
pnpm --filter @afenda/api dev
```

Default port **3001** (override with `PORT`).

## Headers → audit row

| Header             | Audit field                                |
| ------------------ | ------------------------------------------ |
| `X-Tenant-Id`      | `tenantId` (required for `/v1/audit/demo`) |
| `X-Request-Id`     | `requestId`                                |
| `X-Trace-Id`       | `traceId` (or W3C `traceparent` trace id)  |
| `X-Correlation-Id` | `correlationId`                            |

## Endpoints

- `GET /health` — liveness
- `GET /api/auth/ok` — Better Auth health check (requires Better Auth schema migrated; see below)
- `GET|POST /api/auth/*` — [Better Auth](https://www.better-auth.com/) routes (email/password, OAuth when configured). The SPA calls these via the Vite dev proxy (`/api` → this server) or through `VITE_BETTER_AUTH_BASE_URL` when using a remote auth origin.
- `POST /v1/audit/demo` — writes one governed `auth.login.succeeded` row (demo). JSON body optional: `{ "subjectId": string }`.

## Better Auth (self-hosted)

Server config lives in `@afenda/better-auth` (`createAfendaAuth`). Required env (see repo-root `.env.database.example` and `.env.neon.example`):

- `DATABASE_URL` — same Postgres as `@afenda/database`
- `BETTER_AUTH_SECRET` — strong secret (e.g. `openssl rand -base64 32`)
- `BETTER_AUTH_URL` — **browser-visible** origin for cookies and redirects; for local Vite + proxy use `http://localhost:5173` (not only `http://localhost:3001`)

Apply Better Auth tables with the CLI (from repo root, with `.env.neon` or env loaded so `DATABASE_URL` and `BETTER_AUTH_SECRET` are set):

```bash
pnpm --filter @afenda/better-auth auth:migrate
```

Re-run after enabling new Better Auth plugins. Drizzle migrations under `packages/_database` are separate; run both as needed.

## Local smoke (full stack)

With the API running and `DATABASE_URL` valid:

```bash
pnpm exec tsx scripts/audit-api-smoke.ts
```

Optional: `AUDIT_API_URL=http://localhost:3001`

## Normative audit docs

- [docs/AUDIT_ARCHITECTURE.md](../../docs/AUDIT_ARCHITECTURE.md)
