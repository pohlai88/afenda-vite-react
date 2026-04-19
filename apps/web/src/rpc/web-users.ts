/**
 * User RPC facade — re-exports `app/_features/hono/users/users.api` under stable names.
 * Prefer importing from `@/rpc` (barrel); do not treat this file as a second public entry from features.
 * @module rpc/web-users
 * @package @afenda/web
 */
export { createUser, fetchUsers } from "../app/_features/hono/users/users.api"
export { createUser as createUserRequest } from "../app/_features/hono/users/users.api"
