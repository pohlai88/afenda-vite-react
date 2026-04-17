# Afenda database package

`packages/_database` is the canonical persistence boundary for Afenda server-side code. It owns PostgreSQL schema, Drizzle configuration, migration generation, and server-only permission helpers.

## Naming doctrine

This package deliberately separates repository path from public import name:

- Filesystem path: `packages/_database`
- Public package name: `@afenda/database`

The underscore-prefixed folder is intentional. It keeps the persistence package visually prominent in package listings and prevents drift toward sibling variants such as `packages/database`, `packages/db`, or `packages/postgres`.

The public import stays clean for consumers:

```ts
import { db } from "@afenda/database"
```

Do not import `@afenda/_database`, do not deep-import from `packages/_database/src/*`, and do not create a sibling database package without explicit architecture approval.

**Package docs** (database architecture doctrine, business ↔ technical YAML glossary, Drizzle seed notes): [`docs/README.md`](docs/README.md).

**DB Studio snapshots:** after editing [`docs/data/business-technical-glossary.yaml`](docs/data/business-technical-glossary.yaml) or [`docs/data/database-truth-governance.yaml`](docs/data/database-truth-governance.yaml), run `pnpm --filter @afenda/database studio:sync` to refresh validated JSON under `src/studio/` (Zod + metadata). Runtime API/UI import [`@afenda/database/studio`](src/studio/index.ts).

## Domain-first structure

The package is domain-first, not function-first:

