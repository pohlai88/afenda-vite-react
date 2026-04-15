export interface AuthApiMeta {
  readonly timestamp: string
  readonly requestId?: string
}

export interface AuthApiSuccessEnvelope<T> {
  readonly data: T
  readonly meta: AuthApiMeta
}

export interface AuthApiErrorEnvelope {
  readonly error: {
    readonly code: string
    readonly message: string
  }
}

export type AuthApiEnvelope<T> =
  | AuthApiSuccessEnvelope<T>
  | AuthApiErrorEnvelope

export function isAuthApiErrorEnvelope<T>(
  payload: AuthApiEnvelope<T>
): payload is AuthApiErrorEnvelope {
  return "error" in payload
}
