import { z } from "zod"

export const AuthApiMetaSchema = z.object({
  timestamp: z.string().datetime(),
  requestId: z.string().min(1).optional(),
})

export const AuthApiErrorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
  }),
})

export function makeAuthApiSuccessEnvelopeSchema<T extends z.ZodTypeAny>(
  dataSchema: T
) {
  return z.object({
    data: dataSchema,
    meta: AuthApiMetaSchema,
  })
}

export function authOk<T>(data: T, requestId?: string) {
  return {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...(requestId ? { requestId } : {}),
    },
  }
}

export function authFail(code: string, message: string) {
  return {
    error: {
      code,
      message,
    },
  }
}
