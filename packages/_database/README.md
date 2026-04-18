# `@afenda/database`

Server-only **PostgreSQL** + **Drizzle ORM** boundary for Afenda: multi-schema DDL (`ref`, `iam`, `mdm`, `finance`, `governance`), **7W1H audit** (`governance.audit_logs` + JSON envelope), Drizzle **relations**, read-model **views**, query helpers, studio glossary metadata, and **raw SQL hardening** beside generated migrations.

## Where to start

| Doc                                                                              | Purpose                                                                              |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **[`src/schema/README.md`](./src/schema/README.md)**                             | Schema tree: main barrel, domains, constants/helpers/identity/tenancy/pkg-governance |
| [`docs/guideline/README.md`](./docs/guideline/README.md)                         | Guideline index and reading order                                                    |
| [`docs/guideline/001-postgreSQL-DDL.md`](./docs/guideline/001-postgreSQL-DDL.md) | DDL charter                                                                          |
| [`docs/guideline/008-db-tree.md`](./docs/guideline/008-db-tree.md)               | Authorised on-disk paths                                                             |
| [`docs/practical-discipline.md`](./docs/practical-discipline.md)                 | Team rules (tenant safety, placement, Drizzle vs SQL)                                |
| [`sql/hardening/README.md`](./sql/hardening/README.md)                           | Patch order for hand-authored SQL                                                    |

**Machine inventory:** [`docs/guideline/schema-inventory.json`](./docs/guideline/schema-inventory.json) lists `src/schema/**/*.ts` and `src/7w1h-audit/**/*.ts`; keep it in sync (`pnpm run db:inventory:sync`) — drift fails `db:guard` / `db:inventory:verify`.

## Package exports

Import only through these paths (no deep `src/` imports from apps):

| Subpath                                 | Contents                                                                                                                                                                                                                                                             |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`@afenda/database`**                  | `createPgPool`, `createDbClient`, `db`, `pool`, `afendaDrizzleSchema`, `DatabaseClient`; also **flat** re-exports from **`7w1h-audit`**, **`schema/identity`**, **`schema/tenancy`**, **`pkg-governance`**, and **`queries`** (see [`src/index.ts`](./src/index.ts)) |
| **`@afenda/database/schema`**           | Merged DDL barrel: `finance`, `governance`, `iam`, `mdm`, `ref`, `shared`, plus [`src/views`](./src/views/) — see [`src/schema/index.ts`](./src/schema/index.ts)                                                                                                     |
| **`@afenda/database/tenancy`**          | Tenancy Zod + services (`resolveActiveTenantContext`, …)                                                                                                                                                                                                             |
| **`@afenda/database/7w1h-audit`**       | Audit DDL, services, contracts, Zod boundary                                                                                                                                                                                                                         |
| **`@afenda/database/audit`**            | Alias of `./7w1h-audit`                                                                                                                                                                                                                                              |
| **`@afenda/database/governance`**       | Package governance: migration naming, `DRIZZLE_MANAGED_PG_SCHEMAS`, identifier helpers, `*.schema.ts` rules (`src/schema/pkg-governance/`)                                                                                                                           |
| **`@afenda/database/relations`**        | Drizzle `relations()` graph (merged into the client schema in [`client.ts`](./src/client.ts))                                                                                                                                                                        |
| **`@afenda/database/queries`**          | Resolvers + helpers ([`src/queries/README.md`](./src/queries/README.md))                                                                                                                                                                                             |
| **`@afenda/database/studio`**           | Glossary / tooling metadata (not `pgTable` DDL); see [`src/studio/`](./src/studio/)                                                                                                                                                                                  |
| **`@afenda/database/studio/snapshots`** | Public snapshot types                                                                                                                                                                                                                                                |

**Env / pool keys** live in [`src/schema/constants/runtime.ts`](./src/schema/constants/runtime.ts) (used by the client, not a separate export path).

## Environment

- **`DATABASE_URL`** — PostgreSQL connection string.
- Optional pool tuning: **`DB_POOL_MAX`**, **`DB_IDLE_TIMEOUT_MS`**, **`DB_CONNECTION_TIMEOUT_MS`**, **`DB_STATEMENT_TIMEOUT_MS`** (see `runtime.ts`).

Never expose these via `VITE_*` or browser bundles.

## Commands to run

**Set `DATABASE_URL`** in your environment (e.g. monorepo `.env` loaded by `@afenda/env-loader`).

### Apply migrations (most common)

Migrations and `drizzle.config.ts` live under **`packages/_database`**. Run with that directory as the working directory.

From the **monorepo root** (`afenda-react-vite/`):

