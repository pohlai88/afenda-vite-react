import {
  ApiClientHttpError,
  getSharedApiClient,
  resolveApiV1Path,
} from "../../runtime"

import type {
  AuthApiEnvelope,
  AuthApiSuccessEnvelope,
} from "../contracts/auth-api"
import { isAuthApiErrorEnvelope } from "../contracts/auth-api"
import {
  normalizeAuthServiceErrorCode,
  throwAuthServiceError,
} from "./auth-error-service"

export interface AuthTenantContextPayload {
  readonly activated: boolean
  readonly authSessionId: string | null
  readonly tenantId: string
  readonly membershipId: string
  readonly afendaUserId: string
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

  return normalizeAuthServiceErrorCode(error)
}

export async function activateAuthTenantContext(
  activeTenantId?: string
): Promise<AuthTenantContextPayload> {
  try {
    const client = getSharedApiClient()
    const payload = await client.post<
      AuthApiEnvelope<AuthTenantContextPayload>
    >(
      resolveApiV1Path("/auth/tenant-context/activate"),
      activeTenantId ? { activeTenantId } : {}
    )

    if (isAuthApiErrorEnvelope(payload)) {
      throwAuthServiceError(payload.error.code)
    }

    return (payload as AuthApiSuccessEnvelope<AuthTenantContextPayload>).data
  } catch (error) {
    throwAuthServiceError(normalizeApiErrorCode(error))
  }
}
