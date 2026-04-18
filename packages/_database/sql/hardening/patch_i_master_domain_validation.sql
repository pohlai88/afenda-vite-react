-- ============================================================
-- Patch I — polymorphic master reference validation (trigger)
-- FK cannot enforce (master_domain, master_id) → correct table; validate in PL/pgSQL.
-- Applies to mdm.master_aliases, mdm.external_identities, mdm.master_records when present.
-- ============================================================

begin;

create schema if not exists governance;

create or replace function governance.validate_master_domain_reference()
returns trigger
language plpgsql
as $$
declare
  v_exists boolean;
begin
  if new.master_domain = 'party' then
    select exists (
      select 1 from mdm.parties
      where id = new.master_id
        and tenant_id = new.tenant_id
    ) into v_exists;

  elsif new.master_domain = 'item' then
    select exists (
      select 1 from mdm.items
      where id = new.master_id
        and tenant_id = new.tenant_id
    ) into v_exists;

  elsif new.master_domain = 'legal_entity' then
    select exists (
      select 1 from mdm.legal_entities
      where id = new.master_id
        and tenant_id = new.tenant_id
    ) into v_exists;

  elsif new.master_domain = 'business_unit' then
    select exists (
      select 1 from mdm.business_units
      where id = new.master_id
        and tenant_id = new.tenant_id
    ) into v_exists;

  elsif new.master_domain = 'location' then
    select exists (
      select 1 from mdm.locations
      where id = new.master_id
        and tenant_id = new.tenant_id
    ) into v_exists;

  elsif new.master_domain = 'account' then
    select exists (
      select 1 from finance.accounts
      where id = new.master_id
        and tenant_id = new.tenant_id
    ) into v_exists;

  else
    raise exception 'Unsupported master_domain: %', new.master_domain;
  end if;

  if not v_exists then
    raise exception 'Invalid master reference for domain %, tenant %, id %',
      new.master_domain, new.tenant_id, new.master_id;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Trigger wiring (skip if table not yet created)
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'mdm'
      and table_name = 'master_aliases'
  ) then
    execute $a$
drop trigger if exists trg_master_aliases_validate_domain_ref on mdm.master_aliases;
    $a$;
    execute $a2$
create trigger trg_master_aliases_validate_domain_ref
before insert or update on mdm.master_aliases
for each row execute function governance.validate_master_domain_reference();
    $a2$;
  end if;
end;
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'mdm'
      and table_name = 'external_identities'
  ) then
    execute $e$
drop trigger if exists trg_external_identities_validate_domain_ref on mdm.external_identities;
    $e$;
    execute $e2$
create trigger trg_external_identities_validate_domain_ref
before insert or update on mdm.external_identities
for each row execute function governance.validate_master_domain_reference();
    $e2$;
  end if;
end;
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'mdm'
      and table_name = 'master_records'
  ) then
    execute $m$
drop trigger if exists trg_master_records_validate_domain_ref on mdm.master_records;
    $m$;
    execute $m2$
create trigger trg_master_records_validate_domain_ref
before insert or update on mdm.master_records
for each row execute function governance.validate_master_domain_reference();
    $m2$;
  end if;
end;
$$;

commit;
