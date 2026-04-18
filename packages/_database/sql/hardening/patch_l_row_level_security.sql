-- ============================================================
-- Patch L — row-level security (tenant isolation via session GUC)
-- Optional mechanics layer: apply only when request context reliably sets tenant, e.g.:
--   select set_config('app.tenant_id', '<tenant-uuid>', true);
-- Until then, enabling RLS restricts rows for roles that are not BYPASSRLS.
-- Same intent as a standalone migrations/0003_rls_optional.sql in other repos.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- RLS helper: application must set per session / transaction:
--   select set_config('app.tenant_id', '<tenant-uuid>', true);
-- ------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- mdm.parties
-- ---------------------------------------------------------------------------

alter table mdm.parties enable row level security;

drop policy if exists tenant_isolation_parties on mdm.parties;
create policy tenant_isolation_parties
on mdm.parties
using (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- ---------------------------------------------------------------------------
-- mdm.items
-- ---------------------------------------------------------------------------

alter table mdm.items enable row level security;

drop policy if exists tenant_isolation_items on mdm.items;
create policy tenant_isolation_items
on mdm.items
using (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- ---------------------------------------------------------------------------
-- mdm.legal_entities
-- ---------------------------------------------------------------------------

alter table mdm.legal_entities enable row level security;

drop policy if exists tenant_isolation_legal_entities on mdm.legal_entities;
create policy tenant_isolation_legal_entities
on mdm.legal_entities
using (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- ---------------------------------------------------------------------------
-- mdm.business_units
-- ---------------------------------------------------------------------------

alter table mdm.business_units enable row level security;

drop policy if exists tenant_isolation_business_units on mdm.business_units;
create policy tenant_isolation_business_units
on mdm.business_units
using (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- ---------------------------------------------------------------------------
-- mdm.locations
-- ---------------------------------------------------------------------------

alter table mdm.locations enable row level security;

drop policy if exists tenant_isolation_locations on mdm.locations;
create policy tenant_isolation_locations
on mdm.locations
using (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- ---------------------------------------------------------------------------
-- mdm.org_units
-- ---------------------------------------------------------------------------

alter table mdm.org_units enable row level security;

drop policy if exists tenant_isolation_org_units on mdm.org_units;
create policy tenant_isolation_org_units
on mdm.org_units
using (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- ---------------------------------------------------------------------------
-- mdm.customers
-- ---------------------------------------------------------------------------

alter table mdm.customers enable row level security;

drop policy if exists tenant_isolation_customers on mdm.customers;
create policy tenant_isolation_customers
on mdm.customers
using (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- ---------------------------------------------------------------------------
-- mdm.suppliers
-- ---------------------------------------------------------------------------

alter table mdm.suppliers enable row level security;

drop policy if exists tenant_isolation_suppliers on mdm.suppliers;
create policy tenant_isolation_suppliers
on mdm.suppliers
using (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- ---------------------------------------------------------------------------
-- mdm.item_entity_settings
-- ---------------------------------------------------------------------------

alter table mdm.item_entity_settings enable row level security;

drop policy if exists tenant_isolation_item_entity_settings on mdm.item_entity_settings;
create policy tenant_isolation_item_entity_settings
on mdm.item_entity_settings
using (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- ---------------------------------------------------------------------------
-- mdm.document_sequences
-- ---------------------------------------------------------------------------

alter table mdm.document_sequences enable row level security;

drop policy if exists tenant_isolation_document_sequences on mdm.document_sequences;
create policy tenant_isolation_document_sequences
on mdm.document_sequences
using (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- ---------------------------------------------------------------------------
-- mdm.master_aliases
-- ---------------------------------------------------------------------------

alter table mdm.master_aliases enable row level security;

drop policy if exists tenant_isolation_master_aliases on mdm.master_aliases;
create policy tenant_isolation_master_aliases
on mdm.master_aliases
using (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- ---------------------------------------------------------------------------
-- mdm.external_identities
-- ---------------------------------------------------------------------------

alter table mdm.external_identities enable row level security;

drop policy if exists tenant_isolation_external_identities on mdm.external_identities;
create policy tenant_isolation_external_identities
on mdm.external_identities
using (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- ---------------------------------------------------------------------------
-- mdm.tax_registrations
-- ---------------------------------------------------------------------------

alter table mdm.tax_registrations enable row level security;

drop policy if exists tenant_isolation_tax_registrations on mdm.tax_registrations;
create policy tenant_isolation_tax_registrations
on mdm.tax_registrations
using (tenant_id = current_setting('app.tenant_id', true)::uuid);

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
    execute $p$
alter table mdm.tenant_policies enable row level security;
    $p$;
    execute $p2$
drop policy if exists tenant_isolation_tenant_policies on mdm.tenant_policies;
    $p2$;
    execute $p3$
create policy tenant_isolation_tenant_policies
on mdm.tenant_policies
using (tenant_id = current_setting('app.tenant_id', true)::uuid);
    $p3$;
  end if;
end;
$$;

commit;
