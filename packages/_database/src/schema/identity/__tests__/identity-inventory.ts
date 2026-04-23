/**
 * Inventory for `src/schema/identity/index.ts` (separate from main `schema/index.ts`).
 * Includes deprecated `users` alias from `iam/user-accounts.schema.ts`.
 */
export const IDENTITY_BARREL_EXPORT_NAMES = [
  "deleteIdentityLinksForBetterAuthUser",
  "ensureIdentityLinkForBetterAuthUser",
  "identityLinks",
  "userIdentities",
  "userAccounts",
  "users",
] as const

export const EXPECTED_IDENTITY_BARREL_EXPORT_COUNT =
  IDENTITY_BARREL_EXPORT_NAMES.length