| Domain          | Owns                                                                                                                                                                                                                                                |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tenancy`       | Tenants, tenant memberships, tenant-scope repository and policy helpers                                                                                                                                                                             |
| `identity`      | Users and provider-neutral identity links                                                                                                                                                                                                           |
| `authorization` | Permissions, roles, role assignment, membership access scopes, permission evaluation, and authorization seeds                                                                                                                                       |
| `organization`  | Legal entities, org units, and structural hierarchy                                                                                                                                                                                                 |
| `audit`         | `audit_logs`, catalogs, `read-model/` (admin view + investigation summary), retention policy + disposition + retention query, query/investigation services, serialization utils (`docs/AUDIT_ARCHITECTURE.md`; local notes under `src/audit/docs/`) |

Import: `import { ... } from "@afenda/database"` or `@afenda/database/audit`.

Package-wide `_shared`, `shared`, `common`, and `utils` folders are forbidden. Cross-domain DRY belongs only in `constants` and `helpers`, and those folders must remain infrastructure-only: no tenant, role, permission, org, or audit business semantics.

## First-wave enterprise schema (spec alignment)

The additive “first wave” from schema review (identity bridge, operating dimensions, unified scopes) is implemented **here**, not under a separate `packages/db` tree. Map external sketches to this layout:

| Sketch / mental model (`packages/db/…`)                               | This repo (`packages/_database/src/…`)                                         |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `core/users.ts`                                                       | `identity/schema/users.schema.ts`                                                     |
| `tenancy/tenants.ts`                                                  | `tenancy/schema/tenants.schema.ts`                                                    |
| `security/*` (memberships, roles, scopes)                             | `authorization/schema/*.schema.ts` and `tenancy/schema/tenant-memberships.schema.ts`            |
| `identity/identity-links.ts`                                          | `identity/schema/identity-links.schema.ts`                                            |
| `organization/{business-units,locations,legal-entities,org-units}.ts` | `organization/schema/*.schema.ts`                                                     |
| `audit/audit-logs.ts`                                                 | `audit/schema/audit-logs.schema.ts`                                                   |
| Per-file `*.relations.ts`                                             | Centralized under `*/relations/*-relations.ts` (see `src/schema/relations.schema.ts`) |

**Naming deltas (intentional):** `identity_links.better_auth_user_id` is the Better Auth subject id (your sketch may say `auth_user_id`). `audit_logs.session_id` is the auth/app session identifier (your sketch may say `auth_session_id`). `membership_scopes` uses a **composite FK** `(membership_id, tenant_id)` for tenant-safe joins.

**Migrations:** SQL lives in `packages/_database/drizzle/` (e.g. `0008_enterprise_identity_and_dimensions.sql`, `0009_drop_workspace_demo_items.sql`), not renumbered `0001_*`—history is preserved.

## PostgreSQL surface (avoid confusion)

Drizzle here models **Afenda domain** tables (`users`, `tenants`, `identity_links`, …). The same Postgres database may also contain **Better Auth** tables (`public.user`, `public.session`, …) and, on Neon, a **`neon_auth`** schema. **Authoritative ERP tenancy and identity bridging** are documented in [`docs/DATABASE.md`](../docs/DATABASE.md) §5.2 and ADRs **0003–0006** under [`docs/decisions/`](../docs/decisions/README.md). Do not implement features against `neon_auth` workspace tables without a new ADR.

## Protected API handlers (tenant context + audit)

Server routes that mutate tenant data should resolve **one** Afenda context per request, then use it for filters, authorization, and audit.

```ts
import { db, resolveActiveTenantContext } from "@afenda/database"

const context = await resolveActiveTenantContext({
  db,
  authUserId: session.user.id,
  authProvider: "better-auth",
  authSessionId: session.session.id,
  activeTenantId: session.session.activeTenantId,
  activeLegalEntityId: session.session.activeLegalEntityId,
  activeBusinessUnitId: session.session.activeBusinessUnitId,
  activeLocationId: session.session.activeLocationId,
  activeOrgUnitId: session.session.activeOrgUnitId,
})
```

Use **`context.tenantId`** for tenant-scoped queries / RLS parameters, **`context.membershipId`** for authorization checks and audit membership binding, and **`context.afendaUserId`** as the Afenda actor (not the Better Auth user id).

`resolveActiveTenantContext` runs membership scope checks, then **`assertContextAlignment`** so optional legal entity, business unit, location, and org unit ids (when present) agree with each row’s bindings; null FKs on a row do not force rejection.

Session fields such as **`activeTenantId`** and operating dimensions must be populated server-side (e.g. Better Auth `session` additional fields) per [`docs/decisions/ADR-0006-session-operating-context.md`](../docs/decisions/ADR-0006-session-operating-context.md).

**Audit row assembly** (map to `audit_logs` columns; `session_id` holds the auth session in DB):

```ts
const auditPayload = {
  tenantId: context.tenantId,
  actorUserId: context.afendaUserId,
  membershipId: context.membershipId,
  legalEntityId: context.activeLegalEntityId,
  businessUnitId: context.activeBusinessUnitId,
  locationId: context.activeLocationId,
  orgUnitId: context.activeOrgUnitId,
  authUserId: context.authUserId,
  sessionId: context.authSessionId,
}
```

Prefer governed writers (`insertGovernedAuditLog` / catalog merge) where the audit package exposes them so actions and payloads stay doctrine-aligned.

## Web relationship

`apps/web` must never import this package. Browser features may keep `db-schema` notes as upstream persistence intent, but executable Drizzle schema and migrations live here and are consumed by future server/API code through `@afenda/database`.

## Scripts

- `pnpm --filter @afenda/database typecheck`
- `pnpm --filter @afenda/database lint`
- `pnpm --filter @afenda/database test:run`
- **`db:guard`** — `typecheck`, `guard-schema-modules.ts` (`*.schema.ts` under each `schema/` folder), and contract + governance Vitest files. Runs automatically before **`db:generate`**.
- **`db:guard:ci`** — same as `db:guard` without `typecheck` (for CI when Turbo already typechecked).
- **`db:check-migrations`** — `drizzle-kit check` when `drizzle/meta/_journal.json` exists; otherwise skips.
- **`db:verify-migrations-sync`** — runs `drizzle-kit generate` then fails if `git diff` shows uncommitted changes under `drizzle/`; skips when no journal yet.
- **`db:ci`** — `db:guard:ci` + `db:check-migrations` + `db:verify-migrations-sync` (used in GitHub Actions).
- `pnpm --filter @afenda/database db:generate`
- `pnpm --filter @afenda/database db:migrate`
- `pnpm --filter @afenda/database db:seed` — governed seed runtime ([`docs/DATABASE.md`](../docs/DATABASE.md) §4.1). Run **`db:migrate` before `db:seed`**. From repo root: `pnpm db:seed`.
- `pnpm --filter @afenda/database db:reset:local` — **destructive** truncate of Afenda Drizzle tables via `drizzle-seed` `reset()`; requires `SEED_RESET_LOCAL=true` and `SEED_ENV=local` only. Does not touch Better Auth tables outside this schema bundle. Follow with `db:migrate` and `db:seed` if you need a clean fixture set.

**Neon / serverless Postgres:** use the branch `DATABASE_URL` from the Neon console or CI (preview branches). Prefer the **pooler** endpoint (`-pooler` in the hostname) for short-lived or bursty clients; expect possible **cold start** latency on first query after compute suspend. The seed CLI probes the connection with `SELECT 1` before running modules so unreachable databases fail fast.

**drizzle-seed + Faker:** see [`docs/DRIZZLE_SEED_AND_FAKER.md`](docs/DRIZZLE_SEED_AND_FAKER.md) for options, `refine`, `reset`, and generator reference links.

Use `db:push` only for local disposable development databases. Production uses reviewed migrations.
