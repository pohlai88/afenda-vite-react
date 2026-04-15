import { type FormEvent, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { Button, Input, Label } from "@afenda/design-system/ui-primitives"

import { authClient, authPasswordResetRedirectUrl } from "."
import { AuthCommandShell } from "./auth-command-shell"
import { useAuthIntelligence } from "./hooks/use-auth-intelligence"
import { IdentityIntelligenceHud } from "./identity-intelligence-hud"
import { SessionContinuityPanel } from "./session-continuity-panel"

/**
 * Request password reset email (`/forgot-password`) in command-center auth shell.
 */
export default function ForgotPasswordPage() {
  const { t } = useTranslation("shell")
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const intelligence = useAuthIntelligence()

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
    <AuthCommandShell
      title={t("marketing.forgot_password.title")}
      description={t("marketing.forgot_password.description")}
      leftPanel={
        <IdentityIntelligenceHud
          snapshot={intelligence.data}
          loading={intelligence.isLoading}
        />
      }
      rightPanel={
        <SessionContinuityPanel
          snapshot={intelligence.data}
          currentMethod="password"
          currentStep="identify"
          challenge={null}
          onResetChallenge={() => undefined}
        />
      }
      footer={
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            className="font-medium text-primary underline-offset-4 hover:underline"
            to="/login"
          >
            {t("marketing.forgot_password.back_login")}
          </Link>
        </p>
      }
    >
      {submitted ? (
        <p
          className="text-sm leading-relaxed text-muted-foreground"
          role="status"
          aria-live="polite"
        >
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
    </AuthCommandShell>
  )
}
