/**
 * Canonical application errors: stable machine `code`, HTTP `status`, optional `details`.
 * Transport mapping lives in `middleware/error-handler.ts` via `failure()`.
 * platform · http · errors
 * Upstream: none. Downstream: route handlers throw `AppError`; middleware maps to JSON.
 * Side effects: none.
 * Coupling: `code` strings align with `lib/response` error envelopes.
 * stable
 * @module lib/errors
 * @package @afenda/api
 */

export type AppErrorCode =
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INTERNAL_SERVER_ERROR"

export class AppError extends Error {
  public readonly code: AppErrorCode
  public readonly status: number
  public readonly details?: unknown

  constructor(input: {
    code: AppErrorCode
    message: string
    status: number
    details?: unknown
  }) {
    super(input.message)
    this.name = "AppError"
    this.code = input.code
    this.status = input.status
    this.details = input.details
  }
}

export function badRequest(message: string, details?: unknown): AppError {
  return new AppError({ code: "BAD_REQUEST", message, status: 400, details })
}

export function notFound(message: string, details?: unknown): AppError {
  return new AppError({ code: "NOT_FOUND", message, status: 404, details })
}

export function conflict(message: string, details?: unknown): AppError {
  return new AppError({
    code: "CONFLICT",
    message,
    status: 409,
    details,
  })
}
