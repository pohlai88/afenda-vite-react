-- ============================================================
-- Patch N — temporal overlap wave (role assignments, fiscal periods, item settings)
-- Run after patch_h (replaces split role-assignment EXCLUDEs with one constraint;
-- adds finance.fiscal_periods overlap; idempotent item_entity_settings effective_range).
-- Requires btree_gist (created in patch_h; repeated here for standalone safety).
-- ============================================================

begin;

create extension if not exists btree_gist;

-- ---------------------------------------------------------------------------
-- A. iam.tenant_role_assignments — unified overlap (replaces patch_h split constraints)
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'iam'
      and table_name = 'tenant_role_assignments'
  ) then
    execute $ra$
alter table iam.tenant_role_assignments
  add column if not exists effective_range daterange
  generated always as (
    daterange(effective_from, coalesce(effective_to + 1, 'infinity'::date), '[)')
  ) stored;
    $ra$;
    execute $ra0$
alter table iam.tenant_role_assignments
  drop constraint if exists ex_role_assignments_tenant_scope_no_overlap;
    $ra0$;
    execute $ra1$
alter table iam.tenant_role_assignments
  drop constraint if exists ex_role_assignments_legal_entity_scope_no_overlap;
    $ra1$;
    execute $ra2$
alter table iam.tenant_role_assignments
  drop constraint if exists ex_role_assignments_business_unit_scope_no_overlap;
    $ra2$;
    execute $ra3$
alter table iam.tenant_role_assignments
  drop constraint if exists ex_role_assignments_location_scope_no_overlap;
    $ra3$;
    execute $ra4$
alter table iam.tenant_role_assignments
  drop constraint if exists ex_role_assignments_no_overlap;
    $ra4$;
    execute $ra5$
alter table iam.tenant_role_assignments
  add constraint ex_role_assignments_no_overlap
  exclude using gist (
    tenant_id with =,
    tenant_membership_id with =,
    tenant_role_id with =,
    scope_type with =,
    scope_id with =,
    effective_range with &&
  )
  where (is_deleted = false);
    $ra5$;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- B. finance.fiscal_periods — no overlapping periods per calendar
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'finance'
      and table_name = 'fiscal_periods'
  ) then
    execute $fp$
alter table finance.fiscal_periods
  add column if not exists period_range daterange
  generated always as (
    daterange(start_date, end_date + 1, '[)')
  ) stored;
    $fp$;
    execute $fp2$
alter table finance.fiscal_periods
  drop constraint if exists ex_fiscal_periods_no_overlap;
    $fp2$;
    execute $fp3$
alter table finance.fiscal_periods
  add constraint ex_fiscal_periods_no_overlap
  exclude using gist (
    fiscal_calendar_id with =,
    period_range with &&
  )
  where (is_deleted = false);
    $fp3$;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- C. mdm.item_entity_settings — ensure generated effective_range (patch_h adds
-- scope-split EXCLUDE constraints; this wave only guarantees the column exists)
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'mdm'
      and table_name = 'item_entity_settings'
  ) then
    execute $ies$
alter table mdm.item_entity_settings
  add column if not exists effective_range daterange
  generated always as (
    daterange(effective_from, coalesce(effective_to + 1, 'infinity'::date), '[)')
  ) stored;
    $ies$;
  end if;
end;
$$;

commit;
