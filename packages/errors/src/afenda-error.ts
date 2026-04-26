import type { ErrorDetails, SerializableError } from "./types"

export type AfendaErrorOptions = {
  readonly code: string
  readonly status: number
  readonly details?: ErrorDetails
  readonly cause?: unknown
  readonly isOperational?: boolean
}

export class AfendaError extends Error {
  readonly code: string
  readonly status: number
  readonly details?: ErrorDetails
  readonly isOperational: boolean
  readonly timestamp: Date

  constructor(message: string, options: AfendaErrorOptions) {
    super(
      message,
      options.cause === undefined ? undefined : { cause: options.cause }
    )
    this.name = new.target.name
    this.code = options.code
    this.status = options.status
    this.details = options.details
    this.isOperational = options.isOperational ?? true
    this.timestamp = new Date()
    Error.captureStackTrace?.(this, new.target)
  }

  toJSON(): SerializableError {
    return {
      code: this.code,
      message: this.message,
      status: this.status,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
    }
  }
}

export function isOperationalError(error: unknown): boolean {
  return error instanceof AfendaError && error.isOperational
}
