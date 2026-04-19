/**
 * Canonical JSON envelopes for API responses: success and failure shapes shared with clients.
 * Owns transport-level types only; HTTP status codes are chosen at call sites (routes, middleware).
 * platform · http · contract
 * Upstream: `../contract/envelope`. Downstream: routes, middleware, tests.
 * Side effects: none.
 * Coupling: aligns with global `onError` envelope (`ok`, `error.code`, `error.message`).
 * stable
 * @module lib/response
 * @package @afenda/api
 */
export type { ErrorEnvelope, SuccessEnvelope } from "../contract/envelope.js"
export { failure, success } from "../contract/envelope.js"
