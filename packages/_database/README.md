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
| `core/users.ts`                                                       | `identity/schema/users.ts`                                                     |
| `tenancy/tenants.ts`                                                  | `tenancy/schema/tenants.ts`                                                    |
| `security/*` (memberships, roles, scopes)                             | `authorization/schema/*` and `tenancy/schema/tenant-memberships.ts`            |
| `identity/identity-links.ts`                                          | `identity/schema/identity-links.ts`                                            |
| `organization/{business-units,locations,legal-entities,org-units}.ts` | `organization/schema/*.ts`                                                     |
| `audit/audit-logs.ts`                                                 | `audit/schema/audit-logs.ts`                                                   |
| Per-file `*.relations.ts`                                             | Centralized under `*/relations/*-relations.ts` (see `src/schema/relations.ts`) |

**Naming deltas (intentional):** `identity_links.better_auth_user_id` is the Better Auth subject id (your sketch may say `auth_user_id`). `audit_logs.session_id` is the auth/app session identifier (your sketch may say `auth_session_id`). `membership_scopes` uses a **composite FK** `(membership_id, tenant_id)` for tenant-safe joins.

**Migrations:** SQL lives in `packages/_database/drizzle/` (e.g. `0008_enterprise_identity_and_dimensions.sql`, `0009_drop_workspace_demo_items.sql`), not renumbered `0001_*`—history is preserved.

## PostgreSQL surface (avoid confusion)

Drizzle here models **Afenda domain** tables (`users`, `tenants`, `identity_links`, …). The same Postgres database may also contain **Better Auth** tables (`public.user`, `public.session`, …) and, on Neon, a **`neon_auth`** schema. **Authoritative ERP tenancy and identity bridging** are documented in [`docs/DATABASE.md`](../docs/DATABASE.md) §5.2 and ADRs **0003–0006** under [`docs/decisions/`](../docs/decisions/README.md). Do not implement features against `neon_auth` workspace tables without a new ADR.

## Web relationship

`apps/web` must never import this package. Browser features may keep `db-schema` notes as upstream persistence intent, but executable Drizzle schema and migrations live here and are consumed by future server/API code through `@afenda/database`.

## Scripts

- `pnpm --filter @afenda/database typecheck`
- `pnpm --filter @afenda/database lint`
- `pnpm --filter @afenda/database test:run`
- `pnpm --filter @afenda/database db:generate`
- `pnpm --filter @afenda/database db:migrate`

Use `db:push` only for local disposable development databases. Production uses reviewed migrations.
