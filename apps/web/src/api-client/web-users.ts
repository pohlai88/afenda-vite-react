/**
 * User RPC facade — re-exports `features/users/users.api` under stable names.
 * Prefer importing from `@/api-client` (barrel); do not treat this file as a second public entry from features.
 * @module api-client/web-users
 * @package @afenda/web
 */
export { createUser, fetchUsers } from "../features/users/users.api"
export { createUser as createUserRequest } from "../features/users/users.api"
