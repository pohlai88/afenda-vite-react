# IAM (`pgSchema("iam")`)

Drizzle tables live under the PostgreSQL schema **`iam`** via `pgSchema("iam")` in [`_schema.ts`](./_schema.ts). Re-exported from [`src/schema/index.ts`](../index.ts). See [Drizzle — PostgreSQL schemas](https://orm.drizzle.team/docs/schemas).

## Tables (by concern)

| Table                     | Role                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `user_accounts`           | Canonical Afenda login row (email/username, locale, lifecycle)                     |
| `user_identities`         | Generic **provider + provider_subject** → `user_accounts`                          |
| `identity_links`          | **Better Auth** ↔ Afenda bridge (`better_auth_user_id`, partial unique on primary) |
| `persons`                 | Human PII profile; optional on memberships                                         |
| `tenant_memberships`      | User ↔ tenant + optional defaults to MDM org scope                                 |
| `tenant_roles`            | Per-tenant role catalog                                                            |
| `tenant_role_assignments` | Membership ↔ role with `scope_type` / `scope_id` + effective dates                 |
| `authority_policies`      | ABAC-style allow/deny rows keyed by role + resource + action                       |
| `auth_challenges`         | Step-up / MFA challenge records (text subjects; no FK to accounts)                 |

## Overlap, duplication, and drift risks

1. **`user_identities` vs `identity_links`** — Both attach external auth identities to `user_accounts`. **`identity_links`** is the path used today for **Better Auth** resolution (`tenancy` + `schema/identity` services). **`user_identities`** is the generic OIDC-style shape but has **no app usage outside relations/tests** yet. **Risk:** two writers or conflicting rows for the same provider unless you define a single canonical table per integration.

2. **`mdm.external_identities`** — **Not** a duplicate of IAM login tables. It maps **business masters** (parties, items, …) to **integration source keys** (`data_sources`). Different bounded context.

3. **`export const users = userAccounts`** — **Legacy alias** in [`user-accounts.schema.ts`](./user-accounts.schema.ts). Prefer `userAccounts` / `UserAccount` types for new code.

4. **`authority_policies` vs `tenant_role_assignments`** — Assignments grant a **role in scope**; policies attach **fine-grained** resource/action rules to a role. **Risk:** encoding the same permission twice (policy rows vs hard-coded checks) — keep one source of truth for authorization.

5. **`auth_challenges`** — **Loosely coupled** (text `subject_user_id` / email). Aligns with pre-login flows; do not assume FK integrity to `user_accounts` in SQL.

## SQL hardening (outside Drizzle source)

- **Role assignment scope / overlap:** `sql/hardening/patch_m_tenant_role_assignment_scope.sql`, `patch_n_temporal_overlap_wave.sql` (see headers on `tenant-role-assignments.schema.ts`).

## Related

- [`docs/practical-discipline.md`](../../../docs/practical-discipline.md) — `src/schema/iam/` charter
- [`docs/guideline/001-postgreSQL-DDL.md`](../../../docs/guideline/001-postgreSQL-DDL.md)
