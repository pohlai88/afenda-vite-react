import { type FormEvent, useEffect, useReducer, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom"

import {
  Button,
  Input,
  Label,
  Separator,
} from "@afenda/design-system/ui-primitives"

import { authAppCallbackUrl, authClient, authPostLoginPath } from "."
import { AuthChallengeCanvas } from "./auth-challenge-canvas"
import { AuthCommandShell } from "./auth-command-shell"
import { useAuthIntelligence } from "./hooks/use-auth-intelligence"
import { IdentityIntelligenceHud } from "./identity-intelligence-hud"
import { LoginDevQuickSignIn } from "./login-dev-quick-sign-in"
import { SessionContinuityPanel } from "./session-continuity-panel"
import {
  authFlowQueryToString,
  authFlowReducer,
  authFlowStateToQuery,
  createInitialAuthFlowState,
} from "./services/auth-flow-orchestrator"
import {
  resolveAuthErrorCode,
  verifyAuthChallenge,
} from "./services/auth-ecosystem-service"
import type {
  AuthChallengeState,
  AuthRecommendedMethod,
} from "./types/auth-ecosystem"

function buildPasskeyChallenge(): AuthChallengeState {
  return {
    challengeId: `pk_${Date.now().toString(36)}`,
    type: "passkey_assertion",
    expiresAt: new Date(Date.now() + 120_000).toISOString(),
    attemptsRemaining: 3,
  }
}

function mapAuthErrorCodeToMessage(code: string, fallback: string): string {
  if (code === "auth.challenge.invalid" || code === "auth.challenge.mismatch") {
    return "Challenge verification failed. Try another method."
  }
  if (code === "http_401") {
    return "Authentication required for this action."
  }
  if (code.startsWith("http_")) {
    return "Service temporarily unavailable. Try again shortly."
  }
  return fallback
}

/**
 * Adaptive command-center sign-in (`/login`) with orchestrated challenge flow.
 */
export default function LoginPage() {
  const { t } = useTranslation("shell")
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [socialPending, setSocialPending] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [completionTarget, setCompletionTarget] = useState<string | null>(null)
  const intelligence = useAuthIntelligence()

  const [flowState, dispatch] = useReducer(
    authFlowReducer,
    createInitialAuthFlowState({
      step: searchParams.get("step"),
      email: searchParams.get("email"),
      method: searchParams.get("method"),
      challenge: searchParams.get("challenge"),
    })
  )

  useEffect(() => {
    const next = authFlowStateToQuery(flowState)
    const nextString = authFlowQueryToString(next)
    const current = searchParams.toString()
    if (nextString !== current) {
      setSearchParams(next, { replace: true })
    }
  }, [flowState, searchParams, setSearchParams])

  useEffect(() => {
    if (flowState.step !== "complete" || completionTarget === null) {
      return
    }
    const id = window.setTimeout(() => {
      void navigate(completionTarget, { replace: true })
    }, 900)
    return () => window.clearTimeout(id)
  }, [completionTarget, flowState.step, navigate])

  function markCompleted() {
    dispatch({
      type: "complete",
      receipt: [
        "Identity proof matched active credentials.",
        "Session cookie rotated with secure transport.",
        "Risk checks evaluated for current device posture.",
      ],
    })
    setCompletionTarget(authPostLoginPath(location.state))
  }

  async function onSubmitPassword(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setStatusMessage(null)
    setPending(true)
    try {
      const { error: signError } = await authClient.signIn.email({
        email: flowState.email,
        password,
      })
      if (signError) {
        setError(
          signError.message?.trim() || t("marketing.login.error_generic")
        )
        return
      }
      setStatusMessage(t("auth_security.receipt_generating"))
      markCompleted()
    } finally {
      setPending(false)
    }
  }

  async function signInWithProvider(provider: "google" | "github") {
    setError(null)
    setStatusMessage(null)
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

  async function onVerifyChallenge() {
    if (!flowState.challenge) {
      return
    }
    setError(null)
    setPending(true)
    setStatusMessage(t("auth_security.challenge_verifying"))
    try {
      const verification = await verifyAuthChallenge(flowState.challenge)
      if (!verification.verified) {
        setError(t("marketing.login.error_generic"))
        return
      }
      dispatch({ type: "complete", receipt: verification.receipt })
      setCompletionTarget(authPostLoginPath(location.state))
    } catch (err) {
      const code = resolveAuthErrorCode(err)
      setError(
        mapAuthErrorCodeToMessage(code, t("marketing.login.error_generic"))
      )
    } finally {
      setPending(false)
    }
  }

  function onContinueIdentification(e: FormEvent) {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const data = new FormData(form)
    const email = String(data.get("email") ?? "").trim()
    if (email.length === 0) {
      return
    }
    dispatch({
      type: "identify-submitted",
      email,
      method: intelligence.data.recommendedMethod,
    })
  }

  function onMethodChange(next: AuthRecommendedMethod) {
    setError(null)
    setStatusMessage(null)
    if (next === "passkey") {
      dispatch({
        type: "challenge-started",
        challenge: buildPasskeyChallenge(),
      })
      dispatch({ type: "method-selected", method: next })
      return
    }
    dispatch({ type: "challenge-cleared" })
    dispatch({ type: "method-selected", method: next })
  }

  const centerView = (() => {
    if (flowState.step === "identify") {
      return (
        <form className="space-y-4" onSubmit={onContinueIdentification}>
          <div className="space-y-2">
            <Label htmlFor="login-identify-email">
              {t("marketing.login.email_label")}
            </Label>
            <Input
              autoComplete="email"
              id="login-identify-email"
              name="email"
              required
              type="email"
              defaultValue={flowState.email}
            />
          </div>
          <Button className="w-full" type="submit">
            {t("auth_security.identify_continue")}
          </Button>
        </form>
      )
    }

    if (flowState.step === "challenge" && flowState.method === "passkey") {
      return (
        <AuthChallengeCanvas
          method={flowState.method}
          onMethodChange={onMethodChange}
          receipt={flowState.receipt}
        >
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {intelligence.data.passkeyAvailable
                ? t("auth_security.passkey_prompt")
                : t("auth_security.passkey_not_ready")}
            </p>
            <Button
              type="button"
              className="w-full"
              disabled={pending || !intelligence.data.passkeyAvailable}
              onClick={() => void onVerifyChallenge()}
            >
              {t("auth_security.passkey_action")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => dispatch({ type: "challenge-cleared" })}
            >
              {t("auth_security.challenge_use_another")}
            </Button>
          </div>
        </AuthChallengeCanvas>
      )
    }

    if (flowState.step === "complete") {
      return (
        <AuthChallengeCanvas
          method={flowState.method}
          onMethodChange={onMethodChange}
          receipt={flowState.receipt}
        >
          <p className="text-sm text-muted-foreground">
            {t("auth_security.redirecting")}
          </p>
        </AuthChallengeCanvas>
      )
    }

    return (
      <AuthChallengeCanvas
        method={flowState.method}
        onMethodChange={onMethodChange}
        receipt={flowState.receipt}
      >
        {flowState.method === "password" ? (
          <form
            className="space-y-4"
            onSubmit={(e) => void onSubmitPassword(e)}
          >
            <div className="space-y-2">
              <Label htmlFor="login-password">
                {t("marketing.login.password_label")}
              </Label>
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
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-muted-foreground">{flowState.email}</span>
              <Link
                className="text-primary underline-offset-4 hover:underline"
                to="/forgot-password"
              >
                {t("marketing.login.forgot_password")}
              </Link>
            </div>
            <Button
              aria-busy={pending}
              className="w-full"
              disabled={pending || socialPending !== null}
              type="submit"
            >
              {t("marketing.login.submit")}
            </Button>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t("auth_security.social_prompt")}
            </p>
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
        )}
      </AuthChallengeCanvas>
    )
  })()

  return (
    <AuthCommandShell
      title={t("marketing.login.title")}
      description={t("auth_security.shell_subtitle")}
      leftPanel={
        <IdentityIntelligenceHud
          snapshot={intelligence.data}
          loading={intelligence.isLoading}
        />
      }
      rightPanel={
        <SessionContinuityPanel
          snapshot={intelligence.data}
          currentMethod={flowState.method}
          currentStep={flowState.step}
          challenge={flowState.challenge}
          onResetChallenge={() => dispatch({ type: "challenge-cleared" })}
        />
      }
      footer={
        <>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          {statusMessage ? (
            <p
              className="text-sm text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              {statusMessage}
            </p>
          ) : null}

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

          <LoginDevQuickSignIn />

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
        </>
      }
    >
      {centerView}
    </AuthCommandShell>
  )
}
