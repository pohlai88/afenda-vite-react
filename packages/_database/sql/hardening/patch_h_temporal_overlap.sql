-- ============================================================
-- Patch H — temporal overlap prevention (btree_gist + daterange + EXCLUDE)
-- Generated columns use half-open ranges: [effective_from, effective_to] inclusive of both dates
-- maps to daterange(effective_from, effective_to + 1, '[)').
-- Tables not yet in Drizzle are wrapped in existence checks.
-- ============================================================

begin;

create extension if not exists btree_gist;

-- ---------------------------------------------------------------------------
-- mdm.business_units (same natural key must not have overlapping validity)
-- ---------------------------------------------------------------------------

alter table mdm.business_units
  add column if not exists effective_range daterange
  generated always as (
    daterange(effective_from, coalesce(effective_to + 1, 'infinity'::date), '[)')
  ) stored;

alter table mdm.business_units
  drop constraint if exists ex_business_units_no_overlap;

alter table mdm.business_units
  add constraint ex_business_units_no_overlap
  exclude using gist (
    tenant_id with =,
    legal_entity_id with =,
    bu_code with =,
    effective_range with &&
  )
  where (is_deleted = false);

-- ---------------------------------------------------------------------------
-- mdm.locations
-- ---------------------------------------------------------------------------

alter table mdm.locations
  add column if not exists effective_range daterange
  generated always as (
    daterange(effective_from, coalesce(effective_to + 1, 'infinity'::date), '[)')
  ) stored;

alter table mdm.locations
  drop constraint if exists ex_locations_no_overlap;

alter table mdm.locations
  add constraint ex_locations_no_overlap
  exclude using gist (
    tenant_id with =,
    legal_entity_id with =,
    location_code with =,
    effective_range with &&
  )
  where (is_deleted = false);

-- ---------------------------------------------------------------------------
-- mdm.item_entity_settings (scope-split: NULL-safe hierarchy)
-- ---------------------------------------------------------------------------

alter table mdm.item_entity_settings
  add column if not exists effective_range daterange
  generated always as (
    daterange(effective_from, coalesce(effective_to + 1, 'infinity'::date), '[)')
  ) stored;

alter table mdm.item_entity_settings
  drop constraint if exists ex_item_entity_settings_le_only_no_overlap;

alter table mdm.item_entity_settings
  add constraint ex_item_entity_settings_le_only_no_overlap
  exclude using gist (
    tenant_id with =,
    item_id with =,
    legal_entity_id with =,
    effective_range with &&
  )
  where (
    business_unit_id is null
    and location_id is null
    and is_deleted = false
  );

alter table mdm.item_entity_settings
  drop constraint if exists ex_item_entity_settings_bu_no_overlap;

alter table mdm.item_entity_settings
  add constraint ex_item_entity_settings_bu_no_overlap
  exclude using gist (
    tenant_id with =,
    item_id with =,
    legal_entity_id with =,
    business_unit_id with =,
    effective_range with &&
  )
  where (
    business_unit_id is not null
    and location_id is null
    and is_deleted = false
  );

alter table mdm.item_entity_settings
  drop constraint if exists ex_item_entity_settings_location_no_overlap;

alter table mdm.item_entity_settings
  add constraint ex_item_entity_settings_location_no_overlap
  exclude using gist (
    tenant_id with =,
    item_id with =,
    legal_entity_id with =,
    location_id with =,
    effective_range with &&
  )
  where (
    location_id is not null
    and is_deleted = false
  );

-- ---------------------------------------------------------------------------
-- mdm.tenant_policies (when table exists)
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'mdm'
      and table_name = 'tenant_policies'
  ) then
    execute $tp$
alter table mdm.tenant_policies
  add column if not exists effective_range daterange
  generated always as (
    daterange(effective_from, coalesce(effective_to + 1, 'infinity'::date), '[)')
  ) stored;
    $tp$;
    execute $tp2$
alter table mdm.tenant_policies
  drop constraint if exists ex_tenant_policies_no_overlap;
    $tp2$;
    execute $tp3$
alter table mdm.tenant_policies
  add constraint ex_tenant_policies_no_overlap
  exclude using gist (
    tenant_id with =,
    policy_domain with =,
    policy_key with =,
    effective_range with &&
  )
  where (is_deleted = false);
    $tp3$;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- mdm.party_addresses
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'mdm'
      and table_name = 'party_addresses'
  ) then
    execute $pa$
alter table mdm.party_addresses
  add column if not exists effective_range daterange
  generated always as (
    daterange(effective_from, coalesce(effective_to + 1, 'infinity'::date), '[)')
  ) stored;
    $pa$;
    execute $pa2$
alter table mdm.party_addresses
  drop constraint if exists ex_party_addresses_type_no_overlap;
    $pa2$;
    execute $pa3$
alter table mdm.party_addresses
  add constraint ex_party_addresses_type_no_overlap
  exclude using gist (
    tenant_id with =,
    party_id with =,
    address_type with =,
    effective_range with &&
  )
  where (is_deleted = false);
    $pa3$;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- mdm.tax_registrations
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'mdm'
      and table_name = 'tax_registrations'
  ) then
    execute $tr$
