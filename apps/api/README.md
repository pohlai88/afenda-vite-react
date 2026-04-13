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
- `POST /v1/audit/demo` — writes one governed `auth.login.succeeded` row (demo). JSON body optional: `{ "subjectId": string }`.

## Local smoke (full stack)

With the API running and `DATABASE_URL` valid:

```bash
pnpm exec tsx scripts/audit-api-smoke.ts
```

Optional: `AUDIT_API_URL=http://localhost:3001`

## Normative audit docs

- [docs/AUDIT_ARCHITECTURE.md](../../docs/AUDIT_ARCHITECTURE.md)
