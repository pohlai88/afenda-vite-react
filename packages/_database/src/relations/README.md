# Relations (`@afenda/database/relations`)

Drizzle **`relations()`** graphs for **`db.query.*` with `with:`** — **not** DDL. Table definitions stay in **`src/schema/**`**. This folder mirrors **foreign keys and composite keys\*\* as navigable edges; keep it aligned when DDL changes.

**Imports:** `@afenda/database/relations` or the merged **`afendaDrizzleSchema`** in **`client.ts`**. Prefer package exports; do not deep-import `src/` from apps.

Charter: [`001-postgreSQL-DDL.md`](../../docs/guideline/001-postgreSQL-DDL.md), tree: [`008-db-tree.md`](../../docs/guideline/008-db-tree.md).

---

## Layout

| File                      | Role                                                                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `relations.schema.ts`     | Barrel — re-exports domain graphs + **`auditLogsRelations`** + **`DRIZZLE_RELATION_NAME`**                           |
| `relation-names.ts`       | Stable **`relationName`** strings when two FKs hit the same table (e.g. tenant → currency base vs reporting)         |
| `ref-relations.ts`        | Inverse **`many()`** from `ref` masters (countries, currencies, locales, …) to MDM/IAM children                      |
| `iam-relations.ts`        | IAM graph (users, memberships, roles, assignments; reverse edge to audit logs)                                       |
| `mdm-relations.ts`        | MDM graph (tenants, LE/BU/location, parties, items, org units, item settings, …)                                     |
| `finance-relations.ts`    | Finance graph (COA, accounts, fiscal calendars/periods; account ↔ item-settings **`relationName`** pairing with MDM) |
| `governance-relations.ts` | **`data_sources`** inverse edges (global registry referenced by MDM)                                                 |

---

## Rules

1. **Disambiguation:** When multiple columns reference the same table, set matching **`relationName`** on **`one`** and **`many`** (see [`relation-names.ts`](./relation-names.ts) and [Drizzle docs](https://orm.drizzle.team/docs/relations#disambiguating-relations)).
2. **Cross-domain pairs:** e.g. `itemEntitySettings` ↔ `accounts` uses named edges (`sales_account_item_settings`, …) — **must match** on both [`mdm-relations.ts`](./mdm-relations.ts) and [`finance-relations.ts`](./finance-relations.ts).
3. **No fake edges:** Do not add `many()` where there is no FK (polymorphic / composite-key surrogates stay as queries, not relations).
4. **After edits:** run **`pnpm run db:guard`** in `packages/_database`.

---

## Filename note

`relations.schema.ts` uses the **`*.schema.ts`** suffix as a **historical exception** (DDL modules reserve that suffix under `src/schema/`). The barrel could be renamed to `index.ts` later; update `client.ts`, package exports, and `008-db-tree.md` together.