```bash
pnpm run db:migrate
```

(Root scripts use `pnpm -C packages/_database run …` so the process cwd is the package.)

From **this package directory** (`packages/_database/`):

```bash
pnpm run db:migrate
```

### After changing Drizzle schema (generate SQL, then migrate)

Root:

```bash
pnpm run db:generate
pnpm run db:migrate
```

Same from `packages/_database/`:

```bash
pnpm run db:generate
pnpm run db:migrate
```

### Where scripts live

- The **root** `package.json` forwards: `db:generate`, `db:migrate`, `db:push`, `db:push:force` using **`pnpm -C packages/_database run …`** (same effect as `cd packages/_database && pnpm run …`).
- **Every** `db:*` script below is defined in **`packages/_database/package.json`**. Run them in either of these ways:
  - `cd packages/_database` then `pnpm run <script>`, or
  - from the repo root: `pnpm -C packages/_database run <script>` (or the shortcuts above).

### CI / guards (not a substitute for migrate)

Run inside `packages/_database`, or from the repo root:

```bash
pnpm -C packages/_database run db:guard
pnpm -C packages/_database run db:ci
```

## Package scripts (`packages/_database`)

| Script                                | Purpose                                                                                         |
| ------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `pnpm run typecheck`                  | `tsc`                                                                                           |
| `pnpm run test` / `pnpm run test:run` | Vitest                                                                                          |
| `pnpm run db:inventory:sync`          | Regenerate `docs/guideline/schema-inventory.json`                                               |
| `pnpm run db:inventory:verify`        | Fail if inventory ≠ disk                                                                        |
| `pnpm run db:guard`                   | typecheck + schema guards + inventory + hardening verify + focused Vitest contract tests        |
| `pnpm run db:guard:ci`                | Same guards without full typecheck                                                              |
| `pnpm run db:ci`                      | `db:guard:ci` + migration checks + sync verify                                                  |
| `pnpm run db:generate`                | `db:guard` then `drizzle-kit generate` then `ensure-public-schema-in-baseline-migration`        |
| `pnpm run db:migrate`                 | Apply `drizzle/*.sql` via ORM `migrate()` (**prints full PG errors**; same journal as Kit)      |
| `pnpm run db:migrate:kit`             | Raw `drizzle-kit migrate` (spinner may hide errors)                                             |
| `pnpm run db:studio`                  | `drizzle-kit studio`                                                                            |
| `pnpm run db:push` / `db:push:force`  | `drizzle-kit push` — **disposable DBs only**                                                    |
| `pnpm run db:validate-sql`            | Journal ↔ `*.sql` ↔ snapshots + `drizzle-kit check` (validates generated SQL vs current schema) |
| `pnpm run db:check-migrations`        | Same as `db:validate-sql` (kept for `db:ci`)                                                    |
| `pnpm run db:verify-migrations-sync`  | Journal / migration sync                                                                        |
| `pnpm run db:apply-hardening`         | Apply `sql/hardening` patches (see script)                                                      |
| `pnpm run db:sync-glossary-enums`     | Sync glossary enums from schema (see script)                                                    |

Versioned SQL under `drizzle/` (plus ordered patches in `sql/hardening/` where used) is the deployable path. Use **`db:push`** only on throwaway databases.

## Layout (summary)

| Path                                            | Role                                                                                                                                            |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| [`src/schema/`](./src/schema/README.md)         | Drizzle DDL domains, shared enums/columns, views re-export, barrels (identity, tenancy), constants/helpers/pkg-governance                       |
| [`src/relations/`](./src/relations/README.md)   | `relations()` — not DDL                                                                                                                         |
| [`src/7w1h-audit/`](./src/7w1h-audit/README.md) | 7W1H audit modules (re-exported via `governance` for Kit)                                                                                       |
| [`src/queries/`](./src/queries/README.md)       | Tenant/membership/item resolvers                                                                                                                |
| [`src/views/`](./src/views/README.md)           | `pgView` read models (`mdm` schema)                                                                                                             |
| [`src/studio/`](./src/studio/)                  | Glossary / snapshots                                                                                                                            |
| [`sql/hardening/`](./sql/hardening/README.md)   | Raw PostgreSQL (RLS, EXCLUDE, triggers, …)                                                                                                      |
| `drizzle/`                                      | Generated SQL + snapshots (gitignored); `meta/_journal.json` is committed empty so Kit never errors with ENOENT on first `generate` / `migrate` |

Deeper architecture maps: [`docs/guideline/002-foundation-inventory.md`](./docs/guideline/002-foundation-inventory.md), [`002A`](./docs/guideline/002A-foundation-inventory-architecture.md).
