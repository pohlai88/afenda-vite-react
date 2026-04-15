import { authFail, authOk } from "../contracts/auth-api.contract.js"
import { isAuthCompanionError } from "../errors/auth-companion-error.js"

export function toAuthRouteSuccess<T>(data: T, requestId?: string) {
  return {
    status: 200 as const,
    body: authOk(data, requestId),
  }
}

export function toAuthRouteError(error: unknown) {
  if (isAuthCompanionError(error)) {
    return {
      status: error.status,
      body: authFail(error.code, error.message),
    }
  }

  return {
    status: 500,
    body: authFail(
      "auth.internal_error",
      "An unexpected authentication error occurred."
    ),
  }
}
