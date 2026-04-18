import { APIError } from "better-auth/api"
import { Resend } from "resend"

/** Stable machine code in {@link APIError} bodies for clients; mapped in the web app. */
export const AFENDA_EMAIL_DELIVERY_FAILED = "AFENDA_EMAIL_DELIVERY_FAILED"

/** User-safe copy returned in API JSON (`error.message`); avoid leaking provider internals. */
export const AFENDA_EMAIL_DELIVERY_FAILED_MESSAGE =
  "Email could not be sent. Try again shortly."

function throwEmailDeliveryApiError(
  reason: "provider" | "unconfigured"
): never {
  const status =
    reason === "unconfigured" ? "SERVICE_UNAVAILABLE" : "BAD_GATEWAY"
  throw new APIError(status, {
    message: AFENDA_EMAIL_DELIVERY_FAILED_MESSAGE,
    code: AFENDA_EMAIL_DELIVERY_FAILED,
  })
}

let resendClient: Resend | null | undefined

function getResend(): Resend | null {
  if (resendClient !== undefined) {
    return resendClient
  }
  const key = process.env.RESEND_API_KEY?.trim()
  if (!key) {
    resendClient = null
    return null
  }
  resendClient = new Resend(key)
  return resendClient
}

/** Test-only: clears the cached Resend client so env can change between cases. */
export function resetResendClientForTests(): void {
  resendClient = undefined
}

function resolveFromEmail(): string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() || "Afenda <onboarding@resend.dev>"
  )
}

