-- ============================================================
-- Patch A — trigger functions and trigger wiring (enterprise hardening)
-- Raw PostgreSQL; apply after baseline migrations create schemas/tables.
-- Idempotent: drop if exists + create or replace functions.
-- ============================================================

begin;

create schema if not exists governance;

-- ------------------------------------------------------------
-- Trigger functions
-- ------------------------------------------------------------

create or replace function governance.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function governance.bump_version_no()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    new.version_no = old.version_no + 1;
  end if;
  return new;
end;
$$;

-- ------------------------------------------------------------
-- Mutable masters: auditColumns (updated_at + version_no)
-- ------------------------------------------------------------

-- mdm
drop trigger if exists trg_tenants_set_updated_at on mdm.tenants;
create trigger trg_tenants_set_updated_at
before update on mdm.tenants
for each row execute function governance.set_updated_at();

drop trigger if exists trg_tenants_bump_version on mdm.tenants;
create trigger trg_tenants_bump_version
before update on mdm.tenants
for each row execute function governance.bump_version_no();

drop trigger if exists trg_legal_entities_set_updated_at on mdm.legal_entities;
create trigger trg_legal_entities_set_updated_at
before update on mdm.legal_entities
for each row execute function governance.set_updated_at();

drop trigger if exists trg_legal_entities_bump_version on mdm.legal_entities;
create trigger trg_legal_entities_bump_version
before update on mdm.legal_entities
for each row execute function governance.bump_version_no();

drop trigger if exists trg_business_units_set_updated_at on mdm.business_units;
create trigger trg_business_units_set_updated_at
before update on mdm.business_units
for each row execute function governance.set_updated_at();

drop trigger if exists trg_business_units_bump_version on mdm.business_units;
create trigger trg_business_units_bump_version
before update on mdm.business_units
for each row execute function governance.bump_version_no();

drop trigger if exists trg_locations_set_updated_at on mdm.locations;
create trigger trg_locations_set_updated_at
before update on mdm.locations
for each row execute function governance.set_updated_at();

drop trigger if exists trg_locations_bump_version on mdm.locations;
create trigger trg_locations_bump_version
before update on mdm.locations
for each row execute function governance.bump_version_no();

drop trigger if exists trg_parties_set_updated_at on mdm.parties;
create trigger trg_parties_set_updated_at
before update on mdm.parties
for each row execute function governance.set_updated_at();

drop trigger if exists trg_parties_bump_version on mdm.parties;
create trigger trg_parties_bump_version
before update on mdm.parties
for each row execute function governance.bump_version_no();

drop trigger if exists trg_customers_set_updated_at on mdm.customers;
create trigger trg_customers_set_updated_at
before update on mdm.customers
for each row execute function governance.set_updated_at();

drop trigger if exists trg_customers_bump_version on mdm.customers;
create trigger trg_customers_bump_version
before update on mdm.customers
for each row execute function governance.bump_version_no();

drop trigger if exists trg_suppliers_set_updated_at on mdm.suppliers;
create trigger trg_suppliers_set_updated_at
before update on mdm.suppliers
for each row execute function governance.set_updated_at();

drop trigger if exists trg_suppliers_bump_version on mdm.suppliers;
create trigger trg_suppliers_bump_version
before update on mdm.suppliers
for each row execute function governance.bump_version_no();

drop trigger if exists trg_items_set_updated_at on mdm.items;
create trigger trg_items_set_updated_at
before update on mdm.items
for each row execute function governance.set_updated_at();

drop trigger if exists trg_items_bump_version on mdm.items;
create trigger trg_items_bump_version
before update on mdm.items
for each row execute function governance.bump_version_no();

drop trigger if exists trg_item_categories_set_updated_at on mdm.item_categories;
create trigger trg_item_categories_set_updated_at
before update on mdm.item_categories
for each row execute function governance.set_updated_at();

drop trigger if exists trg_item_entity_settings_set_updated_at on mdm.item_entity_settings;
create trigger trg_item_entity_settings_set_updated_at
before update on mdm.item_entity_settings
for each row execute function governance.set_updated_at();

