-- ============================================================
-- Patch E — nullable-scope uniqueness hardening (mdm.item_entity_settings)
-- A single nullable composite unique is insufficient when NULLs are distinct in PostgreSQL.
-- Replaces Drizzle global scope unique with scope-specific partial uniques.
-- Apply the same pattern to other scoped tables with nullable hierarchy columns.
-- ============================================================

begin;

drop index if exists mdm.uq_item_entity_settings_scope;

-- Tenant-level (legal-entity only): no BU, no location
create unique index if not exists uq_item_entity_settings_le_only
  on mdm.item_entity_settings (tenant_id, item_id, legal_entity_id, effective_from)
  where business_unit_id is null
    and location_id is null
    and is_deleted = false;

-- Business-unit level: BU set, no location
create unique index if not exists uq_item_entity_settings_bu
  on mdm.item_entity_settings (tenant_id, item_id, legal_entity_id, business_unit_id, effective_from)
  where business_unit_id is not null
    and location_id is null
    and is_deleted = false;

-- Location level: location set
create unique index if not exists uq_item_entity_settings_location
  on mdm.item_entity_settings (tenant_id, item_id, legal_entity_id, location_id, effective_from)
  where location_id is not null
    and is_deleted = false;

commit;
