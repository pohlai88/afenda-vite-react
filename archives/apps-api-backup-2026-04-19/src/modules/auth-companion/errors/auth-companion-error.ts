export class AuthCompanionError extends Error {
  readonly code: string
  readonly status: number

  constructor(code: string, message: string, status = 400) {
    super(message)
    this.name = "AuthCompanionError"
    this.code = code
    this.status = status
  }
}

export function isAuthCompanionError(
  value: unknown
): value is AuthCompanionError {
  return value instanceof AuthCompanionError
}