drop trigger if exists trg_item_entity_settings_bump_version on mdm.item_entity_settings;
create trigger trg_item_entity_settings_bump_version
before update on mdm.item_entity_settings
for each row execute function governance.bump_version_no();

drop trigger if exists trg_addresses_set_updated_at on mdm.addresses;
create trigger trg_addresses_set_updated_at
before update on mdm.addresses
for each row execute function governance.set_updated_at();

drop trigger if exists trg_tenant_profiles_set_updated_at on mdm.tenant_profiles;
create trigger trg_tenant_profiles_set_updated_at
before update on mdm.tenant_profiles
for each row execute function governance.set_updated_at();

drop trigger if exists trg_tenant_profiles_bump_version on mdm.tenant_profiles;
create trigger trg_tenant_profiles_bump_version
before update on mdm.tenant_profiles
for each row execute function governance.bump_version_no();

drop trigger if exists trg_tenant_label_overrides_set_updated_at on mdm.tenant_label_overrides;
create trigger trg_tenant_label_overrides_set_updated_at
before update on mdm.tenant_label_overrides
for each row execute function governance.set_updated_at();

drop trigger if exists trg_tenant_label_overrides_bump_version on mdm.tenant_label_overrides;
create trigger trg_tenant_label_overrides_bump_version
before update on mdm.tenant_label_overrides
for each row execute function governance.bump_version_no();

drop trigger if exists trg_tenant_policies_set_updated_at on mdm.tenant_policies;
create trigger trg_tenant_policies_set_updated_at
before update on mdm.tenant_policies
for each row execute function governance.set_updated_at();

drop trigger if exists trg_tenant_policies_bump_version on mdm.tenant_policies;
create trigger trg_tenant_policies_bump_version
before update on mdm.tenant_policies
for each row execute function governance.bump_version_no();

drop trigger if exists trg_org_units_set_updated_at on mdm.org_units;
create trigger trg_org_units_set_updated_at
before update on mdm.org_units
for each row execute function governance.set_updated_at();

drop trigger if exists trg_org_units_bump_version on mdm.org_units;
create trigger trg_org_units_bump_version
before update on mdm.org_units
for each row execute function governance.bump_version_no();

drop trigger if exists trg_document_sequences_set_updated_at on mdm.document_sequences;
create trigger trg_document_sequences_set_updated_at
before update on mdm.document_sequences
for each row execute function governance.set_updated_at();

drop trigger if exists trg_document_sequences_bump_version on mdm.document_sequences;
create trigger trg_document_sequences_bump_version
before update on mdm.document_sequences
for each row execute function governance.bump_version_no();

drop trigger if exists trg_master_aliases_set_updated_at on mdm.master_aliases;
create trigger trg_master_aliases_set_updated_at
before update on mdm.master_aliases
for each row execute function governance.set_updated_at();

drop trigger if exists trg_master_aliases_bump_version on mdm.master_aliases;
create trigger trg_master_aliases_bump_version
before update on mdm.master_aliases
for each row execute function governance.bump_version_no();

drop trigger if exists trg_external_identities_set_updated_at on mdm.external_identities;
create trigger trg_external_identities_set_updated_at
before update on mdm.external_identities
for each row execute function governance.set_updated_at();

drop trigger if exists trg_external_identities_bump_version on mdm.external_identities;
create trigger trg_external_identities_bump_version
before update on mdm.external_identities
for each row execute function governance.bump_version_no();

drop trigger if exists trg_custom_field_definitions_set_updated_at on mdm.custom_field_definitions;
create trigger trg_custom_field_definitions_set_updated_at
before update on mdm.custom_field_definitions
for each row execute function governance.set_updated_at();

drop trigger if exists trg_custom_field_definitions_bump_version on mdm.custom_field_definitions;
create trigger trg_custom_field_definitions_bump_version
before update on mdm.custom_field_definitions
for each row execute function governance.bump_version_no();

