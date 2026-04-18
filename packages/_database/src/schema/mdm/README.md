# MDM (`pgSchema("mdm")`)

Drizzle DDL for **master data** and tenant/org graph under the PostgreSQL schema **`mdm`**, via `pgSchema("mdm")` in [`_schema.ts`](./_schema.ts). Re-exported from [`src/schema/index.ts`](../index.ts). See [Drizzle — PostgreSQL schemas](https://orm.drizzle.team/docs/schemas).

## Layout (by area)

| Area | Tables |
| --- | --- |
| Tenant root | `tenants`, `tenant_profiles`, `tenant_policies`, `tenant_label_overrides` |
| Party / commercial | `parties`, `customers`, `suppliers`, `party_addresses`, `tax_registrations`, `master_aliases`, `external_identities` |
| Items | `items`, `item_categories`, `item_entity_settings` |
| Org / geo | `legal_entities`, `business_units`, `locations`, `org_units`, `addresses` |
| EAV | `custom_field_definitions`, `custom_field_values` |
| Sequences | `document_sequences` |

[`mdm-boundary.schema.ts`](./mdm-boundary.schema.ts) holds **Zod** insert DTOs (not SQL).

## Related

- [`docs/practical-discipline.md`](../../../docs/practical-discipline.md) — `src/schema/mdm/` charter
- [`docs/guideline/001-postgreSQL-DDL.md`](../../../docs/guideline/001-postgreSQL-DDL.md)
- [`sql/hardening/`](../../../sql/hardening/README.md) — patches referenced from individual `*.schema.ts` headers
