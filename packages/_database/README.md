# Afenda database package

`packages/_database` is the canonical PostgreSQL and Drizzle boundary for Afenda server-side code.

## Pre-MVP contract

This package is intentionally in the **pre-MVP** phase.

It provides:

- pooled PostgreSQL access
- one canonical Drizzle client
- migration generation and verification
- tenant-first identity foundation
- minimal append-only audit support
- Studio snapshot and enum-query support

It does **not** provide ERP schema yet.

Out of scope in pre-MVP:

- legal entities
- business units
- locations
- org units
- roles / permissions / scoped authorities
- customer / supplier / product / finance masters
- ERP transaction tables

## Runtime schema

The active schema surface is limited to:

- `users`
- `user_identities`
- `identity_links`
- `tenants`
- `tenant_memberships`
- `auth_challenges`
- `audit_logs`

## Public package surface

Use:

- `@afenda/database`
- `@afenda/database/schema`
- `@afenda/database/tenancy`
- `@afenda/database/audit`
- `@afenda/database/governance`
- `@afenda/database/studio`
- `@afenda/database/studio/snapshots`

Do not use:

- `@afenda/database/authorization`
- deep imports into `packages/_database/src/*`

## Scripts

- `pnpm --filter @afenda/database typecheck`
- `pnpm --filter @afenda/database test:run`
- `pnpm --filter @afenda/database db:generate`
- `pnpm --filter @afenda/database db:check-migrations`
- `pnpm --filter @afenda/database db:verify-migrations-sync`

Use `db:push` only for disposable local databases. Reviewed migrations remain the contract.
