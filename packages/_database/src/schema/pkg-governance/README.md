# Package governance (`src/schema/pkg-governance/`)

Cross-cutting **conventions and helpers** for `@afenda/database`: Drizzle Kit migration filenames, PostgreSQL identifier naming, which PG schemas are managed by Kit (`schemaFilter`), `*.schema.ts` module suffix, and Zod validators for those values.

**No application DDL** — tables remain under `src/schema/{iam,mdm,…}/`. This folder is safe to import from tooling, tests, and docs.

| File                                                                       | Role                                                                                  |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [`constants.ts`](./constants.ts)                                           | `PG_IDENTIFIER_MAX_LENGTH`, `DRIZZLE_MIGRATIONS_SCHEMA`, `DRIZZLE_MANAGED_PG_SCHEMAS` |
| [`migration-sql-files.ts`](./migration-sql-files.ts)                       | `NNNN_slug.sql` pattern + parsers                                                     |
| [`sql-identifiers.ts`](./sql-identifiers.ts)                               | `pkName`, `fkName`, `uniqueName`, UTF-8 byte length checks                            |
| [`schema-modules.ts`](./schema-modules.ts)                                 | `*.schema.ts` glob / detector                                                         |
| [`database-concepts.ts`](./database-concepts.ts)                           | `DatabaseConcept` vocabulary for docs/codegen                                         |
| [`pkg-governance-boundary.schema.ts`](./pkg-governance-boundary.schema.ts) | Zod schemas aligned with the above                                                    |
| [`index.ts`](./index.ts)                                                   | Barrel (`.js` extensions for Node ESM)                                                |

## Related

- [`docs/practical-discipline.md`](../../../docs/practical-discipline.md)
- [`drizzle.config.ts`](../../../drizzle.config.ts)
