import { type FormEvent, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"

import { Button, Input, Label } from "@afenda/design-system/ui-primitives"

import { authAppCallbackUrl, authClient } from "."
import { MarketingAuthShell } from "./marketing-auth-shell"

/**
 * Email/password sign-up (`/register`). Same-origin `/api` proxy to Better Auth.
 */
export default function RegisterPage() {
  const { t } = useTranslation("shell")
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

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
      void navigate("/app", { replace: true })
    } finally {
      setPending(false)
    }
  }

  return (
    <MarketingAuthShell title={t("marketing.register.title")}>
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
    </MarketingAuthShell>
  )
}
