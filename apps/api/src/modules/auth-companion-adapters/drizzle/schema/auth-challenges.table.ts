/**
 * Canonical Drizzle definitions live in `@afenda/database` (single migration source).
 * Re-export here so adapter code can import from `./schema/auth-challenges.table.js`
 * without duplicating `pgTable` / enum definitions.
 */
export {
  authChallengeMethodEnum,
  authChallengeStatusEnum,
  authChallenges,
} from "@afenda/database/schema"