drop trigger if exists trg_custom_field_values_set_updated_at on mdm.custom_field_values;
create trigger trg_custom_field_values_set_updated_at
before update on mdm.custom_field_values
for each row execute function governance.set_updated_at();

drop trigger if exists trg_custom_field_values_bump_version on mdm.custom_field_values;
create trigger trg_custom_field_values_bump_version
before update on mdm.custom_field_values
for each row execute function governance.bump_version_no();

drop trigger if exists trg_party_addresses_set_updated_at on mdm.party_addresses;
create trigger trg_party_addresses_set_updated_at
before update on mdm.party_addresses
for each row execute function governance.set_updated_at();

drop trigger if exists trg_party_addresses_bump_version on mdm.party_addresses;
create trigger trg_party_addresses_bump_version
before update on mdm.party_addresses
for each row execute function governance.bump_version_no();

drop trigger if exists trg_tax_registrations_set_updated_at on mdm.tax_registrations;
create trigger trg_tax_registrations_set_updated_at
before update on mdm.tax_registrations
for each row execute function governance.set_updated_at();

drop trigger if exists trg_tax_registrations_bump_version on mdm.tax_registrations;
create trigger trg_tax_registrations_bump_version
before update on mdm.tax_registrations
for each row execute function governance.bump_version_no();

-- iam
drop trigger if exists trg_user_accounts_set_updated_at on iam.user_accounts;
create trigger trg_user_accounts_set_updated_at
before update on iam.user_accounts
for each row execute function governance.set_updated_at();

drop trigger if exists trg_user_accounts_bump_version on iam.user_accounts;
create trigger trg_user_accounts_bump_version
before update on iam.user_accounts
for each row execute function governance.bump_version_no();

drop trigger if exists trg_tenant_memberships_set_updated_at on iam.tenant_memberships;
create trigger trg_tenant_memberships_set_updated_at
before update on iam.tenant_memberships
for each row execute function governance.set_updated_at();

drop trigger if exists trg_tenant_memberships_bump_version on iam.tenant_memberships;
create trigger trg_tenant_memberships_bump_version
before update on iam.tenant_memberships
for each row execute function governance.bump_version_no();

drop trigger if exists trg_persons_set_updated_at on iam.persons;
create trigger trg_persons_set_updated_at
before update on iam.persons
for each row execute function governance.set_updated_at();

drop trigger if exists trg_persons_bump_version on iam.persons;
create trigger trg_persons_bump_version
before update on iam.persons
for each row execute function governance.bump_version_no();

drop trigger if exists trg_user_identities_set_updated_at on iam.user_identities;
create trigger trg_user_identities_set_updated_at
before update on iam.user_identities
for each row execute function governance.set_updated_at();

drop trigger if exists trg_identity_links_set_updated_at on iam.identity_links;
create trigger trg_identity_links_set_updated_at
before update on iam.identity_links
for each row execute function governance.set_updated_at();

drop trigger if exists trg_authority_policies_set_updated_at on iam.authority_policies;
create trigger trg_authority_policies_set_updated_at
before update on iam.authority_policies
for each row execute function governance.set_updated_at();

drop trigger if exists trg_authority_policies_bump_version on iam.authority_policies;
create trigger trg_authority_policies_bump_version
before update on iam.authority_policies
for each row execute function governance.bump_version_no();

drop trigger if exists trg_tenant_roles_set_updated_at on iam.tenant_roles;
create trigger trg_tenant_roles_set_updated_at
before update on iam.tenant_roles
for each row execute function governance.set_updated_at();

drop trigger if exists trg_tenant_roles_bump_version on iam.tenant_roles;
create trigger trg_tenant_roles_bump_version
before update on iam.tenant_roles
for each row execute function governance.bump_version_no();

drop trigger if exists trg_tenant_role_assignments_set_updated_at on iam.tenant_role_assignments;
create trigger trg_tenant_role_assignments_set_updated_at
before update on iam.tenant_role_assignments
for each row execute function governance.set_updated_at();

