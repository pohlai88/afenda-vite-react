import {
  ApiClientHttpError,
  getSharedApiClient,
  resolveApiV1Path,
} from "../../api-client"

import type {
  AuthApiEnvelope,
  AuthApiSuccessEnvelope,
  AuthChallengeState,
  AuthIntelligenceSnapshot,
  AuthSessionsPayload,
} from "../types/auth-ecosystem"
import { isAuthApiErrorEnvelope } from "../types/auth-ecosystem"

function toUnknownApiError(code: string): Error {
  return new Error(code)
}

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
  if (error instanceof Error) {
    return error.message
  }
  return "unknown_error"
}

async function readEnvelope<T>(
  path: string
): Promise<AuthApiSuccessEnvelope<T>> {
  const client = getSharedApiClient()
  const payload = await client.get<AuthApiEnvelope<T>>(resolveApiV1Path(path))
  if (isAuthApiErrorEnvelope(payload)) {
    throw toUnknownApiError(payload.error.code)
  }
  return payload
}

export async function fetchAuthIntelligenceSnapshot(): Promise<AuthIntelligenceSnapshot> {
  const envelope =
    await readEnvelope<AuthIntelligenceSnapshot>("/auth/intelligence")
  return envelope.data
}

export async function fetchAuthSessionsPayload(): Promise<AuthSessionsPayload> {
  const envelope = await readEnvelope<AuthSessionsPayload>("/auth/sessions")
  return envelope.data
}

export async function revokeAuthSession(sessionId: string): Promise<void> {
  const client = getSharedApiClient()
  const payload = await client.post<
    AuthApiEnvelope<{ revokedSessionId: string }>
  >(resolveApiV1Path("/auth/sessions/revoke"), { sessionId })
  if (isAuthApiErrorEnvelope(payload)) {
    throw toUnknownApiError(payload.error.code)
  }
}

export async function verifyAuthChallenge(
  challenge: AuthChallengeState
): Promise<{
  readonly verified: boolean
  readonly receipt: readonly string[]
}> {
  const client = getSharedApiClient()
  const payload = await client.post<
    AuthApiEnvelope<{
      verified: boolean
      receipt: readonly string[]
    }>
  >(resolveApiV1Path("/auth/challenge/verify"), { ...challenge })
  if (isAuthApiErrorEnvelope(payload)) {
    throw toUnknownApiError(payload.error.code)
  }
  return payload.data
}

export function resolveAuthErrorCode(error: unknown): string {
  return normalizeApiErrorCode(error)
}
