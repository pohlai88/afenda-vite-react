/**
 * JSON response envelopes for typed Hono RPC + manual `fetch` — mirrors `apps/api/src/contract/envelope.ts` / `lib/response`.
 * Zod validates error bodies from the wire; success payloads stay generic (`data: T`).
 * platform · http · api-client · envelope
 * Upstream: `zod`. Downstream: feature code parsing API JSON.
 * Coupling: keep field names in lockstep with `@afenda/api` `success` / `failure` / `onError`.
 * stable
 * @module api-client/web-envelope
 * @package @afenda/web
 */
import { z } from "zod"

export const webRequestIdSchema = z.string().min(1)

export const webErrorEnvelopeSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
    requestId: webRequestIdSchema.optional(),
  }),
})

export type WebErrorEnvelope = z.infer<typeof webErrorEnvelopeSchema>

export type WebSuccessEnvelope<T> = {
  ok: true
  data: T
  meta?: Record<string, unknown>
}

export function webSuccess<T>(
  data: T,
  meta?: Record<string, unknown>
): WebSuccessEnvelope<T> {
  return meta ? { ok: true, data, meta } : { ok: true, data }
}

export function webFailure(input: {
  code: string
  message: string
  details?: unknown
  requestId?: string
}): WebErrorEnvelope {
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
