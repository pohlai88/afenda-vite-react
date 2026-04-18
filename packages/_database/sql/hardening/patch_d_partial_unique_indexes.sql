-- ============================================================
-- Patch D — partial unique indexes (soft-delete-aware alternates)
-- More correct than plain unique constraints when optional values and soft deletes apply.
-- Apply after baseline DDL. For tenants, replaces any prior global unique on tenant_name.
-- ============================================================

begin;

-- Legal entities: optional identifiers unique among non-deleted rows only
create unique index if not exists uq_legal_entities_registration_active
  on mdm.legal_entities (tenant_id, registration_number)
  where registration_number is not null and is_deleted = false;

create unique index if not exists uq_legal_entities_tax_registration_active
  on mdm.legal_entities (tenant_id, tax_registration_number)
  where tax_registration_number is not null and is_deleted = false;

-- Tenants: display name unique among active (non–soft-deleted) rows
drop index if exists mdm.uq_tenants_name_active;

create unique index if not exists uq_tenants_name_active
  on mdm.tenants (tenant_name)
  where is_deleted = false;

commit;
