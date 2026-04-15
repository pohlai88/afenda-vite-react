import { type FormEvent, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useLocation, useNavigate } from "react-router-dom"

import { Button, Input, Label } from "@afenda/design-system/ui-primitives"

import { authAppCallbackUrl, authClient, authPostLoginPath } from "."
import { AuthCommandShell } from "./auth-command-shell"
import { useAuthIntelligence } from "./hooks/use-auth-intelligence"
import { IdentityIntelligenceHud } from "./identity-intelligence-hud"
import { SessionContinuityPanel } from "./session-continuity-panel"

/**
 * Email/password sign-up (`/register`) in the auth command-center shell.
 */
export default function RegisterPage() {
  const { t } = useTranslation("shell")
  const navigate = useNavigate()
  const location = useLocation()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const intelligence = useAuthIntelligence()

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const { error: signError } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        callbackURL: authAppCallbackUrl(),
      })
      if (signError) {
        setError(
          signError.message?.trim() || t("marketing.register.error_generic")
        )
        return
      }
      void navigate(authPostLoginPath(location.state), { replace: true })
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthCommandShell
      title={t("marketing.register.title")}
      description={t("auth_security.register_subtitle")}
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
          currentStep="method"
          challenge={null}
          onResetChallenge={() => undefined}
        />
      }
      footer={
        <>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <span>{t("marketing.register.have_account")} </span>
            <Link
              className="font-medium text-primary underline-offset-4 hover:underline"
              to="/login"
            >
              {t("marketing.register.sign_in_link")}
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            <Link
              className="font-medium text-primary underline-offset-4 hover:underline"
              to="/"
            >
              {t("marketing.register.back")}
            </Link>
          </p>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
        <div className="space-y-2">
          <Label htmlFor="register-name">
            {t("marketing.register.name_label")}
          </Label>
          <Input
            autoComplete="name"
            id="register-name"
            name="name"
            onChange={(ev) => setName(ev.target.value)}
            required
            type="text"
            value={name}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-email">
            {t("marketing.register.email_label")}
          </Label>
          <Input
            autoComplete="email"
            id="register-email"
            name="email"
            onChange={(ev) => setEmail(ev.target.value)}
            required
            type="email"
            value={email}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-password">
            {t("marketing.register.password_label")}
          </Label>
          <Input
            autoComplete="new-password"
            id="register-password"
            name="password"
            minLength={8}
            onChange={(ev) => setPassword(ev.target.value)}
            required
            type="password"
            value={password}
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
          {t("marketing.register.submit")}
        </Button>
      </form>
    </AuthCommandShell>
  )
}
