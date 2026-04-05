# Database (PostgreSQL + Drizzle)

Afenda ERP data lives in **PostgreSQL**, accessed from **server-side** code (API, workers, scripts)—**never** from the Vite browser bundle. **[Drizzle ORM](https://orm.drizzle.team/)** is the recommended layer for type-safe schemas, migrations, and queries.

**Drizzle-specific guidelines** (client setup, tenant columns, query performance, `drizzle-orm/zod`): [Drizzle ORM dependency guide](./dependencies/drizzle-orm.md).

This repo’s **`apps/web`** package does not embed a database client today. When you add a backend (e.g. **`apps/api`**) or a shared package (e.g. **`packages/database`**), place **Drizzle schema**, **migrations**, and **`drizzle.config.ts`** there and run scripts with **`pnpm --filter <package>`**.

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
DATABASE_URL="postgresql://user:password@localhost:5432/afenda?options=--search_path%3Dafenda,public,drizzle"
```

Adjust schema names (`afenda`, `drizzle`) to match your project. **`public`** is the usual default for extensions; keep **`drizzle`** (or your chosen name) for Drizzle’s migration metadata if you use a separate schema.

---

## 3. Suggested monorepo layout

Illustrative paths—rename to match what you create:

```text
packages/database/          # or apps/api/
├── drizzle.config.ts
├── src/
│   ├── index.ts            # db client export
│   └── schema/
│       ├── index.ts
│       ├── tenants.ts
│       ├── users.ts
│       ├── audit.ts
│       └── ...             # ERP modules (finance, inventory, etc.)
└── drizzle/                # generated SQL migrations
```

The **`apps/web`** client calls **HTTP APIs** only; APIs import `db` from this package.

---

## 4. Package scripts (when the DB package exists)

Define scripts in the database/API **`package.json`** and run them via the workspace filter:

| Script (example) | Description |
| --- | --- |
| `db:generate` | `drizzle-kit generate` — create migration SQL from schema changes |
| `db:migrate` | `drizzle-kit migrate` — apply pending migrations |
| `db:push` | `drizzle-kit push` — **dev only**; quick sync without migration files |
| `db:studio` | `drizzle-kit studio` — inspect data locally |

```bash
pnpm --filter @afenda/database db:generate
pnpm --filter @afenda/database db:migrate
```

**Production:** always use **versioned migrations** (`db:migrate`). Avoid `db:push` against production—it can cause data loss or drift.

---

## 5. Schema overview (ERP-oriented)

### 5.1 Core multi-tenant model (illustrative)

```
tenants                 # Organizations (companies)
├── memberships         # User ↔ tenant ↔ roles
├── persons / users     # People (may link to auth subject)
└── audit_logs          # Change history for compliance
```

**Roles and permissions (RBAC + PBAC):** model `permissions`, `roles`, `role_permissions`, and **many-to-many** `tenant_membership_roles` (RBAC assignment). Effective grants are the **union** of role permissions; APIs enforce **permission keys** (PBAC). See [Roles and permissions](./ROLES_AND_PERMISSIONS.md).

Module-specific tables (finance, inventory, HR, etc.) should **reference `tenant_id`** (or equivalent) and follow your domain model in **`packages/database/src/schema/`**.

### 5.2 Auth-related tables

If you use **Auth.js** with a database adapter or your own session store, you will typically have tables such as:

```
users
├── accounts            # OAuth / IdP links
├── sessions
├── verification_tokens
└── authenticators      # WebAuthn / passkeys (optional)
```

Align this with [Authentication](./AUTHENTICATION.md); the **Vite app** never queries these tables directly.

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
// packages/database/src/schema/tenants.ts (illustrative)
import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 63 }).unique().notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
```

### 6.2 Enum-style columns

Use **Postgres enums** or **text + check constraints** via Drizzle for finite sets (document status, posting state, etc.).

---

## 7. Usage (server-side)

### 7.1 Client and queries

```typescript
import { db } from '@afenda/database';
import { tenants } from '@afenda/database/schema';
import { eq } from 'drizzle-orm';

const tenant = await db.query.tenants.findFirst({
  where: eq(tenants.slug, 'acme'),
});
```

### 7.2 Inserts and transactions

Use **transactions** for multi-step ERP operations (e.g. post a journal entry + update balances).

```typescript
import { db } from '@afenda/database';

await db.transaction(async (tx) => {
  // await tx.insert(...)
  // await tx.update(...)
});
```

### 7.3 Relations (Drizzle query API)

Define relations in schema and use `with: { ... }` for nested reads when appropriate—mind **N+1** queries on large lists; see [Performance](./PERFORMANCE.md).

### 7.4 Vector similarity (optional)

```typescript
import { sql } from 'drizzle-orm';

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

- [Architecture](./ARCHITECTURE.md) — where the API and DB sit in the monorepo
- [Deployment](./DEPLOYMENT.md) — Vercel web client vs hosted Postgres (Neon, etc.)
- [Integrations](./INTEGRATIONS.md) — storing OAuth tokens and sync control tables
- [Glossary](./GLOSSARY.md) — tenant, legal entity, and data scoping language
- [Authentication](./AUTHENTICATION.md) — sessions, Auth.js tables, Auth0
- [Roles and permissions](./ROLES_AND_PERMISSIONS.md) — role/permission tables and union-of-roles model
- [Project structure](./PROJECT_STRUCTURE.md) — feature boundaries in `apps/web`
- [Performance](./PERFORMANCE.md) — query batching and UI lists

External: [Drizzle ORM](https://orm.drizzle.team/docs/overview), [pgvector](https://github.com/pgvector/pgvector).
