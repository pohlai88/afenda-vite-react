-- ============================================================
-- Patch K — canonical read models (views)
-- ============================================================
--
-- **Views are defined in TypeScript** (`packages/_database/src/views/mdm-canonical-views.ts`)
-- and emitted by `drizzle-kit generate` via `src/schema/index.ts` → avoid duplicating
-- `CREATE VIEW` here (prevents semantic drift vs `pgView` query builders).
--
-- Legacy environments that applied older patch K DDL already have `mdm.v_*` views;
-- new installs rely on Drizzle migrations only. See `legacy/README.md` for archive policy.
--
-- If you must recreate manually (emergency), mirror the predicates in `mdm-canonical-views.ts`.
--
begin;

-- Intentionally empty: canonical views migrated to Drizzle `pgView`.

commit;
