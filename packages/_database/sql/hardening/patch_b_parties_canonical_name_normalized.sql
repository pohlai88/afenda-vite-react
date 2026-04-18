-- ============================================================
-- Patch B — generated normalized search column for mdm.parties
-- Supports search, dedup, and match-candidate generation (DB truth; not Drizzle-owned).
-- ============================================================
--
-- **Drizzle baseline** (`parties.schema.ts`) declares a plain `canonical_name_normalized`
-- placeholder so the column exists in migrations. This patch **replaces** that column
-- with `GENERATED … STORED` (Drizzle Kit does not own the generated expression).
--
-- Legacy bug avoided: `add column if not exists … generated` never ran when the plain
-- column already existed — the column stayed non-generated. We always drop + add.
-- Idempotent: second run drops generated column and recreates identical definition.
-- ============================================================

begin;

drop index if exists mdm.idx_parties_canonical_name_normalized;

alter table mdm.parties
  drop column if exists canonical_name_normalized;

alter table mdm.parties
  add column canonical_name_normalized text
  generated always as (
    lower(regexp_replace(canonical_name, '\s+', ' ', 'g'))
  ) stored;

create index if not exists idx_parties_canonical_name_normalized
  on mdm.parties (tenant_id, canonical_name_normalized);

commit;
