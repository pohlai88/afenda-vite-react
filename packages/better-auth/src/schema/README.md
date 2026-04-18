# Better Auth Drizzle schema (`src/schema`)

## What this is

- **`auth-schema.generated.ts`** — Drizzle `pgTable` definitions produced by Better Auth CLI from `src/better-auth-cli-config.ts` (same config as `auth:migrate`).
- **`index.ts`** — Re-exports the generated module for imports such as `@afenda/better-auth/schema`.

Regenerate after changing plugins, `session.additionalFields`, or Better Auth version:

```bash
pnpm --filter @afenda/better-auth run auth:generate
```

To include **passkey** + **twoFactor** tables in the generated file, enable env flags and regenerate:

```bash
set AFENDA_AUTH_PASSKEY_ENABLED=true
set AFENDA_AUTH_MFA_ENABLED=true
pnpm --filter @afenda/better-auth run auth:generate
```

## Database requirements (Better Auth core + organization plugin)

| Table          | Purpose                                                   |
| -------------- | --------------------------------------------------------- |
| `user`         | Better Auth user id (`text` PK)                           |
| `session`      | Sessions + Afenda `activeTenantId` / `activeMembershipId` |
| `account`      | Credentials + OAuth account rows                          |
| `verification` | Email verification / magic links                          |
| `organization` | Organization plugin                                       |
| `member`       | Org membership                                            |
| `invitation`   | Org invitations                                           |

`auth:migrate` applies these in the database configured by `DATABASE_URL`.

## IAM metadata (`@afenda/database`) — not duplicated here

Afenda application users live under **`iam.user_accounts`**. The bridge from Better Auth → IAM is **`iam.identity_links`** (`better_auth_user_id` → `afenda_user_id`), populated by `ensureIdentityLinkForBetterAuthUser` on user creation (see `src/auth-database-audit-hooks.ts`).

There is **no FK** between `public.user` and `iam.user_accounts` by design: IDs are correlated at the application layer via `identity_links`.

For column-level IAM reference, see `packages/_database/src/schema/iam/user-accounts.schema.ts`, `identity-links.schema.ts`, and `tenant-memberships.schema.ts`.
