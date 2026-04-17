# Database (PostgreSQL + Drizzle)

Afenda ERP data lives in **PostgreSQL**, accessed from **server-side** code (API, workers, scripts)—**never** from the Vite browser bundle. **[Drizzle ORM](https://orm.drizzle.team/)** is the recommended layer for type-safe schemas, migrations, and queries.

**Drizzle-specific guidelines** (client setup, tenant columns, query performance, `drizzle-orm/zod`): [Drizzle ORM dependency guide](./dependencies/drizzle-orm.md).

This repo’s **`apps/web`** package does not embed a database client. The canonical database package is **`packages/_database`** and its public import name is **`@afenda/database`**. Place **Drizzle schema**, **migrations**, and **`drizzle.config.ts`** there; backend/API code imports from `@afenda/database`.

**Architecture doctrine (business-first):** [Database architecture doctrine](../packages/_database/docs/DATABASE_ARCHITECTURE_DOCTRINE.md). **Business ↔ table mapping (YAML):** [business-technical-glossary.yaml](../packages/_database/docs/data/business-technical-glossary.yaml).

---

## 1. Prerequisites

- **PostgreSQL 15+** (or your org’s supported LTS).
- Optional: **[pgvector](https://github.com/pgvector/pgvector)** if you need **embedding search** (similar documents, semantic help, etc.).

```sql
-- Extension must exist on the instance (often created by a DBA)
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## 2. Connection and environment

Use a **server-only** `DATABASE_URL` (do **not** prefix with `VITE_`). Example with a dedicated schema search path:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/afenda?options=--search_path%3Dmdm,iam,ref,finance,governance,public,drizzle"
```

Adjust schema names to match your project. Domain tables live under **`mdm`**, **`iam`**, **`ref`**, **`finance`**, **`governance`** (see `packages/_database/docs/guideline/`). **`public`** holds shared enum types and extensions; keep **`drizzle`** for Drizzle’s migration metadata ([`DRIZZLE_MIGRATIONS_SCHEMA`](packages/_database/src/governance/constants.ts)).

---

## 3. Canonical monorepo layout

`packages/_database` is intentionally underscore-prefixed for repo governance, while the public package name remains clean:

```text
packages/_database/         # package name: @afenda/database
├── drizzle.config.ts
├── src/
│   ├── tenancy/
│   ├── identity/
│   ├── authorization/
│   ├── organization/
│   ├── audit/
│   ├── constants/          # infrastructure constants only
│   ├── helpers/            # low-level helpers only
│   ├── schema/             # aggregate Drizzle exports
│   └── index.ts            # public db client export
└── drizzle/                # generated SQL migrations
```

The **`apps/web`** client calls **HTTP APIs** only. It must not import `@afenda/database`, `drizzle-orm`, or `pg`.

---

## 4. Package scripts (when the DB package exists)

Define scripts in the database/API **`package.json`** and run them via the workspace filter:

| Script (example)    | Description                                                            |
| ------------------- | ---------------------------------------------------------------------- |
| `db:generate`       | `drizzle-kit generate` — create migration SQL from schema changes      |
| `db:migrate`        | `drizzle-kit migrate` — apply pending migrations                       |
| `db:push`           | `drizzle-kit push` — **dev only**; quick sync without migration files  |
| `db:studio`         | `drizzle-kit studio` — inspect data locally                            |
| `db:seed`           | Governed seed runtime (`tsx scripts/seed.ts`) — see §4.1               |
| `db:seed:reference` | `--stage=reference` only                                               |
| `db:seed:demo`      | `--stage=tenant-fixture` only                                          |
| `db:seed:volume`    | `--stage=volume` only (local / CI policy)                              |
| `db:reset:local`    | Destructive `drizzle-seed` reset — `SEED_RESET_LOCAL=true`, local only |

```bash
pnpm --filter @afenda/database db:generate
pnpm --filter @afenda/database db:migrate
```

**Production:** always use **versioned migrations** (`db:migrate`). Avoid `db:push` against production—it can cause data loss or drift.

---

## 4.1 Governed database seeding (Afenda seed runtime)

Seeding is **server-only** and lives in **`@afenda/database`** (`packages/_database/src/seeds/`). The Vite app must never import seed modules or call the DB for fixtures.

**Order:** apply **migrations first**, then seeds (`pnpm db:migrate` then `pnpm db:seed`). If PostgreSQL is unavailable, the seed CLI **fails fast** (no alternate stores).

**Taxonomy:** modules declare a **stage** (`tenant-fixture`, `reference`, `bootstrap`, `volume`, `backfill`). **Policy gates** in code restrict which stages may run in each environment (for example, **volume** is only allowed in `local` / `ci`; **tenant-fixture** is blocked in production unless `SEED_ALLOW_PRODUCTION_FIXTURES=true` or `--allow-production-fixtures`).

**Canonical vs synthetic:** **Canonical** seeds are authored, idempotent business fixtures (permissions, roles, reference rows). **Synthetic** seeds use `@faker-js/faker` / `drizzle-seed` for disposable volume or load data and are not authoritative. A **single orchestrator** runs all modules and emits a **`SeedRunReport`** (console + optional `--report-json=` path for CI).

**CLI (from repo root):** `pnpm db:seed`, `pnpm db:seed:demo`, `pnpm db:seed:volume`, etc. Use `--tenant=<uuid>` or `SEED_TENANT_ID` when targeting a specific tenant in **production**. For **local / CI / preview / staging**, the CLI defaults `tenantScope` to the canonical demo tenant id (`DEMO_TENANT_ID` in `@afenda/database/seeds`).

**Neon / hosted Postgres**

- **Preview / CI:** set `DATABASE_URL` to the **branch** connection string (Neon GitHub integration or Console). Run `pnpm db:migrate` then `pnpm db:seed` against that URL—same workflow as local Postgres.
- **Pooling:** for serverless or high-concurrency runners, use Neon’s **pooler** hostname (host contains `-pooler`). Direct endpoints suit long-lived API processes; see Neon [connection pooling](https://neon.com/docs/connect/connection-pooling) guidance.
- **Cold start:** the first query after compute **suspend** may be slower; the seed script **probes** the DB with `SELECT 1` before modules so failures are immediate (no partial alternate store).

**Local reset (destructive):** `pnpm db:reset:local` runs `drizzle-seed` `reset()` on the Afenda schema bundle only when `SEED_RESET_LOCAL=true` and `SEED_ENV=local`. It does not replace migrations—run `db:migrate` and `db:seed` afterward if you need fixtures again.

| Script (example) | Description                                       |
| ---------------- | ------------------------------------------------- |
| `db:reset:local` | Truncate Afenda Drizzle tables (local + env gate) |

---

## 5. Schema overview (ERP-oriented)

### 5.1 Core multi-tenant model (illustrative)

```
tenants                 # Organizations (companies)
├── memberships         # User ↔ tenant ↔ roles
├── persons / users     # People (may link to auth subject)
└── audit_events        # Durable audit evidence (see Audit architecture)
```

**Audit:** schema and writer patterns follow [Audit architecture](./AUDIT_ARCHITECTURE.md) (evidence model, append-only doctrine, correlation, PII). **Roles and permissions (RBAC + PBAC):** model `permissions`, `roles`, `role_permissions`, and **many-to-many** `tenant_membership_roles` (RBAC assignment). Effective grants are the **union** of role permissions; APIs enforce **permission keys** (PBAC). See [Roles and permissions](./ROLES_AND_PERMISSIONS.md).

Module-specific tables (finance, inventory, HR, etc.) should **reference `tenant_id`** (or equivalent) and live under their owning domain in **`packages/_database/src/<domain>/`**, with aggregate exports from **`packages/_database/src/schema/`**.

### 5.2 Auth-related tables (Afenda + Better Auth)

Neon may show **two** user/session stories in the same database. That is expected; the split below is **normative** so we do not treat parallel roots as “bugs” or duplicate product models.

| Surface                                                                                  | Role                                                                                                                                                | Drizzle in `@afenda/database`                                 |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **`public.user`**, **`public.session`**, **`public.account`**, **`public.verification`** | **Better Auth** runtime store (credentials, OAuth accounts, sessions). Writer: **`apps/api`** via **`createAfendaAuth`**.                           | Not modeled here (owned by Better Auth migrations / adapter). |
| **`iam.user_accounts`**                                                                  | **Afenda ERP principal** (email, display name, tenant memberships, audit actor FKs).                                                                | Modeled (`schema/iam/user-accounts.schema.ts`).               |
| **`iam.identity_links`**                                                                 | **Hard bridge** from Better Auth `public.user.id` (text) → Afenda `user_accounts.id` (uuid).                                                        | Modeled (`schema/iam/identity-links.schema.ts`).              |
| **`iam.user_identities`**                                                                | **Legacy** generic provider links; **do not** use for new features. Prefer **`identity_links`**.                                                    | Modeled but deprecated in code.                               |
| **`neon_auth.*`** (e.g. `neon_auth.user`, `neon_auth.organization`, `neon_auth.session`) | **Non-authoritative** for ERP tenancy and workspace truth. May exist from Neon Auth / console; **must not** drive product RBAC or tenant selection. | Not modeled in this package.                                  |

**Tenancy authority** (tenants, memberships, scopes) lives only in **Afenda** tables such as **`tenants`**, **`tenant_memberships`**, **`membership_scopes`** — not in `neon_auth.organization`. See [ADR-0003](./decisions/ADR-0003-afenda-tenancy-authority.md), [ADR-0004](./decisions/ADR-0004-identity-bridge-and-principals.md), [ADR-0005](./decisions/ADR-0005-auth-schema-authority-public-vs-neon-auth.md), [ADR-0006](./decisions/ADR-0006-session-operating-context.md).

Align runtime behavior with [Authentication](./AUTHENTICATION.md). The **Vite app** never queries these tables directly.

### 5.3 Optional: vectors (pgvector)

For **semantic search** or AI features, add a `vector` column and index per Drizzle/pgvector docs. Example shape:

```typescript
// Illustrative — imports depend on your drizzle-orm + pgvector setup
// embedding: vector('embedding', { dimensions: 1536 })
```

Query with **cosine distance** (`<=>`) or **inner product** per [pgvector](https://github.com/pgvector/pgvector) guidance.

---

## 6. Schema examples (Drizzle)

### 6.1 Tenants

```typescript
// packages/_database/src/schema/mdm/tenants.schema.ts (illustrative; real code uses pgSchema("mdm"))
import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core"

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 63 }).unique().notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
})
```

### 6.2 Enum-style columns

Use **Postgres enums** or **text + check constraints** via Drizzle for finite sets (document status, posting state, etc.).

---

## 7. Usage (server-side)

### 7.1 Client and queries

```typescript
import { db } from "@afenda/database"
import { tenants } from "@afenda/database/schema"
import { eq } from "drizzle-orm"

const tenant = await db.query.tenants.findFirst({
  where: eq(tenants.slug, "acme"),
})
```

### 7.2 Inserts and transactions

Use **transactions** for multi-step ERP operations (e.g. post a journal entry + update balances).

```typescript
import { db } from "@afenda/database"

await db.transaction(async (tx) => {
  // await tx.insert(...)
  // await tx.update(...)
})
```

### 7.3 Relations (Drizzle query API)

Define relations in schema and use `with: { ... }` for nested reads when appropriate—mind **N+1** queries on large lists; see [Performance](./PERFORMANCE.md).

### 7.4 Vector similarity (optional)

```typescript
import { sql } from "drizzle-orm"

// Example: cosine distance — adjust table/column names
// await db.select().from(documents)
//   .orderBy(sql`embedding <=> ${queryEmbedding}`)
//   .limit(10);
```

---

## 8. Localized admin content (optional pattern)

If **admin-edited** strings must vary by **locale**, a generic pattern is a translation table keyed by tenant, entity type, id, field, and locale—with a fallback chain at read time (requested locale → tenant default → `en` → base column). Implement in your API layer; keep **fallback rules** explicit in code to avoid silent data bugs.

---

## 9. Migrations workflow

1. Edit schema under **`src/schema/`**.
2. **`pnpm --filter <pkg> db:generate`** — review generated SQL in **`drizzle/`**.
3. **`pnpm --filter <pkg> db:migrate`** in each environment (CI/CD runs migrations on deploy).

Never rely on **`db:push`** for production.

---

## 10. Cloud / shared databases (optional)

Teams often host PostgreSQL on **RDS**, **Neon**, **Supabase**, **Cloud SQL**, etc. Getting a connection string may involve:

- VPN or **bastion SSH tunnel** (`ssh -L 5432:...`)
- Secrets from a vault (**AWS Secrets Manager**, Doppler, etc.)

Automate URL retrieval in **your** infra scripts; do not commit secrets. If you disable TLS verification for a local tunnel, do so **only** in development and understand the risk.

---

## 11. Best practices

1. **Transactions** for multi-table ERP writes that must succeed or roll back together.
2. **Index** foreign keys and frequent filter columns (`tenant_id`, dates, status).
3. **Soft deletes** (`deleted_at`) where audit and recovery matter; pair with query filters.
4. **Constraints** and **enums** at the DB layer to match Zod/API validation.
5. **Tenant isolation** — every query for tenant data should be scoped (`tenant_id = ?`); enforce in repositories or row-level security if your DB supports it.
6. **Never** import `db` from **`apps/web`** client code.

---

## Related docs

- [Database architecture doctrine](../packages/_database/docs/DATABASE_ARCHITECTURE_DOCTRINE.md) — tenant scope, layers of truth, master vs transactional orientation
- [Business ↔ technical glossary](../packages/_database/docs/data/business-technical-glossary.yaml) — machine-readable term mapping for `@afenda/database`
- [Audit architecture](./AUDIT_ARCHITECTURE.md) — audit doctrine, evidence dimensions, and governance expectations
- [Architecture](./ARCHITECTURE.md) — where the API and DB sit in the monorepo
- [Deployment](./DEPLOYMENT.md) — Vercel web client vs hosted Postgres (Neon, etc.)
- [Integrations](./INTEGRATIONS.md) — storing OAuth tokens and sync control tables
- [Glossary](./GLOSSARY.md) — tenant, legal entity, and data scoping language
- [Authentication](./AUTHENTICATION.md) — sessions, Auth.js tables, Auth0
- [Roles and permissions](./ROLES_AND_PERMISSIONS.md) — role/permission tables and union-of-roles model
- [Project structure](./PROJECT_STRUCTURE.md) — feature boundaries in `apps/web`
- [Performance](./PERFORMANCE.md) — query batching and UI lists

External: [Drizzle ORM](https://orm.drizzle.team/docs/overview), [pgvector](https://github.com/pgvector/pgvector).
