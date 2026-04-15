export {
  authChallengeMethodEnum,
  authChallengeStatusEnum,
  authChallenges,
} from "./schema/auth-challenges.table.js"
export { createDrizzleAuthChallengeRepo } from "./repo/drizzle-auth-challenge.repo.js"
/** @deprecated Prefer `createPgBetterAuthSessionReader` + pool for Better Auth storage. */
export {
  createDrizzleAuthSessionRepo,
  type DrizzleAuthSessionTableRefs,
} from "./repo/drizzle-auth-session.repo.js"
