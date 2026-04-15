import { authClient } from "../auth-client"

export type AuthEntryResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly code: string }

type SignUpWithEmailInput = {
  readonly name: string
  readonly email: string
  readonly password: string
  readonly callbackURL: string
}

type RequestPasswordResetInput = {
  readonly email: string
  readonly redirectTo: string
}

type ResetPasswordWithTokenInput = {
  readonly token: string
  readonly newPassword: string
}

function normalizeResultCode(value: string | null | undefined): string {
  const normalized = (value ?? "").trim()
  return normalized.length > 0 ? normalized : "unknown_error"
}

export async function signUpWithEmail(
  input: SignUpWithEmailInput
): Promise<AuthEntryResult> {
  const { error } = await authClient.signUp.email({
    name: input.name.trim(),
    email: input.email.trim(),
    password: input.password,
    callbackURL: input.callbackURL,
  })

  if (error) {
    return {
      ok: false,
      code: normalizeResultCode(error.message),
    }
  }

  return { ok: true }
}

export async function requestPasswordResetEmail(
  input: RequestPasswordResetInput
): Promise<AuthEntryResult> {
  const { error } = await authClient.requestPasswordReset({
    email: input.email.trim(),
    redirectTo: input.redirectTo,
  })

  if (error) {
    return {
      ok: false,
      code: normalizeResultCode(error.message),
    }
  }

  return { ok: true }
}

export async function resetPasswordWithToken(
  input: ResetPasswordWithTokenInput
): Promise<AuthEntryResult> {
  const { error } = await authClient.resetPassword({
    token: input.token,
    newPassword: input.newPassword,
  })

  if (error) {
    return {
      ok: false,
      code: normalizeResultCode(error.message),
    }
  }

  return { ok: true }
}

export { fetchAuthIntelligenceSnapshot } from "./auth-intelligence-service"
export {
  requestAuthChallenge,
  verifyAuthChallengeTicket,
} from "./auth-challenge-service"
export {
  fetchAuthSessionsPayload,
  revokeAuthSession,
} from "./auth-session-service"
export { resolveAuthErrorCode } from "./auth-error-service"