drop trigger if exists trg_tenant_role_assignments_bump_version on iam.tenant_role_assignments;
create trigger trg_tenant_role_assignments_bump_version
before update on iam.tenant_role_assignments
for each row execute function governance.bump_version_no();

-- finance
drop trigger if exists trg_accounts_set_updated_at on finance.accounts;
create trigger trg_accounts_set_updated_at
before update on finance.accounts
for each row execute function governance.set_updated_at();

drop trigger if exists trg_accounts_bump_version on finance.accounts;
create trigger trg_accounts_bump_version
before update on finance.accounts
for each row execute function governance.bump_version_no();

drop trigger if exists trg_fiscal_calendars_set_updated_at on finance.fiscal_calendars;
create trigger trg_fiscal_calendars_set_updated_at
before update on finance.fiscal_calendars
for each row execute function governance.set_updated_at();

drop trigger if exists trg_fiscal_calendars_bump_version on finance.fiscal_calendars;
create trigger trg_fiscal_calendars_bump_version
before update on finance.fiscal_calendars
for each row execute function governance.bump_version_no();

drop trigger if exists trg_chart_of_account_sets_set_updated_at on finance.chart_of_account_sets;
create trigger trg_chart_of_account_sets_set_updated_at
before update on finance.chart_of_account_sets
for each row execute function governance.set_updated_at();

drop trigger if exists trg_chart_of_account_sets_bump_version on finance.chart_of_account_sets;
create trigger trg_chart_of_account_sets_bump_version
before update on finance.chart_of_account_sets
for each row execute function governance.bump_version_no();

drop trigger if exists trg_legal_entity_coa_assignments_set_updated_at on finance.legal_entity_coa_assignments;
create trigger trg_legal_entity_coa_assignments_set_updated_at
before update on finance.legal_entity_coa_assignments
for each row execute function governance.set_updated_at();

drop trigger if exists trg_legal_entity_coa_assignments_bump_version on finance.legal_entity_coa_assignments;
create trigger trg_legal_entity_coa_assignments_bump_version
before update on finance.legal_entity_coa_assignments
for each row execute function governance.bump_version_no();

drop trigger if exists trg_fiscal_periods_set_updated_at on finance.fiscal_periods;
create trigger trg_fiscal_periods_set_updated_at
before update on finance.fiscal_periods
for each row execute function governance.set_updated_at();

drop trigger if exists trg_fiscal_periods_bump_version on finance.fiscal_periods;
create trigger trg_fiscal_periods_bump_version
before update on finance.fiscal_periods
for each row execute function governance.bump_version_no();

-- governance
drop trigger if exists trg_data_sources_set_updated_at on governance.data_sources;
create trigger trg_data_sources_set_updated_at
before update on governance.data_sources
for each row execute function governance.set_updated_at();

drop trigger if exists trg_data_sources_bump_version on governance.data_sources;
create trigger trg_data_sources_bump_version
before update on governance.data_sources
for each row execute function governance.bump_version_no();

-- ref
drop trigger if exists trg_currencies_set_updated_at on ref.currencies;
create trigger trg_currencies_set_updated_at
before update on ref.currencies
for each row execute function governance.set_updated_at();

drop trigger if exists trg_currencies_bump_version on ref.currencies;
create trigger trg_currencies_bump_version
before update on ref.currencies
for each row execute function governance.bump_version_no();

drop trigger if exists trg_locales_set_updated_at on ref.locales;
create trigger trg_locales_set_updated_at
before update on ref.locales
for each row execute function governance.set_updated_at();

drop trigger if exists trg_locales_bump_version on ref.locales;
create trigger trg_locales_bump_version
before update on ref.locales
for each row execute function governance.bump_version_no();

drop trigger if exists trg_timezones_set_updated_at on ref.timezones;
create trigger trg_timezones_set_updated_at
before update on ref.timezones
for each row execute function governance.set_updated_at();

drop trigger if exists trg_timezones_bump_version on ref.timezones;
create trigger trg_timezones_bump_version
before update on ref.timezones
for each row execute function governance.bump_version_no();

commit;
