import {
  ApiClientHttpError,
  getSharedApiClient,
  resolveApiV1Path,
} from "../../api-client"

import type {
  AuthApiEnvelope,
  AuthApiSuccessEnvelope,
} from "../contracts/auth-api"
import type {
  AuthChallengeMethod,
  AuthChallengeStartPayload,
  AuthChallengeTicket,
  AuthChallengeVerifyPayload,
  AuthChallengeVerifyProof,
} from "../contracts/auth-challenge-ticket"
import { isAuthApiErrorEnvelope } from "../contracts/auth-api"
import { normalizeAuthServiceErrorCode } from "./auth-error-service"

type RequestAuthChallengeInput = {
  readonly email: string
  readonly method: AuthChallengeMethod
}

export type RequestAuthChallengeResult =
  | { readonly ok: true; readonly data: AuthChallengeStartPayload }
  | { readonly ok: false; readonly code: string }

export type VerifyAuthChallengeTicketResult =
  | { readonly ok: true; readonly data: AuthChallengeVerifyPayload }
  | { readonly ok: false; readonly code: string }

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

async function postEnvelope<T>(
  path: string,
  body: Record<string, unknown>
): Promise<AuthApiSuccessEnvelope<T>> {
  const client = getSharedApiClient()
  const payload = await client.post<AuthApiEnvelope<T>>(
    resolveApiV1Path(path),
    body
  )

  if (isAuthApiErrorEnvelope(payload)) {
    throw new Error(payload.error.code)
  }

  return payload
}

export async function requestAuthChallenge(
  input: RequestAuthChallengeInput
): Promise<RequestAuthChallengeResult> {
  try {
    const envelope = await postEnvelope<AuthChallengeStartPayload>(
      "/auth/challenge/start",
      {
        email: input.email.trim(),
        method: input.method,
      }
    )

    return {
      ok: true,
      data: envelope.data,
    }
  } catch (error) {
    return {
      ok: false,
      code: normalizeApiErrorCode(error),
    }
  }
}

function buildVerifyBody(
  ticket: AuthChallengeTicket,
  proof: AuthChallengeVerifyProof
): Record<string, unknown> {
  const challengeId = ticket.challengeId

  if (proof.kind === "passkey") {
    return {
      challengeId,
      method: "passkey",
      credential: proof.credential,
    }
  }

  const code = proof.code.trim()
  return {
    challengeId,
    method: ticket.method,
    proof: { code },
  }
}

export async function verifyAuthChallengeTicket(
  ticket: AuthChallengeTicket,
  proof: AuthChallengeVerifyProof
): Promise<VerifyAuthChallengeTicketResult> {
  try {
    const body = buildVerifyBody(ticket, proof)
    const envelope = await postEnvelope<AuthChallengeVerifyPayload>(
      "/auth/challenge/verify",
      body
    )

    return {
      ok: true,
      data: envelope.data,
    }
  } catch (error) {
    return {
      ok: false,
      code: normalizeApiErrorCode(error),
    }
  }
}
