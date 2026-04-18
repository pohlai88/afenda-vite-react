-- ============================================================
-- Patch M — scope target validation for iam.tenant_role_assignments
-- CHECK constraints enforce null/non-null shape; this trigger enforces that
-- scope_id references a row in the MDM table implied by scope_type (same tenant).
-- Pattern: governance.validate_master_domain_reference() in patch_i_master_domain_validation.sql
-- ============================================================

begin;

create schema if not exists governance;

create or replace function governance.validate_tenant_role_assignment_scope()
returns trigger
language plpgsql
as $$
begin
  if new.scope_type = 'tenant' then
    if new.scope_id is not null then
      raise exception 'tenant scope requires null scope_id';
    end if;
    return new;
  end if;

  if new.scope_id is null then
    raise exception 'scope_id required for scope_type %', new.scope_type;
  end if;

  if new.scope_type = 'legal_entity' then
    if not exists (
      select 1
      from mdm.legal_entities le
      where le.id = new.scope_id
        and le.tenant_id = new.tenant_id
    ) then
      raise exception 'Invalid legal_entity scope_id for tenant %', new.tenant_id;
    end if;

  elsif new.scope_type = 'business_unit' then
    if not exists (
      select 1
      from mdm.business_units bu
      where bu.id = new.scope_id
        and bu.tenant_id = new.tenant_id
    ) then
      raise exception 'Invalid business_unit scope_id for tenant %', new.tenant_id;
    end if;

  elsif new.scope_type = 'location' then
    if not exists (
      select 1
      from mdm.locations loc
      where loc.id = new.scope_id
        and loc.tenant_id = new.tenant_id
    ) then
      raise exception 'Invalid location scope_id for tenant %', new.tenant_id;
    end if;

  else
    raise exception 'Unsupported scope_type: %', new.scope_type;
  end if;

  return new;
end;
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'iam'
      and table_name = 'tenant_role_assignments'
  ) then
    execute $t$
drop trigger if exists trg_tenant_role_assignments_validate_scope on iam.tenant_role_assignments;
    $t$;
    execute $t2$
create trigger trg_tenant_role_assignments_validate_scope
before insert or update on iam.tenant_role_assignments
for each row execute function governance.validate_tenant_role_assignment_scope();
    $t2$;
  end if;
end;
$$;

commit;
