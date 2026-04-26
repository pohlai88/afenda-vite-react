/**
 * Success / error JSON envelopes shared by API routes and `api-response` re-exports.
 * @module contract/http-envelope.contract
 */
export type SuccessEnvelope<T> = {
  ok: true
  data: T
  meta?: Record<string, unknown>
}

export function success<T>(
  data: T,
  meta?: Record<string, unknown>
): SuccessEnvelope<T> {
  return meta ? { ok: true, data, meta } : { ok: true, data }
}

export type ErrorEnvelope = {
  ok: false
  error: {
    code: string
    message: string
    details?: unknown
    requestId?: string
  }
}

export function failure(input: {
  code: string
  message: string
  details?: unknown
  requestId?: string
}): ErrorEnvelope {
  return {
    ok: false,
    error: {
      code: input.code,
      message: input.message,
      details: input.details,
      requestId: input.requestId,
    },
  }
}