alter table mdm.tax_registrations
  add column if not exists effective_range daterange
  generated always as (
    daterange(effective_from, coalesce(effective_to + 1, 'infinity'::date), '[)')
  ) stored;
    $tr$;
    execute $tr2$
alter table mdm.tax_registrations
  drop constraint if exists ex_tax_registrations_legal_entity_no_overlap;
    $tr2$;
    execute $tr3$
alter table mdm.tax_registrations
  add constraint ex_tax_registrations_legal_entity_no_overlap
  exclude using gist (
    tenant_id with =,
    legal_entity_id with =,
    registration_type with =,
    tax_type_code with =,
    effective_range with &&
  )
  where (legal_entity_id is not null and party_id is null and is_deleted = false);
    $tr3$;
    execute $tr4$
alter table mdm.tax_registrations
  drop constraint if exists ex_tax_registrations_party_no_overlap;
    $tr4$;
    execute $tr5$
alter table mdm.tax_registrations
  add constraint ex_tax_registrations_party_no_overlap
  exclude using gist (
    tenant_id with =,
    party_id with =,
    registration_type with =,
    tax_type_code with =,
    effective_range with &&
  )
  where (legal_entity_id is null and party_id is not null and is_deleted = false);
    $tr5$;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- finance.legal_entity_coa_assignments
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'finance'
      and table_name = 'legal_entity_coa_assignments'
  ) then
    execute $coa$
alter table finance.legal_entity_coa_assignments
  add column if not exists effective_range daterange
  generated always as (
    daterange(effective_from, coalesce(effective_to + 1, 'infinity'::date), '[)')
  ) stored;
    $coa$;
    execute $coa2$
alter table finance.legal_entity_coa_assignments
  drop constraint if exists ex_legal_entity_coa_assignments_same_coa_no_overlap;
    $coa2$;
    execute $coa3$
alter table finance.legal_entity_coa_assignments
  add constraint ex_legal_entity_coa_assignments_same_coa_no_overlap
  exclude using gist (
    tenant_id with =,
    legal_entity_id with =,
    coa_set_id with =,
    effective_range with &&
  )
  where (is_deleted = false);
    $coa3$;
    execute $coa4$
alter table finance.legal_entity_coa_assignments
  drop constraint if exists ex_legal_entity_coa_assignments_primary_no_overlap;
    $coa4$;
    execute $coa5$
alter table finance.legal_entity_coa_assignments
  add constraint ex_legal_entity_coa_assignments_primary_no_overlap
  exclude using gist (
    tenant_id with =,
    legal_entity_id with =,
    effective_range with &&
  )
  where (is_primary = true and is_deleted = false);
    $coa5$;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- iam.tenant_role_assignments (scope_type splits; NULL scope_id cannot bypass)
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
    execute $ra1$
alter table iam.tenant_role_assignments
  drop constraint if exists ex_role_assignments_tenant_scope_no_overlap;
    $ra1$;
    execute $ra2$
alter table iam.tenant_role_assignments
  add constraint ex_role_assignments_tenant_scope_no_overlap
  exclude using gist (
    tenant_id with =,
    tenant_membership_id with =,
    tenant_role_id with =,
    effective_range with &&
  )
  where (scope_type = 'tenant' and is_deleted = false);
    $ra2$;
    execute $ra3$
alter table iam.tenant_role_assignments
  drop constraint if exists ex_role_assignments_legal_entity_scope_no_overlap;
    $ra3$;
    execute $ra4$
alter table iam.tenant_role_assignments
  add constraint ex_role_assignments_legal_entity_scope_no_overlap
  exclude using gist (
    tenant_id with =,
    tenant_membership_id with =,
    tenant_role_id with =,
    scope_id with =,
    effective_range with &&
  )
  where (scope_type = 'legal_entity' and is_deleted = false);
    $ra4$;
    execute $ra5$
alter table iam.tenant_role_assignments
  drop constraint if exists ex_role_assignments_business_unit_scope_no_overlap;
    $ra5$;
    execute $ra6$
alter table iam.tenant_role_assignments
  add constraint ex_role_assignments_business_unit_scope_no_overlap
  exclude using gist (
    tenant_id with =,
    tenant_membership_id with =,
    tenant_role_id with =,
    scope_id with =,
    effective_range with &&
  )
  where (scope_type = 'business_unit' and is_deleted = false);
    $ra6$;
    execute $ra7$
alter table iam.tenant_role_assignments
  drop constraint if exists ex_role_assignments_location_scope_no_overlap;
    $ra7$;
    execute $ra8$
alter table iam.tenant_role_assignments
  add constraint ex_role_assignments_location_scope_no_overlap
  exclude using gist (
    tenant_id with =,
    tenant_membership_id with =,
    tenant_role_id with =,
    scope_id with =,
    effective_range with &&
  )
  where (scope_type = 'location' and is_deleted = false);
    $ra8$;
  end if;
end;
$$;

commit;
