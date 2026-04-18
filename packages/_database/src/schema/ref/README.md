# Reference data (`pgSchema("ref")`)

Shared **lookup** tables under the PostgreSQL schema **`ref`**, via `pgSchema("ref")` in [`_schema.ts`](./_schema.ts). Re-exported from [`src/schema/index.ts`](../index.ts). See [Drizzle — PostgreSQL schemas](https://orm.drizzle.team/docs/schemas).

| Table        | Role                           |
| ------------ | ------------------------------ |
| `countries`  | ISO 3166-1 alpha-2 (`code` PK) |
| `currencies` | ISO 4217 + metadata            |
| `locales`    | BCP 47 tags                    |
| `timezones`  | IANA names                     |
| `uoms`       | Unit-of-measure codes          |

[`ref-boundary.schema.ts`](./ref-boundary.schema.ts) holds matching **Zod** validators for seeds and APIs.

## Related

- [`docs/practical-discipline.md`](../../../docs/practical-discipline.md)
- [`docs/guideline/001-postgreSQL-DDL.md`](../../../docs/guideline/001-postgreSQL-DDL.md)
