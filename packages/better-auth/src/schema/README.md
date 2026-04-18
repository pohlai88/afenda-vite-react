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

## Drizzle ORM adapter (upstream vs Afenda)

The [Better Auth Drizzle adapter](https://better-auth.com/docs/adapters/drizzle) documents `drizzleAdapter(db, { provider: "pg", schema })`, optional `usePlural`, field/table renames, and using **drizzle-kit** to generate/apply migrations.

| Topic                   | This monorepo                                                                                                                                                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Runtime `database`      | **`pg.Pool`** in `createAfendaAuth()` — same as the [PostgreSQL adapter](https://better-auth.com/docs/adapters/postgresql), **not** `drizzleAdapter`. There is no `@better-auth/drizzle-adapter` dependency.                                                       |
| Why Drizzle files exist | `auth:generate` passes `--adapter drizzle` so the CLI emits `auth-schema.generated.ts` (`pgTable` + `relations()`). That matches the shape the Drizzle adapter would use and keeps a single source for table definitions alongside `auth:migrate` DDL.             |
| Auth DDL / migrations   | **`auth:migrate`** (Better Auth CLI `migrate`). We do **not** run `drizzle-kit migrate` for Better Auth tables from this package.                                                                                                                                  |
| ERP DDL                 | **`pnpm run db:migrate`** in `@afenda/database` — separate tables/schemas from Better Auth’s `user` / `session` / …                                                                                                                                                |
| Experimental joins      | Drizzle docs stress defining **`relations()`** for the adapter + joins; the generated file includes them. Runtime still uses Kysely via `Pool`, so enabling **`experimental.joins`** follows the PostgreSQL adapter unless you switch runtime to `drizzleAdapter`. |

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

## PostgreSQL adapter (upstream alignment)

This matches [Better Auth’s PostgreSQL adapter](https://better-auth.com/docs/adapters/postgresql):

| Topic                 | Afenda                                                                                                                                                                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Connection            | `pg.Pool` from `createPgPool()` / `DATABASE_URL` (same pool as `apps/api` and Drizzle)                                                                                                                                                       |
| Dialect               | Kysely Postgres under the hood (as in upstream docs)                                                                                                                                                                                         |
| Migrations            | `pnpm --filter @afenda/better-auth run auth:migrate` (see `src/better-auth-cli-config.ts`). App ERP DDL uses `pnpm run db:migrate` in `@afenda/database` — **two** migration entry points, one database.                                     |
| Non-`public` schema   | Optional: add `?options=-c search_path=yourschema` to `DATABASE_URL` (URL-encode spaces and `=` as needed). Create the schema and grants before migrating.                                                                                   |
| Experimental DB joins | [Documented upstream](https://better-auth.com/docs/adapters/postgresql#joins-experimental) for faster session/org reads. Not enabled in `createAfendaAuth` by default; turning it on may require a follow-up `auth:migrate` per Better Auth. |

## Username plugin (not enabled)

The [Better Auth username plugin](https://better-auth.com/docs/plugins/username) adds **`username`** / **`displayUsername`** on Better Auth’s **`user`** table, `signIn.username`, `isUsernameAvailable`, and **`usernameClient`** on the SPA.

| Topic  | Afenda today                                                                                                             |
| ------ | ------------------------------------------------------------------------------------------------------------------------ |
| Server | `username()` is **not** registered in `createAfendaAuth` (`packages/better-auth/src/create-afenda-auth.ts`).             |
| Client | **`usernameClient()`** is **not** in `apps/web` `auth-client.ts`.                                                        |
| Schema | Generated `user` in `auth-schema.generated.ts` has **no** `username` / `displayUsername` columns (matches the above).    |
| IAM    | **`iam.user_accounts.username`** is a separate ERP field (Drizzle under `@afenda/database`), not the Better Auth plugin. |

To adopt the plugin later: add `username()` to `plugins`, run **`auth:migrate`** + **`auth:generate`**, add **`usernameClient()`** beside other client plugins, then wire login/register UI (`signIn.username`, optional `signUp.email` username fields). Consider **`disabledPaths`** for `/is-username-available` if you want to reduce username enumeration.

## Two-factor (2FA) plugin ([upstream](https://better-auth.com/docs/plugins/2fa))

The [Better Auth 2FA plugin](https://better-auth.com/docs/plugins/2fa) adds TOTP/OTP, backup codes, trusted devices, and client APIs under `authClient.twoFactor.*`.

| Topic             | Afenda                                                                                                                                                                                                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Server            | When **`AFENDA_AUTH_MFA_ENABLED=true`**, `createAfendaAuth` registers **`twoFactor({ issuer: … })`** (issuer from **`AFENDA_AUTH_MFA_ISSUER`** or `"Afenda"`). `appName` is already set on `betterAuth`.                                                                         |
| Client            | **`twoFactorClient()`** is loaded when **`VITE_AFENDA_AUTH_MFA_ENABLED`** is `true` (mirrors **`AFENDA_AUTH_MFA_ENABLED`** via `vite.config` `define`, same as other capability flags).                                                                                          |
| Migrations        | With MFA on, run **`pnpm --filter @afenda/better-auth run auth:migrate:plugins`** (or set env and `auth:migrate`) so Better Auth DDL includes 2FA fields/tables.                                                                                                                 |
| Generated Drizzle | The committed **`auth-schema.generated.ts`** is built **without** MFA/passkey unless you regenerate with env set (see passkey/MFA commands above). After enabling MFA in prod, run **`auth:generate`** with **`AFENDA_AUTH_MFA_ENABLED=true`** so the file matches the database. |
| Login UX          | **`apps/web`** handles `twoFactorRedirect` after `signIn.email`: the login flow moves to a **TOTP** step and calls **`authClient.twoFactor.verifyTotp`**. Email OTP (`sendOTP`) is not wired in the UI yet — if the server only returns `otp`, the step shows a clear message.   |

## Email OTP plugin (not enabled)

The [Better Auth Email OTP plugin](https://better-auth.com/docs/plugins/email-otp) adds **`emailOTP()`** on the server with **`sendVerificationOTP({ email, otp, type })`**, **`emailOTPClient()`** on the SPA, and APIs such as **`authClient.emailOtp.sendVerificationOtp`**, **`signIn.emailOtp`**, password-reset OTP, optional **`overrideDefaultEmailVerification`**, and change-email OTP.

| Topic             | Afenda today                                                                                                                                                                                                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Server            | **`emailOTP()`** is **not** registered in `createAfendaAuth`. Email is handled by **Resend** for link-based flows (`sendVerificationEmail`, password reset, change email, delete account, etc. in `afenda-resend-mail.ts`) and optionally **`magicLink()`** when **`AFENDA_AUTH_MAGIC_LINK_ENABLED`**. |
| Client            | **`emailOTPClient()`** is **not** in `apps/web` `auth-client.ts`.                                                                                                                                                                                                                                      |
| Schema / CLI      | Generated schema has **no** Email OTP–specific tables beyond shared **`verification`** — consistent with the plugin not being loaded. Enabling the plugin later requires **`auth:migrate`** + **`auth:generate`** with the same config.                                                                |
| Overlap / product | Adopting Email OTP means implementing **`sendVerificationOTP`** (Resend), choosing **`overrideDefaultEmailVerification`** vs current **link** verification, and building UI for **sign-in OTP**, **forgot-password OTP**, etc. — parallel to existing password + magic-link surfaces.                  |

To adopt later: add **`emailOTP({ async sendVerificationOTP(...) { … } })`**, wire **`emailOTPClient()`** + Vite env mirroring if needed, extend login/forgot-password UX per upstream, then migrate + generate.

## One Tap plugin (opt-in)

The [Better Auth One Tap plugin](https://better-auth.com/docs/plugins/one-tap) adds **`oneTap()`** on the server and **`oneTapClient({ clientId, … })`** on the client so users can sign in with **Google Identity Services** One Tap (`authClient.oneTap()`, optional button mode, FedCM behavior per upstream).

| Topic        | Afenda                                                                                                                                                                                                                                                                                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Server       | When **`AFENDA_AUTH_GOOGLE_ONE_TAP_ENABLED=true`** and **`GOOGLE_CLIENT_ID`** / **`GOOGLE_CLIENT_SECRET`** are set, **`createAfendaAuth`** registers **`oneTap({ clientId: … })`** (same client id as Google OAuth).                                                                                                                                       |
| Client       | **`oneTapClient()`** loads when **`VITE_AFENDA_AUTH_GOOGLE_ONE_TAP_ENABLED`** and **`VITE_GOOGLE_CLIENT_ID`** are set (`vite.config` mirrors `AFENDA_AUTH_GOOGLE_ONE_TAP_ENABLED` and `GOOGLE_CLIENT_ID`). The login identify step calls **`authClient.oneTap({ fetchOptions: { onSuccess: … } })`** so navigation stays in-app (no hard redirect to `/`). |
| Google OAuth | **`signIn.social({ provider: "google" })`** remains the **OAuth redirect** flow; One Tap uses **GIS** — register **Authorized JavaScript origins** for the SPA origin in Google Cloud Console.                                                                                                                                                             |
| Schema       | Endpoint-only; no extra tables vs core OAuth — **`auth:migrate`** / **`auth:generate`** are unchanged for One Tap alone.                                                                                                                                                                                                                                   |

## IAM metadata (`@afenda/database`) — not duplicated here

Afenda application users live under **`iam.user_accounts`**. The bridge from Better Auth → IAM is **`iam.identity_links`** (`better_auth_user_id` → `afenda_user_id`), populated by `ensureIdentityLinkForBetterAuthUser` on **user creation** and lazily again on **session creation** (covers legacy users or failed first bootstrap — see `src/auth-database-audit-hooks.ts`).

There is **no FK** between `public.user` and `iam.user_accounts` by design: IDs are correlated at the application layer via `identity_links`.

For column-level IAM reference, see `packages/_database/src/schema/iam/user-accounts.schema.ts`, `identity-links.schema.ts`, and `tenant-memberships.schema.ts`.
