# SQL hardening (Patch A–N)

Raw PostgreSQL that complements the Drizzle schema (`src/schema/`). Apply **after** baseline DDL exists in the database.

## Recommended split with Drizzle migrations

Keep two layers so reviews stay clear: **schema truth in TypeScript**, **database mechanics in SQL**.

### Migration 0001 — Drizzle baseline

Generate from `drizzle.config.ts` → `src/schema/index.ts` (e.g. `pnpm run db:generate` after `db:guard`):

- PostgreSQL schemas (`pgSchema` namespaces)
- Enums
- Tables (columns, defaults)
- Primary keys, foreign keys, check constraints
- Ordinary / non-hardening indexes you are comfortable owning in Drizzle

This migration should be **reviewable as the logical data model**, without trigger bodies, exclusion constraints, or RLS policy text.

### Migration 0002 — Enterprise hardening (this folder)

Hand-authored **`patch_*.sql`** files (listed below). **Filename letters (a–l) sort alphabetically in the tree, but apply order is not strict A→Z:** `patch_c` is intentionally run **after** partial-unique patches `d`–`g` (see table + `scripts/hardening-patch-order.ts`). Drift is caught by `tsx scripts/verify-hardening-patches.ts` and `src/__tests__/hardening-patches.test.ts`.

| Concern                                                                                                     | Patch files                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trigger functions + row triggers (`updated_at`, `version_no`)                                               | `patch_a_triggers.sql`                                                                                                                                          |
| Generated columns (e.g. normalized search)                                                                  | `patch_b_parties_canonical_name_normalized.sql`                                                                                                                 |
| GIN / trigram search indexes                                                                                | `patch_c_gin_trgm_indexes.sql`                                                                                                                                  |
| Partial unique indexes (soft-delete-aware, etc.)                                                            | `patch_d_partial_unique_indexes.sql`, `patch_e_nullable_scope_uniqueness.sql`, `patch_f_master_aliases_preferred.sql`, `patch_g_document_sequences_default.sql` |
| Temporal overlap (btree_gist + `daterange` + `EXCLUDE`)                                                     | `patch_h_temporal_overlap.sql`                                                                                                                                  |
| Polymorphic validation triggers                                                                             | `patch_i_master_domain_validation.sql`                                                                                                                          |
| Document number allocation function                                                                         | `patch_j_allocate_document_number.sql`                                                                                                                          |
| Canonical views (placeholder; views live in `src/views/` + Drizzle migrations)                              | `patch_k_canonical_views.sql`                                                                                                                                   |
| Row-level security (optional; enable when `app.tenant_id` is always set)                                    | `patch_l_row_level_security.sql`                                                                                                                                |
| Role assignment `scope_id` → MDM entity (tenant / LE / BU / location)                                       | `patch_m_tenant_role_assignment_scope.sql`                                                                                                                      |
| Temporal overlap wave (role assignments unified EXCLUDE, fiscal periods, item `effective_range` idempotent) | `patch_n_temporal_overlap_wave.sql`                                                                                                                             |

**Apply order (canonical list in `scripts/hardening-patch-order.ts`):** `patch_a` → `patch_b` → `patch_d` → `patch_e` → `patch_f` → `patch_g` → `patch_c` → `patch_h` → `patch_i` → `patch_j` → `patch_k` → `patch_l` → `patch_m` → `patch_n`.

- **`patch_c`** runs after partial uniques; it still creates `pg_trgm` idempotently before GIN/trigram indexes.
- **`patch_h`** creates `btree_gist` and temporal `EXCLUDE` constraints.
- **`patch_f` / `patch_g` / parts of `patch_h` / `patch_c`** use `IF EXISTS` / `DO` blocks when a table is not in baseline yet.

**Naming note:** the generated search column on `mdm.parties` is **`canonical_name_normalized`** (see `patch_b`), aligned with Drizzle — not a separate `*_generated` column name.

This separation is **clean and auditable**: 0001 diffs track model changes; 0002 diffs track operational and integrity mechanics.

### Duplicate & legacy guard (before `pnpm run db:generate`)

Use this checklist so **migration 0001** and **hardening** never fight each other:

| Area                                        | Own in Drizzle baseline (0001)                                | Own in hardening (0002)                                                      | Do **not** duplicate                                                                               |
| ------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `mdm.v_*` canonical views                   | `CREATE VIEW` from `src/views/mdm-canonical-views.ts` via Kit | **`patch_k` is intentionally empty** (transaction no-op)                     | Hand-written `CREATE VIEW` in SQL files or a second migration copying the same views               |
| `mdm.parties.canonical_name_normalized`     | Plain column so the table shape exists in TS                  | **`patch_b`** drops plain column and adds `GENERATED … STORED` + btree index | Defining the same column as fully generated in Drizzle _and_ patch_b (see `parties.schema.ts` doc) |
| Trigger bodies (`updated_at`, `version_no`) | Tables/columns only                                           | **`patch_a`**                                                                | `CREATE TRIGGER` in Drizzle migrations                                                             |
| Partial uniques / GIN / `EXCLUDE` / RLS     | Table-level constraints you are comfortable in TS             | **`patch_d`–`patch_n`** as applicable                                        | Re-stating the same index or policy in two places with different predicates                        |
| Old `patch_k` bodies                        | —                                                             | Removed; canonical predicates live in TypeScript                             | Pre-2026 `CREATE VIEW` snippets — see `legacy/README.md` if you need historical reference          |

**Legacy / archive:** optional notes and pointers live under [`legacy/README.md`](./legacy/README.md). Active patches stay only `patch_*.sql` in **this** directory (`verify-hardening-patches.ts` enforces the exact set).

## Applying

Run each `patch_*.sql` in the **order** in `scripts/hardening-patch-order.ts` (not alphabetical by letter alone), via `psql`, your migration runner, or a concatenated migration under `packages/_database/drizzle/` (per your repo’s migration discipline).

`drizzle-kit push` does not apply ad-hoc files under `sql/hardening/` automatically—they are **explicit** follow-up migrations.

**After `patch_b`:** baseline `CREATE VIEW` for `mdm.v_golden_parties` (if it existed) is dropped so the column can be replaced with `GENERATED … STORED`. Recreate that view from the Drizzle source of truth (`src/views/mdm-canonical-views.ts`), e.g. `pnpm run db:push` from `packages/_database` against this database, or a follow-up migration that emits the same `CREATE VIEW` as Kit.

**Patch L (RLS):** policies use `tenant_id = current_setting('app.tenant_id', true)::uuid`. Until the app sets `app.tenant_id` per session (or you use `BYPASSRLS` roles for admin tooling), ordinary roles may see **no rows** on protected tables.

## Team discipline

Canonical rules (tenant_id, composite FKs, partial uniques, temporal integrity, Drizzle vs SQL): [`../docs/practical-discipline.md`](../docs/practical-discipline.md).
