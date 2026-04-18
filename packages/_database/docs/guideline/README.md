# Database guidelines (`@afenda/database`)

Read in this order when onboarding or changing the persistence layer:

| Doc                                                                                      | Role                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [001-postgreSQL-DDL.md](./001-postgreSQL-DDL.md)                                         | **Charter:** DDL doctrine, constraints, tenant rules, RLS, temporal integrity.                                                                                        |
| [002-foundation-inventory.md](./002-foundation-inventory.md)                             | **Logical foundation:** `pgSchema` domains, module buckets, must-have table families.                                                                                 |
| [002A-foundation-inventory-architecture.md](./002A-foundation-inventory-architecture.md) | **Knowledge base:** L1/L2/L3 truth layers, full trees (`schema/`, `relations/`, `queries/`, `sql/hardening/`, `studio/`), Drizzle Kit, skills + Context7, invariants. |
| [008-db-tree.md](./008-db-tree.md)                                                       | **Path allowlist** for `src/schema/` — edit in the same PR as tree changes.                                                                                           |

**Machine-readable `src/schema/` file list:** [`schema-inventory.json`](./schema-inventory.json) — regenerate with `pnpm run db:inventory:sync` from `packages/_database` after tree edits.

**Team norms:** [../practical-discipline.md](../practical-discipline.md).
