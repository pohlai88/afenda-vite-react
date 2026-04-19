# @afenda/api

**Node HTTP server** in `apps/api` — PostgreSQL, Drizzle, governed audit writes. This is **not** the Vite browser client; that lives at `apps/web/src/app/_platform/api-client` (import `@/app/_platform/api-client` or the `@/app/_platform` barrel). See [App Platform: HTTP surfaces](../web/src/app/_platform/README.md#http-surfaces-afenda).

Minimal HTTP boundary for **governed audit emission** and future REST surfaces. It uses `@afenda/database` (`insertGovernedAuditLog`) and maps request headers into audit correlation fields.

## Operator contract (doctrine)

These rules avoid **surface drift** between code, docs, and mental models:

- **Route protection is truth** — Anything under `/v1/*` runs **after** session middleware; unauthenticated clients get **401**. Do not document or script “public” flows against `/v1/*` without a session.
- **README describes runnable truth** — Commands here are copy-paste accurate for the current auth boundary.
- **Zod contracts are DTO truth** — API-facing request/response shapes live under `src/modules/auth-companion/contracts/` (and similar). Inferred types come from those schemas; do not add parallel hand-written DTO modules.
- **Demo routes are demo** — `POST /v1/audit/demo` is for exploration, not a substitute for `GET /health` or an unauthenticated smoke check.

**Hono alignment:** The app composes behavior through **modular route registration** (`register*Routes`, mounted on a single `Hono` instance), matching [Hono’s guidance](https://hono.dev/docs/guides/best-practices) to split the app by area without RoR-style controllers—handlers stay colocated with route paths for correct inference and smaller units of change.

### Hono agent skill, CLI, and docs MCP

- **Agent skill** — [yusukebe/hono-skill](https://github.com/yusukebe/hono-skill) is vendored at [`.agents/skills/hono/SKILL.md`](../../.agents/skills/hono/SKILL.md) (includes Afenda-specific **anti-dumping** layout rules). Sync occasionally from upstream if Hono APIs move.
- **Hono CLI** — `@hono/cli` is a devDependency. From repo root: `pnpm --filter @afenda/api exec hono --help` (e.g. `hono request` for local route probes when your entry export matches the CLI; Vitest already uses `app.request()` on `createApp`).
- **hono-docs MCP** — Repo [`.cursor/mcp.json`](../../.cursor/mcp.json) registers `hono-docs` (HTTP) for current Hono documentation in Cursor. Restart Cursor or reload MCP if it does not appear.

## Prerequisites

- PostgreSQL with migrations applied: from repo root, with `DATABASE_URL` set:

  ```bash
  pnpm run db:migrate
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
- `GET /health` — liveness (**unauthenticated**)
- `GET /api/auth/ok` — Better Auth health check (requires Better Auth schema migrated; see below)
- `GET|POST /api/auth/*` — [Better Auth](https://www.better-auth.com/) routes (email/password, OAuth when configured). The SPA calls these via the Vite dev proxy (`/api` → this server) or through `VITE_BETTER_AUTH_BASE_URL` when using a remote auth origin.
- `GET /v1/me` — BFF: **requires session cookie**; returns Better Auth `user`/`session` plus Afenda `afendaUserId`, `tenantIds`, and `defaultTenantId` (from `users` + `tenant_memberships` via email). The Vite app calls this through `/api/v1/me` (proxy rewrites to `/v1/me`).
- `POST /v1/audit/demo` — **Session required.** Writes one governed `auth.login.succeeded` row (**demo / exploratory**, not a public health probe). JSON body optional: `{ "subjectId": string }`. `X-Tenant-Id` must match an active tenant membership for the signed-in user (403 otherwise).

### DB Studio (read-only, session required)

| Method | Path                             | Notes                                                                                                                                 |
| ------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/v1/studio/glossary`            | Business ↔ technical glossary JSON (from [`@afenda/database/studio`](../../packages/_database/src/studio/index.ts) snapshot).         |
| `GET`  | `/v1/studio/glossary/matrix`     | `domain_modules` labels + `entry_counts_by_domain_module` (optional; DB Studio derives the same counts client-side from `/glossary`). |
| `GET`  | `/v1/studio/truth-governance`    | Truth / scope / time governance snapshot (`database-truth-governance.snapshot.json`).                                                 |
| `GET`  | `/v1/studio/enums`               | Allowlisted `pg_enum` values (public schema).                                                                                         |
| `GET`  | `/v1/studio/audit/recent?limit=` | Recent `audit_logs` for tenant; requires `X-Tenant-Id` and membership (403 if not allowed).                                           |

## Better Auth (self-hosted)

Server config lives in `@afenda/better-auth` (`createAfendaAuth`). Required env (see repo-root [`.env.example`](../../.env.example) — Database / Better Auth sections):

- `DATABASE_URL` — same Postgres as `@afenda/database`
- `BETTER_AUTH_SECRET` — strong secret (e.g. `openssl rand -base64 32`)
- `BETTER_AUTH_URL` — **browser-visible** origin for cookies and redirects; for local Vite + proxy use `http://localhost:5173` (not only `http://localhost:3001`)

Apply Better Auth tables with the CLI (from repo root, with `.env` loaded so `DATABASE_URL` and `BETTER_AUTH_SECRET` are set):

```bash
pnpm --filter @afenda/better-auth auth:migrate
```

Config path: `packages/better-auth/src/better-auth-cli-config.ts` (same target DB as `DATABASE_URL`). For a **drift check** before applying anything, run `pnpm dlx auth@latest migrate --help` in that package — the CLI’s supported flags evolve; if a dry-run option exists for your version, use it with the same `--config` as `auth:migrate`. You can also compare live tables (e.g. Neon SQL) to expected Better Auth models. Re-run `auth:migrate` after enabling new Better Auth plugins. Drizzle migrations under `packages/_database` are separate; run both as needed.

## Smoke (canonical)

**Single entrypoint** (repo root):

```bash
pnpm smoke:auth
```

This runs `apps/api/scripts/smoke-auth-e2e.ts` via `pnpm --filter @afenda/api run smoke:auth`. It loads the **in-process** Hono app (`createApp`), exercises Better Auth + auth companion routes (health, intelligence, challenge start/verify), and optionally session-backed routes when `SMOKE_SESSION_COOKIE` is set.

**What it validates**

- Env + DB wiring for `createAfendaAuth` / `createApp`
- Guest and (optionally) cookie-authenticated flows against the real route stack

**What it does not validate**

- A separate long-running HTTP server (it does not replace `pnpm --filter @afenda/api dev` for manual browser testing)
- Unauthenticated `/v1/*` audit demo writes — **all** `/v1/*` routes require a session; there is no supported “curl-only” audit demo smoke without signing in

For full-stack browser verification, run the API + Vite app and use the SPA sign-in path.

## Normative audit docs

- [`packages/_database` README](../../packages/_database/README.md) and [`packages/_database/docs/`](../../packages/_database/docs/)

## File envelope spec

Top-of-file JSDoc conventions for this codebase are defined in the repo-root [`ENVELOPE.md`](../../ENVELOPE.md) (canonical copy — do not duplicate under `src/`).
