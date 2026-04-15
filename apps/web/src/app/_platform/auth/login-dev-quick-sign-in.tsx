import { LogIn } from "lucide-react"
import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { Button, Input } from "@afenda/design-system/ui-primitives"

import { authPostLoginPath } from "./auth-redirect-urls"

function devLoginLabel(): string {
  const raw = import.meta.env.VITE_AFENDA_DEV_LOGIN_LABEL?.trim()
  return raw && raw.length > 0 ? raw : "Dev account"
}

function resolveDevLoginFetchError(e: unknown): string {
  if (!(e instanceof Error)) {
    return "Dev sign-in failed (network error)."
  }
  const msg = e.message.toLowerCase()
  if (
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("load failed") ||
    msg.includes("network request failed")
  ) {
    return "Cannot reach the API — start it in another terminal: pnpm --filter @afenda/api dev (Vite proxies /api to localhost:3001 by default)."
  }
  return e.message
}

/**
 * Inline local-dev one-click sign-in (`POST /api/dev/login`). Visible whenever
 * `import.meta.env.DEV` — no extra Vite flag required. Production builds omit this entirely.
 */
export function LoginDevQuickSignIn() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [teamSecret, setTeamSecret] = useState("")
  const navigate = useNavigate()
  const location = useLocation()

  if (!import.meta.env.DEV) {
    return null
  }

  async function onQuickDevLogin() {
    setError(null)
    setPending(true)
    try {
      const headers = new Headers()
      headers.set("Content-Type", "application/json")
      if (teamSecret.trim() !== "") {
        headers.set("X-Afenda-Dev-Login-Secret", teamSecret.trim())
      }
      const res = await fetch("/api/dev/login", {
        method: "POST",
        credentials: "include",
        headers,
        body: "{}",
      })
      if (!res.ok) {
        let message = `Sign-in failed (${res.status})`
        try {
          const data = (await res.json()) as { error?: string }
          if (typeof data?.error === "string" && data.error.length > 0) {
            message = data.error
          }
        } catch {
          // ignore
        }
        if (res.status === 404) {
          message =
            "Dev login route not found — use a non-production API build and see docs/DEV_LOGIN.md."
        }
        setError(message)
        return
      }
      void navigate(authPostLoginPath(location.state), { replace: true })
    } catch (e) {
      setError(resolveDevLoginFetchError(e))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mt-6 space-y-3 border-t border-border pt-6">
      <p className="text-center text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        Local development
      </p>
      <details className="group rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-left">
        <summary className="cursor-pointer list-none text-xs text-muted-foreground marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="underline-offset-2 group-open:underline">
            Optional: team secret (only if API uses AFENDA_DEV_LOGIN_SECRET)
          </span>
        </summary>
        <div className="mt-3">
          <Input
            aria-label="Optional team dev secret for API"
            autoComplete="off"
            className="h-9 font-mono text-sm"
            id="login-dev-team-secret"
            onChange={(ev) => setTeamSecret(ev.target.value)}
            placeholder="Leave empty if not configured"
            type="password"
            value={teamSecret}
          />
        </div>
      </details>
      {error ? (
        <p className="text-center text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        aria-busy={pending}
        className="w-full gap-2"
        disabled={pending}
        onClick={() => void onQuickDevLogin()}
        type="button"
        variant="outline"
      >
        <LogIn aria-hidden className="h-4 w-4 opacity-70" />
        {pending ? "Signing in…" : `One-click sign-in — ${devLoginLabel()}`}
      </Button>
    </div>
  )
}