function resolveAppName(): string {
  return process.env.AFENDA_AUTH_EMAIL_APP_NAME?.trim() || "Afenda"
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/** Strips query + hash so dev logs never contain tokens. */
export function redactUrlForDevLog(url: string): string {
  try {
    const u = new URL(url)
    return `${u.origin}${u.pathname}`
  } catch {
    const q = url.indexOf("?")
    const h = url.indexOf("#")
    const cut = Math.min(q === -1 ? url.length : q, h === -1 ? url.length : h)
    return url.slice(0, cut)
  }
}

type TransactionalKind =
  | "password_reset"
  | "email_verification"
  | "change_email_confirm"
  | "delete_account"
  | "magic_link"
  | "email_otp"

/**
 * Sends transactional HTML email and propagates failure so Better Auth can return an error response.
 * In non-production, missing `RESEND_API_KEY` logs a redacted line and resolves (local dev).
 */
async function sendTransactionalHtml(input: {
  readonly kind: TransactionalKind
  readonly to: string
  readonly subject: string
  readonly html: string
  /** Used only when Resend is not configured in dev — must not include secrets in query. */
  readonly sensitiveUrlForDevLog: string
}): Promise<void> {
  const resend = getResend()
  if (!resend) {
    if (process.env.NODE_ENV === "production") {
      throwEmailDeliveryApiError("unconfigured")
    }
    console.info(
      `[afenda/auth] (${input.kind}) dev — email not sent (no RESEND_API_KEY). To: ${input.to}. Link: ${redactUrlForDevLog(input.sensitiveUrlForDevLog)}`
    )
    return
  }

  const result = await resend.emails.send({
    from: resolveFromEmail(),
    to: [input.to],
    subject: input.subject,
    html: input.html,
  })

  if (result.error) {
    console.error(`[afenda/auth] Resend (${input.kind}) failed:`, result.error)
    throwEmailDeliveryApiError("provider")
  }
}

export async function sendPasswordResetEmail(input: {
  readonly to: string
  readonly url: string
  readonly userName?: string | null
}): Promise<void> {
  const appName = resolveAppName()
  const greeting = input.userName?.trim()
    ? `Hi ${escapeHtml(input.userName.trim())},`
    : "Hi,"
  const html = `<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
  <p>${greeting}</p>
  <p>We received a request to reset your password for ${escapeHtml(appName)}.</p>
  <p><a href="${escapeHtml(input.url)}" style="color: #2563eb;">Reset your password</a></p>
  <p style="font-size: 12px; color: #666;">If you did not request this, you can ignore this email.</p>
</body>
</html>`.trim()

  await sendTransactionalHtml({
    kind: "password_reset",
    to: input.to,
    subject: `${appName} — reset your password`,
    html,
    sensitiveUrlForDevLog: input.url,
  })
}

/** Sent to the **current** email so the user can approve a pending address change (Better Auth `changeEmail`). */
export async function sendChangeEmailConfirmation(input: {
  readonly to: string
  readonly newEmail: string
  readonly url: string
  readonly userName?: string | null
}): Promise<void> {
  const appName = resolveAppName()
  const greeting = input.userName?.trim()
    ? `Hi ${escapeHtml(input.userName.trim())},`
    : "Hi,"
  const html = `<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
  <p>${greeting}</p>
  <p>Confirm that you want to change your ${escapeHtml(appName)} sign-in email to <strong>${escapeHtml(input.newEmail)}</strong>.</p>
  <p><a href="${escapeHtml(input.url)}" style="color: #2563eb;">Approve email change</a></p>
  <p style="font-size: 12px; color: #666;">If you did not request this change, ignore this email.</p>
</body>
</html>`.trim()

  await sendTransactionalHtml({
    kind: "change_email_confirm",
    to: input.to,
    subject: `${appName} — approve email change`,
    html,
    sensitiveUrlForDevLog: input.url,
  })
}

/** Pre-generated link that completes account deletion when opened (Better Auth `deleteUser`). */
export async function sendDeleteAccountVerificationEmail(input: {
  readonly to: string
  readonly url: string
  readonly userName?: string | null
}): Promise<void> {
  const appName = resolveAppName()
  const greeting = input.userName?.trim()
    ? `Hi ${escapeHtml(input.userName.trim())},`
    : "Hi,"
  const html = `<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
  <p>${greeting}</p>
  <p>You asked to permanently delete your ${escapeHtml(appName)} account.</p>
  <p><a href="${escapeHtml(input.url)}" style="color: #2563eb;">Confirm account deletion</a></p>
  <p style="font-size: 12px; color: #666;">If you did not request this, ignore this email and your account will stay active.</p>
</body>
</html>`.trim()

  await sendTransactionalHtml({
    kind: "delete_account",
    to: input.to,
    subject: `${appName} — confirm account deletion`,
    html,
    sensitiveUrlForDevLog: input.url,
  })
}

export async function sendVerificationEmail(input: {
  readonly to: string
  readonly url: string
  readonly userName?: string | null
}): Promise<void> {
  const appName = resolveAppName()
  const greeting = input.userName?.trim()
    ? `Hi ${escapeHtml(input.userName.trim())},`
    : "Hi,"
  const html = `<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
  <p>${greeting}</p>
  <p>Please confirm your email address for ${escapeHtml(appName)}.</p>
  <p><a href="${escapeHtml(input.url)}" style="color: #2563eb;">Verify your email</a></p>
  <p style="font-size: 12px; color: #666;">If you did not create an account, you can ignore this email.</p>
</body>
</html>`.trim()

  await sendTransactionalHtml({
    kind: "email_verification",
    to: input.to,
    subject: `${appName} — verify your email`,
    html,
    sensitiveUrlForDevLog: input.url,
  })
}

/** Better Auth `magicLink` plugin — passwordless sign-in link ([docs](https://better-auth.com/docs/plugins/magic-link)). */
export async function sendMagicLinkEmail(input: {
  readonly to: string
  readonly url: string
}): Promise<void> {
  const appName = resolveAppName()
  const html = `<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
  <p>Hi,</p>
  <p>We received a request to sign in to ${escapeHtml(appName)} with this email address.</p>
  <p><a href="${escapeHtml(input.url)}" style="color: #2563eb;">Sign in</a></p>
  <p style="font-size: 12px; color: #666;">If you did not request this link, you can ignore this email.</p>
</body>
</html>`.trim()

  await sendTransactionalHtml({
    kind: "magic_link",
    to: input.to,
    subject: `${appName} — your sign-in link`,
    html,
    sensitiveUrlForDevLog: input.url,
  })
}

const otpTypeLabel: Record<
  "sign-in" | "email-verification" | "forget-password" | "change-email",
  string
> = {
  "sign-in": "sign-in",
  "email-verification": "email verification",
  "forget-password": "password reset",
  "change-email": "email change",
}

/** Better Auth `emailOTP` plugin — one-time code ([docs](https://better-auth.com/docs/plugins/email-otp)). */
export async function sendVerificationOtpEmail(input: {
  readonly to: string
  readonly otp: string
  readonly type:
    | "sign-in"
    | "email-verification"
    | "forget-password"
    | "change-email"
}): Promise<void> {
  const appName = resolveAppName()
  const purpose = otpTypeLabel[input.type]
  const html = `<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
  <p>Hi,</p>
  <p>Your ${escapeHtml(purpose)} code for ${escapeHtml(appName)} is:</p>
  <p style="font-size: 1.5rem; font-weight: 600; letter-spacing: 0.2em;">${escapeHtml(input.otp)}</p>
  <p style="font-size: 12px; color: #666;">If you did not request this code, you can ignore this email.</p>
</body>
</html>`.trim()

  await sendTransactionalHtml({
    kind: "email_otp",
    to: input.to,
    subject: `${appName} — your verification code`,
    html,
    sensitiveUrlForDevLog: `otp:${input.type}`,
  })
}
