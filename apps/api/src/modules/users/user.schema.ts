/**
 * User contract: transport and service boundary schema; single source of truth for input/output.
 * Schemas live in `contract/user.contract`; this module re-exports for `@afenda/api` module boundaries.
 * module · validation · users
 * Upstream: `../contract/user.contract`. Downstream: user.service, routes/users, Vitest.
 * Side effects: none.
 * Coupling: field names align with future DB columns when added.
 * stable
 * @module modules/users/user.schema
 * @package @afenda/api
 */
export {
  createUserInputSchema,
  userIdSchema,
  userSchema,
  type CreateUserInput,
  type User,
} from "../../contract/user.contract.js"
