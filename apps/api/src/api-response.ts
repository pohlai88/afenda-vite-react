/**
 * Canonical JSON envelopes for API responses: success and failure shapes shared with clients.
 * Owns transport-level types only; HTTP status codes are chosen at call sites (routes, middleware).
 * platform · http · contract
 * Upstream: `../contract/http-envelope.contract`. Downstream: routes, middleware, tests.
 * Side effects: none.
 * Coupling: aligns with global `onError` envelope (`ok`, `error.code`, `error.message`).
 * stable
 * @module api-response
 * @package @afenda/api
 */
export type {
  ErrorEnvelope,
  SuccessEnvelope,
} from "./contract/http-envelope.contract.js"
export { failure, success } from "./contract/http-envelope.contract.js"
