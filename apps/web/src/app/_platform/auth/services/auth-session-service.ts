import {
  ApiClientHttpError,
  getSharedApiClient,
  resolveApiV1Path,
} from "../../runtime"

import type {
  AuthApiEnvelope,
  AuthApiSuccessEnvelope,
} from "../contracts/auth-api"
import type { AuthSessionsPayload } from "../contracts/auth-domain"
import { isAuthApiErrorEnvelope } from "../contracts/auth-api"
import {
  normalizeAuthServiceErrorCode,
  throwAuthServiceError,
} from "./auth-error-service"

function readErrorCodeFromHttpError(error: ApiClientHttpError): string {
  const body = error.body

  if (
    body &&
    typeof body === "object" &&
    "error" in body &&
    (body as { error: unknown }).error &&
    typeof (body as { error: unknown }).error === "object"
  ) {
    const errorObj = (body as { error: { code?: unknown } }).error
    if (typeof errorObj.code === "string" && errorObj.code.length > 0) {
      return errorObj.code
    }
  }

  return `http_${error.status}`
}

function normalizeApiErrorCode(error: unknown): string {
  if (error instanceof ApiClientHttpError) {
    return readErrorCodeFromHttpError(error)
  }

  return normalizeAuthServiceErrorCode(error)
}

async function readEnvelope<T>(
  path: string
): Promise<AuthApiSuccessEnvelope<T>> {
  const client = getSharedApiClient()
  const payload = await client.get<AuthApiEnvelope<T>>(resolveApiV1Path(path))

  if (isAuthApiErrorEnvelope(payload)) {
    throwAuthServiceError(payload.error.code)
  }

  return payload
}

export async function fetchAuthSessionsPayload(): Promise<AuthSessionsPayload> {
  try {
    const envelope = await readEnvelope<AuthSessionsPayload>("/auth/sessions")
    return envelope.data
  } catch (error) {
    throwAuthServiceError(normalizeApiErrorCode(error))
  }
}

export async function revokeAuthSession(sessionId: string): Promise<void> {
  try {
    const client = getSharedApiClient()
    const payload = await client.post<
      AuthApiEnvelope<{ revokedSessionId: string }>
    >(resolveApiV1Path("/auth/sessions/revoke"), { sessionId })

    if (isAuthApiErrorEnvelope(payload)) {
      throwAuthServiceError(payload.error.code)
    }
  } catch (error) {
    throwAuthServiceError(normalizeApiErrorCode(error))
  }
}
