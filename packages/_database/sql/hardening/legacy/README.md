# Legacy & archived hardening SQL

This folder is **not** part of the active patch pipeline. `scripts/verify-hardening-patches.ts` only validates `patch_*.sql` files in the parent `sql/hardening/` directory.

## Why this exists

- **Canonical views:** `mdm.v_current_tenant_policies`, `v_golden_parties`, `v_golden_items` are defined as Drizzle `pgView` in `packages/_database/src/views/mdm-canonical-views.ts` and emitted by `drizzle-kit generate`. Older repos may have applied hand-written `CREATE VIEW` from an earlier `patch_k`; **`patch_k_canonical_views.sql` is now an intentional no-op** so new installs do not duplicate view DDL.
- **Historical SQL:** If you need pre–Drizzle-view SQL for forensic or brownfield comparison, use **git history** on `patch_k_canonical_views.sql` rather than maintaining a second copy here (avoids drift from `mdm-canonical-views.ts`).

## What to put here (optional)

- One-off **reference** snippets removed from active patches (clearly labeled, dated).
- **Never** add files that apply automatically alongside `patch_a`–`patch_n` — those belong only as `../patch_*.sql` in the canonical order.
