import { type FormEvent, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"

import {
  Button,
  Input,
  Label,
  Separator,
} from "@afenda/design-system/ui-primitives"

import { authAppCallbackUrl, authClient } from "."
import { MarketingAuthShell } from "./marketing-auth-shell"

/**
 * Email/password sign-in (`/login`). Same-origin `/api` proxy to Better Auth.
 */
export default function LoginPage() {
  const { t } = useTranslation("shell")
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [socialPending, setSocialPending] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const { error: signError } = await authClient.signIn.email({
        email,
        password,
      })
      if (signError) {
        setError(
          signError.message?.trim() || t("marketing.login.error_generic")
        )
        return
      }
      void navigate("/app", { replace: true })
    } finally {
      setPending(false)
    }
  }

  async function signInWithProvider(provider: "google" | "github") {
    setError(null)
    setSocialPending(provider)
    try {
      const { error: socialError } = await authClient.signIn.social({
        provider,
        callbackURL: authAppCallbackUrl(),
      })
      if (socialError) {
        setError(
          socialError.message?.trim() || t("marketing.login.error_generic")
        )
      }
    } finally {
      setSocialPending(null)
    }
  }

  return (
    <MarketingAuthShell title={t("marketing.login.title")}>
      <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
        <div className="space-y-2">
          <Label htmlFor="login-email">
            {t("marketing.login.email_label")}
          </Label>
          <Input
            autoComplete="email"
            id="login-email"
            name="email"
            onChange={(ev) => setEmail(ev.target.value)}
            required
            type="email"
            value={email}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="login-password">
              {t("marketing.login.password_label")}
            </Label>
            <Link
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
              to="/forgot-password"
            >
              {t("marketing.login.forgot_password")}
            </Link>
          </div>
          <Input
            autoComplete="current-password"
            id="login-password"
            name="password"
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
          disabled={pending || socialPending !== null}
          type="submit"
        >
          {t("marketing.login.submit")}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            {t("marketing.login.divider")}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          aria-busy={socialPending === "google"}
          className="w-full"
          disabled={pending || socialPending !== null}
          onClick={() => void signInWithProvider("google")}
          type="button"
          variant="outline"
        >
          {t("marketing.login.google")}
        </Button>
        <Button
          aria-busy={socialPending === "github"}
          className="w-full"
          disabled={pending || socialPending !== null}
          onClick={() => void signInWithProvider("github")}
          type="button"
          variant="outline"
        >
          {t("marketing.login.github")}
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <span>{t("marketing.login.no_account")} </span>
        <Link
          className="font-medium text-primary underline-offset-4 hover:underline"
          to="/register"
        >
          {t("marketing.login.register_link")}
        </Link>
      </p>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        <Link
          className="font-medium text-primary underline-offset-4 hover:underline"
          to="/"
        >
          {t("marketing.login.back")}
        </Link>
      </p>
    </MarketingAuthShell>
  )
}
