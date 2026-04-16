import type { ReactNode } from "react"
import { CheckCircle2, Fingerprint, KeyRound, Orbit } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@afenda/design-system/ui-primitives"

import type { AuthRecommendedMethod } from "../../contracts/auth-domain"

type LoginFlowMethodSurfaceProps = {
  readonly method: AuthRecommendedMethod
  readonly onMethodChange: (next: AuthRecommendedMethod) => void
  readonly children: ReactNode
  readonly receipt?: readonly string[]
}

function methodIcon(method: AuthRecommendedMethod) {
  if (method === "passkey") {
    return Fingerprint
  }
  if (method === "social") {
    return Orbit
  }
  return KeyRound
}

/** Method switcher, primary step panel, and optional continuity receipt for the login flow. */
export function LoginFlowMethodSurface(props: LoginFlowMethodSurfaceProps) {
  const { method, onMethodChange, children, receipt = [] } = props
  const { t } = useTranslation("shell")

  const methods: readonly AuthRecommendedMethod[] = [
    "password",
    "social",
    "passkey",
  ]

  return (
    <div className="ui-stack-relaxed">
      <div className="flex flex-wrap items-center gap-[0.5rem]">
        {methods.map((entry) => {
          const Icon = methodIcon(entry)
          const selected = method === entry
          return (
            <Button
              key={entry}
              aria-pressed={selected}
              className={selected ? "shadow-sm" : undefined}
              type="button"
              variant={selected ? "default" : "outline"}
              onClick={() => onMethodChange(entry)}
            >
              <Icon className="mr-2 size-4" aria-hidden />
              {t(`auth_security.method.${entry}`)}
            </Button>
          )
        })}
      </div>

      <section className="ui-stack-tight rounded-xl border border-border-muted bg-card/55 p-[1rem] sm:p-[1.25rem]">
        {children}
      </section>

      {receipt.length > 0 ? (
        <section className="rounded-xl border border-success/45 bg-success/10 px-4 py-3">
          <p className="mb-2 flex items-center gap-[0.5rem] text-sm font-semibold text-success">
            <CheckCircle2 className="size-4" aria-hidden />
            {t("auth_security.receipt_title")}
          </p>
          <ul className="space-y-1 text-sm text-success">
            {receipt.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
