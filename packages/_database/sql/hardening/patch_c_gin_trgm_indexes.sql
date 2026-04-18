-- ============================================================
-- Patch C — GIN and trigram indexes (search / fuzzy match / JSON containment)
-- Requires tables and columns from baseline DDL; extension is idempotent.
-- ============================================================

begin;

create extension if not exists pg_trgm;

create index if not exists idx_parties_display_name_trgm
  on mdm.parties using gin (display_name gin_trgm_ops);

create index if not exists idx_parties_canonical_name_trgm
  on mdm.parties using gin (canonical_name gin_trgm_ops);

create index if not exists idx_items_name_trgm
  on mdm.items using gin (item_name gin_trgm_ops);

create index if not exists idx_legal_entities_name_trgm
  on mdm.legal_entities using gin (legal_name gin_trgm_ops);

create index if not exists idx_legal_entities_aliases_gin
  on mdm.legal_entities using gin (aliases);

create index if not exists idx_tenants_aliases_gin
  on mdm.tenants using gin (aliases);

create index if not exists idx_tenants_metadata_gin
  on mdm.tenants using gin (metadata);

create index if not exists idx_parties_aliases_gin
  on mdm.parties using gin (aliases);

create index if not exists idx_parties_metadata_gin
  on mdm.parties using gin (metadata);

create index if not exists idx_items_aliases_gin
  on mdm.items using gin (aliases);

create index if not exists idx_items_metadata_gin
  on mdm.items using gin (metadata);

create index if not exists idx_item_entity_settings_reorder_policy_gin
  on mdm.item_entity_settings using gin (reorder_policy);

-- Landed in a later DDL wave; skip if table is absent.
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'mdm'
      and table_name = 'tenant_policies'
  ) then
    execute $c$
      create index if not exists idx_tenant_policies_value_gin
        on mdm.tenant_policies using gin (policy_value)
    $c$;
  end if;
end;
$$;

commit;
