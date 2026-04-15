import { type FormEvent, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

import { Button, Input, Label } from "@afenda/design-system/ui-primitives"

import { authClient } from "."
import { AuthCommandShell } from "./auth-command-shell"
import { useAuthIntelligence } from "./hooks/use-auth-intelligence"
import { IdentityIntelligenceHud } from "./identity-intelligence-hud"
import { SessionContinuityPanel } from "./session-continuity-panel"

/**
 * Set a new password from email link (`/reset-password?token=…`).
 */
export default function ResetPasswordPage() {
  const { t } = useTranslation("shell")
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const queryError = searchParams.get("error")

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const intelligence = useAuthIntelligence()

  const tokenInvalid =
    queryError === "INVALID_TOKEN" || queryError === "invalid_token"

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!token) {
      setError(t("marketing.reset_password.error_token"))
      return
    }
    if (password !== confirm) {
      setError(t("marketing.reset_password.error_mismatch"))
      return
    }
    setPending(true)
    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
        token,
      })
      if (resetError) {
        setError(
          resetError.message?.trim() ||
            t("marketing.reset_password.error_generic")
        )
        return
      }
      void navigate("/login", { replace: true })
    } finally {
      setPending(false)
    }
  }

  const showForm = Boolean(token) && !tokenInvalid

  return (
    <AuthCommandShell
      title={t("marketing.reset_password.title")}
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
          currentStep="challenge"
          challenge={null}
          onResetChallenge={() => undefined}
        />
      }
      footer={
        <>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link
              className="font-medium text-primary underline-offset-4 hover:underline"
              to="/forgot-password"
            >
              {t("marketing.reset_password.request_new_link")}
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            <Link
              className="font-medium text-primary underline-offset-4 hover:underline"
              to="/login"
            >
              {t("marketing.reset_password.back_login")}
            </Link>
          </p>
        </>
      }
    >
      {!showForm ? (
        <p className="text-sm text-destructive" role="alert">
          {t("marketing.reset_password.error_token")}
        </p>
      ) : (
        <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
          <div className="space-y-2">
            <Label htmlFor="reset-password">
              {t("marketing.reset_password.new_password_label")}
            </Label>
            <Input
              autoComplete="new-password"
              id="reset-password"
              name="password"
              minLength={8}
              onChange={(ev) => setPassword(ev.target.value)}
              required
              type="password"
              value={password}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reset-password-confirm">
              {t("marketing.reset_password.confirm_label")}
            </Label>
            <Input
              autoComplete="new-password"
              id="reset-password-confirm"
              name="confirm"
              minLength={8}
              onChange={(ev) => setConfirm(ev.target.value)}
              required
              type="password"
              value={confirm}
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
            {t("marketing.reset_password.submit")}
          </Button>
        </form>
      )}
    </AuthCommandShell>
  )
}
