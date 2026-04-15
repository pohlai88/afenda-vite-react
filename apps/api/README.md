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

- `GET /` — small JSON map of main routes (so opening `http://localhost:3001/` in a browser is not a 404)
- `GET /health` — liveness
- `GET /api/auth/ok` — Better Auth health check (requires Better Auth schema migrated; see below)
- `GET|POST /api/auth/*` — [Better Auth](https://www.better-auth.com/) routes (email/password, OAuth when configured). The SPA calls these via the Vite dev proxy (`/api` → this server) or through `VITE_BETTER_AUTH_BASE_URL` when using a remote auth origin.
- `POST /api/dev/login` — **development only** (`NODE_ENV !== production`): registered whenever the API is not in production mode. If dev-login env is incomplete, responds **`503`** with JSON explaining required vars; when configured (`AFENDA_DEV_LOGIN_ENABLED=true`, email, password), uses Better Auth `signInEmail` server-side; optional `AFENDA_DEV_LOGIN_SECRET` requires header `X-Afenda-Dev-Login-Secret`. See `docs/DEV_LOGIN.md` and repo-root `.env.database.example`.
- `GET /v1/me` — BFF: requires session cookie; returns Better Auth `user`/`session` plus Afenda `afendaUserId`, `tenantIds`, and `defaultTenantId` (from `users` + `tenant_memberships` via email). The Vite app calls this through `/api/v1/me` (proxy rewrites to `/v1/me`).
- `POST /v1/audit/demo` — writes one governed `auth.login.succeeded` row (demo). JSON body optional: `{ "subjectId": string }`. `X-Tenant-Id` must match an active tenant membership for the signed-in user (403 otherwise).

## Better Auth (self-hosted)

Server config lives in `@afenda/better-auth` (`createAfendaAuth`). Required env (see repo-root `.env.database.example` and `.env.neon.example`):

- `DATABASE_URL` — same Postgres as `@afenda/database`
- `BETTER_AUTH_SECRET` — strong secret (e.g. `openssl rand -base64 32`)
- `BETTER_AUTH_URL` — **browser-visible** origin for cookies and redirects; for local Vite + proxy use `http://localhost:5173` (not only `http://localhost:3001`)

Apply Better Auth tables with the CLI (from repo root, with `.env.neon` or env loaded so `DATABASE_URL` and `BETTER_AUTH_SECRET` are set):

```bash
pnpm --filter @afenda/better-auth auth:migrate
```

Config path: `packages/better-auth/src/better-auth-cli-config.ts` (same target DB as `DATABASE_URL`). For a **drift check** before applying anything, run `pnpm dlx auth@latest migrate --help` in that package — the CLI’s supported flags evolve; if a dry-run option exists for your version, use it with the same `--config` as `auth:migrate`. You can also compare live tables (e.g. Neon SQL) to expected Better Auth models. Re-run `auth:migrate` after enabling new Better Auth plugins. Drizzle migrations under `packages/_database` are separate; run both as needed.

## Local smoke (full stack)

With the API running and `DATABASE_URL` valid:

```bash
pnpm exec tsx scripts/audit-api-smoke.ts
```

Optional: `AUDIT_API_URL=http://localhost:3001`

## Normative audit docs

- [docs/AUDIT_ARCHITECTURE.md](../../docs/AUDIT_ARCHITECTURE.md)
