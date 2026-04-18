# Shared schema (`src/schema/shared/`)

Cross-domain **Drizzle building blocks** imported by `iam`, `mdm`, `finance`, etc.:

| File | Role |
| --- | --- |
| [`columns.schema.ts`](./columns.schema.ts) | `idColumn`, timestamps, audit, soft delete, metadata, FK helpers |
| [`enums.schema.ts`](./enums.schema.ts) | Shared `pgEnum` definitions (`generic_status`, `ownership_level`, …) |
| [`helpers.ts`](./helpers.ts) | Reusable `sql` fragments (`current_date`, empty JSONB) |
| [`shared-boundary.schema.ts`](./shared-boundary.schema.ts) | Zod validators (`zodFromPgEnum`, UUID, metadata) aligned with the above |

Enums and columns must stay consistent with migrations (`CREATE TYPE`, column types). See [`docs/guideline/001-postgreSQL-DDL.md`](../../../docs/guideline/001-postgreSQL-DDL.md).

**Drizzle:** shared `pgEnum` and column builders follow [Drizzle pg-core](https://orm.drizzle.team/docs/sql-schema-declaration) patterns used across the package.
