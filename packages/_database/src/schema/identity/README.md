# Identity (`src/schema/identity/`)

This folder is a **barrel + service** surface, **not** a second DDL root.

| Item | Role |
| --- | --- |
| [`index.ts`](./index.ts) | Re-exports IAM tables (`user_accounts`, `identity_links`, `user_identities`) and `ensureIdentityLinkForBetterAuthUser` |
| [`services/ensure-identity-link-for-better-auth-user.ts`](./services/ensure-identity-link-for-better-auth-user.ts) | Better Auth → Afenda link bootstrap (queries/inserts `iam.*` only) |

Canonical table definitions stay under [`src/schema/iam/`](../iam/README.md). New identity **tables** belong in `iam`, not here — see [`docs/practical-discipline.md`](../../../docs/practical-discipline.md).

## Operational note

`ensureIdentityLinkForBetterAuthUser` matches existing accounts by **case-insensitive email** when no link exists yet; ensure product rules align with your auth uniqueness policy (duplicate emails across tenants, etc.).
