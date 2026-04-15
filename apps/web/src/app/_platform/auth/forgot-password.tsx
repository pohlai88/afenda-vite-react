import { type FormEvent, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { Button, Input, Label } from "@afenda/design-system/ui-primitives"

import { authClient, authPasswordResetRedirectUrl } from "."
import { MarketingAuthShell } from "./marketing-auth-shell"

/**
 * Request password reset email (`/forgot-password`). Requires `sendResetPassword` on the API.
 */
export default function ForgotPasswordPage() {
  const { t } = useTranslation("shell")
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const { error: reqError } = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: authPasswordResetRedirectUrl(),
      })
      if (reqError) {
        setError(
          reqError.message?.trim() ||
            t("marketing.forgot_password.error_generic")
        )
        return
      }
      setSubmitted(true)
    } finally {
      setPending(false)
    }
  }

  return (
    <MarketingAuthShell
      description={t("marketing.forgot_password.description")}
      title={t("marketing.forgot_password.title")}
    >
      {submitted ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("marketing.forgot_password.success")}
        </p>
      ) : (
        <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
          <div className="space-y-2">
            <Label htmlFor="forgot-email">
              {t("marketing.forgot_password.email_label")}
            </Label>
            <Input
              autoComplete="email"
              id="forgot-email"
              name="email"
              onChange={(ev) => setEmail(ev.target.value)}
              required
              type="email"
              value={email}
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button
            aria-busy={pending}
            className="w-full"
            disabled={pending}
            type="submit"
          >
            {t("marketing.forgot_password.submit")}
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link
          className="font-medium text-primary underline-offset-4 hover:underline"
          to="/login"
        >
          {t("marketing.forgot_password.back_login")}
        </Link>
      </p>
    </MarketingAuthShell>
  )
}
