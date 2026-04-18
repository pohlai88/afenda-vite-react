# Tenancy (`src/schema/tenancy/`)

Barrel + **services** + **Zod** aliases for multi-tenant runtime. **Tables are not defined here** — they live in `iam` (`tenant_memberships`) and `mdm` (`tenants`).

| Item                                                                                       | Role                                                                               |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| [`index.ts`](./index.ts)                                                                   | Re-exports services, `tenancy-boundary.schema.ts`, and IAM/MDM tables              |
| [`tenancy-boundary.schema.ts`](./tenancy-boundary.schema.ts)                               | `tenancy*` Zod validators (aliases over `shared-boundary`) + params/context shapes |
| [`services/resolve-active-tenant-context.ts`](./services/resolve-active-tenant-context.ts) | Active tenant + membership for a Better Auth session                               |
| [`services/resolve-afenda-me-context.ts`](./services/resolve-afenda-me-context.ts)         | “Me” slice: linked user + tenant id list                                           |
| [`services/assert-user-has-tenant-access.ts`](./services/assert-user-has-tenant-access.ts) | Membership check for a tenant id                                                   |

## Related

- [`docs/practical-discipline.md`](../../../docs/practical-discipline.md) — `src/schema/tenancy/` charter
- [`src/schema/identity/`](../identity/README.md) — Better Auth ↔ Afenda link bootstrap
