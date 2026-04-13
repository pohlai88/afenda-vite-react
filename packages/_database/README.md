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

## Web relationship

`apps/web` must never import this package. Browser features may keep `db-schema` notes as upstream persistence intent, but executable Drizzle schema and migrations live here and are consumed by future server/API code through `@afenda/database`.

## Scripts

- `pnpm --filter @afenda/database typecheck`
- `pnpm --filter @afenda/database lint`
- `pnpm --filter @afenda/database test:run`
- `pnpm --filter @afenda/database db:generate`
- `pnpm --filter @afenda/database db:migrate`

Use `db:push` only for local disposable development databases. Production uses reviewed migrations.
