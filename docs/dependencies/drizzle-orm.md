---
title: Drizzle ORM
description: Schemas, queries, migrations, and validation patterns for server-side packages.
category: backend-planned
status: Planned
order: 20
---

# Drizzle ORM guide (Afenda / server-side)

This document describes how **Afenda** uses **[Drizzle ORM](https://orm.drizzle.team/)** for **PostgreSQL** in **server-only** packages, canonically **`packages/_database`** with public import **`@afenda/database`**—**not** inside **`apps/web`** (Vite has no DB client).

**[Database](../DATABASE.md)** remains authoritative for **connection strings**, **monorepo layout**, **migrations workflow**, and **ERP-oriented schema** (tenants, RBAC). This guide adds **Drizzle-specific** conventions so new code is consistent.

**Deeper reference:** the repo [Drizzle ORM skill](../../.agents/skills/drizzle-orm/SKILL.md) (advanced schemas, query patterns, performance notes)—use it when designing complex modules.

**Official documentation:**

- [Drizzle ORM](https://orm.drizzle.team/) — docs and guides
- [PostgreSQL get started](https://orm.drizzle.team/docs/get-started-postgresql) — `pg` / `drizzle-orm/node-postgres`
- [Connection overview](https://orm.drizzle.team/docs/connect-overview) — drivers (incl. Neon HTTP / serverless)
- [SQL schema declaration](https://orm.drizzle.team/docs/sql-schema-declaration) — tables, **casing**, column names
- [Drizzle Kit overview](https://orm.drizzle.team/docs/kit-overview) — CLI commands
- [Drizzle config file](https://orm.drizzle.team/docs/drizzle-config-file) — `defineConfig`, `dialect`, `out`, `migrations`
- [Drizzle Kit — `generate`](https://orm.drizzle.team/docs/drizzle-kit-generate) — SQL from schema
- [Drizzle Kit — `migrate`](https://orm.drizzle.team/docs/drizzle-kit-migrate) — apply migrations
- [Migrations](https://orm.drizzle.team/docs/migrations) — code-first workflow
- [Query performance](https://orm.drizzle.team/docs/perf-queries) — prepared statements, `sql.placeholder`
- [Zod schemas from tables](https://orm.drizzle.team/docs/zod) — `drizzle-orm/zod`
- [Connect Neon](https://orm.drizzle.team/docs/connect-neon) — `neon-http` / `neon-serverless` with Drizzle
- [Upgrade guide (v1 / validators)](https://orm.drizzle.team/docs/upgrade-v1) — `drizzle-zod` → `drizzle-orm/zod`
- [drizzle-orm on GitHub](https://github.com/drizzle-team/drizzle-orm)

---

## How we use Drizzle

| Aspect                | Afenda convention                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Runtime**           | **Node** (`apps/api`) or scripts—never the browser bundle                                                                             |
| **SQL**               | **SQL-like** `drizzle-orm` API + optional `sql` tagged templates; you stay close to Postgres                                          |
| **Types**             | **`$inferSelect` / `$inferInsert`** (or **`InferSelectModel` / `InferInsertModel`** from `drizzle-orm`)—keep DTOs aligned with schema |
| **Migrations**        | **Drizzle Kit** generates SQL; review and apply per [Database](../DATABASE.md) §4–5                                                   |
| **Size / cold start** | Lighter than typical full-feature ORMs—fits **serverless** or small Node services ([Neon](./neon.md))                                 |

---

## Package layout

Align with [Database](../DATABASE.md) §3. Typical shape:

```text
packages/_database/         # package name: @afenda/database
├── drizzle.config.ts       # defineConfig({ dialect, schema, out, dbCredentials, ... })
├── package.json            # drizzle-orm, pg; dev: drizzle-kit, @types/pg; scripts: db:generate, db:migrate, ...
├── src/
│   ├── tenancy/
│   ├── identity/
│   ├── authorization/
│   ├── organization/
│   ├── audit/
│   ├── schema/             # aggregate exports
│   └── index.ts            # export `db`, re-export approved public APIs
└── drizzle/                # generated migration SQL (default folder name; override with `out`)
```

Minimal **`drizzle.config.ts`** (align `schema` / `out` with your tree):

```typescript
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

**`apps/api`** imports **`db`** from the shared package (or a thin wrapper that adds logging—see [Pino](./pino.md)).

Install (when scaffolding):

```bash
pnpm add drizzle-orm pg
pnpm add -D drizzle-kit @types/pg
```

Use **`drizzle-orm/node-postgres`** with a **`pg` `Pool`** (matches [PostgreSQL get started](https://orm.drizzle.team/docs/get-started-postgresql)). For Neon, use **`drizzle-orm/neon-http`** or **`drizzle-orm/neon-serverless`** per [Connect Neon](https://orm.drizzle.team/docs/connect-neon) and [Neon](./neon.md).

---

## Client bootstrap

```typescript
// packages/_database/src/client.ts (illustrative)
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema/index.js"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DB_POOL_MAX ?? 10),
})

export const db = drizzle({
  client: pool,
  schema,
  // Optional: camelCase TS keys → snake_case SQL when using implicit column names — see Casing below
  // casing: 'snake_case',
})
```

- **`DATABASE_URL`** is **server-only** (never `VITE_*`). See [Database](../DATABASE.md) §2.
- **Pool tuning** and **graceful shutdown** (`pool.end()` on SIGTERM) belong in production API code.

### Casing

Pick **one** convention repo-wide and document it in the database package README.

- **Explicit DB names** (common for ERP): use **`createdAt: timestamp('created_at', { withTimezone: true })`** so TypeScript stays camelCase and Postgres stays `snake_case` without relying on global mapping.
- **Implicit column names**: you can set **`casing: 'snake_case'`** on `drizzle({ ... })` so camelCase schema keys generate snake_case column names in SQL—see [SQL schema declaration](https://orm.drizzle.team/docs/sql-schema-declaration).

Drizzle Kit **`introspect.casing`** (`camel` / `preserve`) affects **pulled** schema only—see [Drizzle config file](https://orm.drizzle.team/docs/drizzle-config-file).

---

## Schema conventions

### PostgreSQL core imports

Use **`drizzle-orm/pg-core`** for tables: `pgTable`, `uuid`, `text`, `timestamp`, `boolean`, `integer`, `jsonb`, etc.

### Multi-tenant ERP tables

Business tables **must** be scoped to a tenant unless explicitly global (rare):

- Include **`tenantId`** (or your standard FK to `tenants`) on tenant-owned rows.
- Add **indexes** on **`tenant_id`** plus columns you filter often (status, dates).
- Enforce tenant isolation in **every** query path from [API](../API.md) handlers—**never** trust `tenant` from the URL without verifying membership ([Roles and permissions](../ROLES_AND_PERMISSIONS.md)).

```typescript
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core"

export const exampleRecords = pgTable("example_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(), // FK to tenants.id in your schema
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
})
```

### Timestamps and soft delete

Prefer **consistent** `createdAt` / `updatedAt` (and optional **`deletedAt`**) on mutable ERP entities. Partial indexes on **`deleted_at IS NULL`** help large tables.

### Relations

Define **`relations()`** when you use **`db.query.*`** relational APIs or want declarative joins. Keep relation graphs **bounded**—deep `with: { ... }` trees can become N+1 if misused; prefer explicit joins for hot paths.

---

## Queries and performance

### Narrow `select` columns

For **wide** tables (many columns or large JSON), **do not** use bare `.select()` in hot paths. Select only columns you need.

```typescript
// Prefer explicit column maps for list/detail DTOs
await db
  .select({
    id: exampleRecords.id,
    name: exampleRecords.name,
    tenantId: exampleRecords.tenantId,
  })
  .from(exampleRecords)
  .where(eq(exampleRecords.tenantId, tenantId))
```

### Filter in SQL, not in JavaScript

Use **`where`**, **`and`**, **`or`**, **`inArray`**, etc. Avoid fetching large sets and **`.filter()`** in JS—indexes cannot help that.

### Pagination

Use **`limit` / `offset`** or **keyset** pagination for large lists; align with API list endpoints.

### Upserts and races

For “insert or update” semantics, prefer **`onConflictDoUpdate`** (or equivalent) **one round-trip** instead of **select → update/insert**, which races under concurrency.

### Transactions

Use **`db.transaction(async (tx) => { ... })`** for multi-step writes that must commit or roll back together (posting documents, transferring stock, etc.).

### Prepared statements

For **very hot** repeated queries (same shape, different params), use **`sql.placeholder('id')`** (or relational-query **`.prepare('name')`**) and **`.prepare()`** / **`.execute({ ... })`**—see [Query performance](https://orm.drizzle.team/docs/perf-queries) and the [Drizzle skill](../../.agents/skills/drizzle-orm/SKILL.md). Not needed for every route.

---

## Migrations (Drizzle Kit)

Workflow summary—full commands and safety rules: **[Database](../DATABASE.md)** §4–5 and §“Production”.

- **`pnpm exec drizzle-kit generate`** (or **`npx drizzle-kit generate`**) after schema edits — writes SQL and snapshots under your configured **`out`** folder; **review** every migration ([`generate` docs](https://orm.drizzle.team/docs/drizzle-kit-generate)).
- **`pnpm exec drizzle-kit migrate`** to apply in CI/staging/prod ([`migrate` docs](https://orm.drizzle.team/docs/drizzle-kit-migrate)). Alternatively run the **`migrate()`** helper from **`drizzle-orm/<driver>/migrator`** (e.g. **`node-postgres`**) on startup if your API owns migration application—still keep SQL under version control.
- Optional: **`drizzle-kit studio`** (local UI), **`drizzle-kit pull`** (introspect)—see [Kit overview](https://orm.drizzle.team/docs/kit-overview).
- **`drizzle-kit push`** only for **local** rapid iteration—not production.
- Customize the migrations journal table/schema in **`defineConfig({ migrations: { ... } })`** if needed—see [Drizzle config file](https://orm.drizzle.team/docs/drizzle-config-file).

---

## Validation: `drizzle-orm/zod` + Zod v4

Generate insert/update/select Zod schemas from tables to share shapes with **[Zod](./zod.md)** and HTTP handlers. Prefer **`drizzle-orm/zod`** (standalone **`drizzle-zod`** is deprecated in favor of in-repo validators—see [Upgrade guide](https://orm.drizzle.team/docs/upgrade-v1), [Zod doc](https://orm.drizzle.team/docs/zod)):

```typescript
import { createInsertSchema, createSelectSchema } from "drizzle-orm/zod"
import { exampleRecords } from "./schema/example.js"

export const exampleSelectSchema = createSelectSchema(exampleRecords)
export const exampleInsertSchema = createInsertSchema(exampleRecords, {
  // refinements per column
})
```

Use **insert/update** schemas at **API boundaries**; **authoritative** authorization remains in [Fastify](./fastify.md) hooks and [roles](../ROLES_AND_PERMISSIONS.md).

---

## Logging and observability

- Optionally pass a **Drizzle logger** implementation or wrap the pool to log **slow queries** (see [Pino](./pino.md)).
- Correlate with **`requestId`** from [API](../API.md) error responses.

---

## Red flags (stop and fix)

- **`drizzle-orm`** or **`pg`** imported from **`apps/web`** or any client bundle.
- Queries **without** tenant predicates on tenant-owned tables.
- **Dynamic SQL** built with string concatenation—use **`sql` tagged templates** and parameters.
- **No transaction** around multi-row business invariants.
- **Unbounded** `select()` without `limit` on large tables in user-facing code paths.
- **`any`** on **`jsonb`** columns—use **`.$type<YourType>()`** or Zod parse at the boundary.

---

## Related documentation

- [Database](../DATABASE.md) — env, layout, migrations, ERP schema overview
- [Neon](./neon.md) — hosted Postgres
- [Fastify](./fastify.md) — HTTP entry that calls `db`
- [API reference](../API.md) — contract above the database
- [Roles and permissions](../ROLES_AND_PERMISSIONS.md) — tenant + PBAC enforcement
- [Zod](./zod.md) — runtime validation alongside Drizzle Zod helpers
- [Pino](./pino.md) — structured logging for API + SQL diagnostics

**External:** [orm.drizzle.team](https://orm.drizzle.team/) · [Drizzle GitHub](https://github.com/drizzle-team/drizzle-orm)

**Context7 (AI doc refresh):** resolve **`Drizzle ORM`** → **`/drizzle-team/drizzle-orm-docs`** (`resolve-library-id`), then **`query-docs`** for the topic (migrations, drivers, Zod, performance).
