import { AfendaError } from "./afenda-error"
import type { AppErrorCode, ErrorDetails } from "./types"

export type AppErrorInput = {
  readonly code: AppErrorCode
  readonly message: string
  readonly status: number
  readonly details?: ErrorDetails
  readonly cause?: unknown
  readonly isOperational?: boolean
}

export class AppError extends AfendaError {
  constructor(input: AppErrorInput) {
    super(input.message, {
      code: input.code,
      status: input.status,
      details: input.details,
      cause: input.cause,
      isOperational: input.isOperational,
    })
    this.name = "AppError"
  }
}

export function badRequest(message: string, details?: ErrorDetails): AppError {
  return new AppError({ code: "BAD_REQUEST", message, status: 400, details })
}

export function notFound(message: string, details?: ErrorDetails): AppError {
  return new AppError({ code: "NOT_FOUND", message, status: 404, details })
}

export function conflict(message: string, details?: ErrorDetails): AppError {
  return new AppError({ code: "CONFLICT", message, status: 409, details })
}

export function unauthorized(
  message = "Unauthorized",
  details?: ErrorDetails
): AppError {
  return new AppError({ code: "UNAUTHORIZED", message, status: 401, details })
}

export function forbidden(
  message = "Forbidden",
  details?: ErrorDetails
): AppError {
  return new AppError({ code: "FORBIDDEN", message, status: 403, details })
}

export function unprocessableEntity(
  message: string,
  details?: ErrorDetails
): AppError {
  return new AppError({
    code: "UNPROCESSABLE_ENTITY",
    message,
    status: 422,
    details,
  })
}

export function tooManyRequests(
  message = "Too many requests",
  details?: ErrorDetails
): AppError {
  return new AppError({
    code: "TOO_MANY_REQUESTS",
    message,
    status: 429,
    details,
  })
}

export function internalServerError(
  message = "An unexpected error occurred.",
  details?: ErrorDetails,
  cause?: unknown
): AppError {
  return new AppError({
    code: "INTERNAL_SERVER_ERROR",
    message,
    status: 500,
    details,
    cause,
    isOperational: false,
  })
}

export function serviceUnavailable(
  message = "Service unavailable",
  details?: ErrorDetails
): AppError {
  return new AppError({
    code: "SERVICE_UNAVAILABLE",
    message,
    status: 503,
    details,
  })
}
