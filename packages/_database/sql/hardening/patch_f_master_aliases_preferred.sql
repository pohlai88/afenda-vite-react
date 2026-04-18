-- ============================================================
-- Patch F — at most one preferred alias per master / alias type
-- Ensures a single preferred barcode, short name, legacy code, etc. per type.
-- Requires mdm.master_aliases (landed in a future DDL wave).
-- ============================================================

begin;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'mdm'
      and table_name = 'master_aliases'
  ) then
    execute $f$
create unique index if not exists uq_master_aliases_preferred
  on mdm.master_aliases (tenant_id, master_domain, master_id, alias_type)
  where is_preferred = true and is_deleted = false
    $f$;
  end if;
end;
$$;

commit;
