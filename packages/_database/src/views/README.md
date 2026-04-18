# Views (`src/views/`)

Drizzle **`pgView`** definitions on the **`mdm`** PostgreSQL schema (`mdm.view(...)`), re-exported from [`src/schema/index.ts`](../schema/index.ts) so **`drizzle-kit generate`** emits `CREATE VIEW` in migrations (single source of truth; supersedes hand-maintained `CREATE VIEW` blocks in `sql/hardening/patch_k_canonical_views.sql` where views moved to Drizzle).

**Docs:** [Drizzle — Views](https://orm.drizzle.team/docs/views) · [PostgreSQL `CREATE VIEW`](https://www.postgresql.org/docs/current/sql-createview.html).

## Why this folder exists

- **Stable semantics** for “current policy”, “golden party”, “golden item” — the filters apps should mirror when querying base tables.
- **Kit integration:** views live outside `src/schema/<domain>/*.schema.ts` to keep table DDL files focused; the schema barrel still pulls them in for one Drizzle schema graph.

## Layout

| File | Role |
| --- | --- |
| `mdm-canonical-views.ts` | `v_current_tenant_policies`, `v_golden_parties`, `v_golden_items` |
| `index.ts` | Re-exports (imported by `src/schema/index.ts`) |

## Operations

- **Materialized views** — `mdm.materializedView()` when refresh semantics are required; not used here yet.
- **RLS on views** — optional `pgView(...).with({ securityInvoker: true })` per [Drizzle RLS](https://orm.drizzle.team/docs/rls#views) if policies attach to views; not enabled by default here.

## Related

- [001 DDL charter](../../docs/guideline/001-postgreSQL-DDL.md) (canonical query surfaces)
- [`sql/hardening/README.md`](../../sql/hardening/README.md) (patch K relationship)
