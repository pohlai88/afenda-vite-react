# Query layer (`@afenda/database/queries`)

Canonical **read-model resolvers** and **query primitives** for tenant policy, scoped item settings, and membership + role scopes. Everything here expects a server-side **`DatabaseClient`** (Drizzle over `pg`). **Not** for browser bundles.

**Imports:** `@afenda/database` (queries are re-exported from the root) or `@afenda/database/queries`. Prefer package exports; do not deep-import `src/` from apps.

Charter and tree rules: [`001-postgreSQL-DDL.md`](../../docs/guideline/001-postgreSQL-DDL.md), [`008-db-tree.md`](../../docs/guideline/008-db-tree.md).

---

## Why this layer exists

Without shared resolvers, services tend to:

- duplicate joins against `mdm.tenant_policies`, `mdm.item_entity_settings`, `iam.tenant_memberships` / role tables
- use inconsistent **effective dating** (`effective_from` / `effective_to` vs a calendar **`asOfDate`**)
- apply the wrong **fallback order** for item settings (location → business unit → legal entity)
- drift from the same authorization context the UI assumes

These modules are the **single place** for that SQL shape and ordering.

---

## Layout

| Path                                           | Role                                                                                                                                                                                                           |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.ts`                                     | Barrel — re-exports query primitives + all resolvers                                                                                                                                                           |
| `query-primitives/iso-date-assertions.ts`      | **`todayIsoDateUtc`**, **`assertIsoDateOnly`**, **`isIsoDateOnly`** — resolver `asOfDate` must be **`YYYY-MM-DD`** (UTC day default where documented)                                                          |
| `query-primitives/effective-date-predicate.ts` | **`effectiveOnAsOfDatePredicate`** — one calendar day inside an `effective_from` / `effective_to` bracket (align with [`src/views/mdm-canonical-views.ts`](../views/mdm-canonical-views.ts) where views exist) |
| `query-primitives/scope-matching.ts`           | **`matchesScope`** — pure check that a role assignment’s `scope_type` / `scope_id` covers runtime LE / BU / location (after you load assignments)                                                              |
| `resolve-current-tenant-policy.ts`             | Effective row for **`mdm.tenant_policies`** by domain + key on **`asOfDate`**                                                                                                                                  |
| `resolve-item-settings.ts`                     | **`mdm.item_entity_settings`** with effective dating; fallback **location → business unit → legal entity**; **location tier requires both `locationId` and `businessUnitId`**                                  |
| `resolve-membership-scope.ts`                  | One round-trip: membership + left-joined role assignments and roles; membership lifecycle vs **`asOfDate`**                                                                                                    |
| `__tests__/`                                   | Vitest for **`iso-date-assertions`** and **`scope-matching`** (included in `pnpm run db:guard` in `packages/_database`)                                                                                        |

---

## Resolver usage (short)

### `resolveCurrentTenantPolicy`

Use when behavior is driven by **tenant-configurable rules** (`mdm.tenant_policies`). Semantics match **`v_current_tenant_policies`** in [`mdm-canonical-views.ts`](../views/mdm-canonical-views.ts) (same intent as legacy hardening SQL where applicable).

### `resolveItemSettings`

Use when an item needs **operational / accounting settings** resolved by scope with the fallback above. Nullable-scope uniqueness is enforced in DB via partial uniques (see `sql/hardening/patch_e_nullable_scope_uniqueness.sql`).

### `resolveMembershipScope`

Use for **tenant-aware auth bootstrap**: membership row (if any) plus role assignments + roles. Scope columns align with **`iam.tenant_role_assignments`** and deployed scope / RLS hardening under `sql/hardening/` (e.g. `patch_m_*`, `patch_n_*`).

### Pure helpers

- **`matchesScope`** — after you have assignment rows, test coverage of a runtime LE/BU/location context.
- **`assertIsoDateOnly` / `todayIsoDateUtc`** — call **`assertIsoDateOnly`** at resolver boundaries that accept user-provided dates; invalid input throws before SQL.
- **`effectiveOnAsOfDatePredicate`** — shared “active on this day” filter for policy rows, role assignments, and item settings.

---

## Optional follow-ons (not required on day one)

### Canonical database views

Read models such as `mdm.v_current_tenant_policies` / `mdm.v_effective_item_entity_settings` / `iam.v_effective_role_assignments` can centralize date predicates. **In-repo definitions:** [`src/views/mdm-canonical-views.ts`](../views/mdm-canonical-views.ts); **deployed SQL examples:** `sql/hardening/patch_k_canonical_views.sql`.

### Query result validation

Add Zod (or similar) at API boundaries if you need runtime checks beyond TypeScript types.

### Caching

If you memoize, do it **above** these resolvers with explicit tenant + `asOfDate` (and related scope keys) in the cache key — avoid hidden caches inside resolvers.

### Role precedence

Resolve membership and scopes faithfully first; add ranking or precedence only when product rules require it.

---

## Invariants

- **Server-only:** uses `DatabaseClient` / pool; never import from client bundles.
- **Schema or resolver changes:** run **`pnpm run db:guard`** (or **`db:ci`**) in `packages/_database` after edits.
