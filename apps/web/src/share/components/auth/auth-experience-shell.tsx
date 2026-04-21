import type { AuthView } from "@better-auth-ui/react/core"
import { useAuth } from "@better-auth-ui/react"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  Fingerprint,
  KeyRound,
  LifeBuoy,
  LogOut,
  MailCheck,
  ShieldCheck,
  UserRoundPlus,
} from "lucide-react"

import { Badge } from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

type AuthExperienceShellProps = {
  readonly children: ReactNode
  readonly view: AuthView
  readonly className?: string
}

const VIEW_COPY_KEY = {
  signIn: "signIn",
  signUp: "signUp",
  magicLink: "magicLink",
  forgotPassword: "forgotPassword",
  resetPassword: "resetPassword",
  signOut: "signOut",
} as const satisfies Record<AuthView, string>

type AuthExperienceViewKey = (typeof VIEW_COPY_KEY)[keyof typeof VIEW_COPY_KEY]

type AuthExperienceTopic = {
  readonly key: string
  readonly Icon: LucideIcon
}

const VIEW_TOPICS = {
  signIn: [
    { key: "approved", Icon: ShieldCheck },
    { key: "return", Icon: ArrowRight },
  ],
  signUp: [
    { key: "primary", Icon: UserRoundPlus },
    { key: "recovery", Icon: Fingerprint },
  ],
  magicLink: [
    { key: "inbox", Icon: MailCheck },
    { key: "fallback", Icon: KeyRound },
  ],
  forgotPassword: [
    { key: "start", Icon: LifeBuoy },
    { key: "resume", Icon: ArrowRight },
  ],
  resetPassword: [
    { key: "replace", Icon: KeyRound },
    { key: "reentry", Icon: ArrowRight },
  ],
  signOut: [
    { key: "close", Icon: LogOut },
    { key: "return", Icon: ShieldCheck },
  ],
} as const satisfies Record<AuthView, readonly AuthExperienceTopic[]>

export function AuthExperienceShell(props: AuthExperienceShellProps) {
  const { children, view, className } = props
  const { localization, magicLink, passkey, socialProviders } = useAuth()
  const { t } = useTranslation("auth", { keyPrefix: "experience" })
  const text = (key: string) => String(t(key as never))

  const methodLabels = [
    localization.auth.password,
    ...(passkey ? [localization.auth.passkey] : []),
    ...(magicLink ? [localization.auth.magicLink] : []),
    ...(socialProviders?.length ? [t("shared.social")] : []),
  ]

  const copyKey = VIEW_COPY_KEY[view] as AuthExperienceViewKey
  const topics = VIEW_TOPICS[view]

  return (
    <main className={cn("auth-shell", className)}>
      <div aria-hidden="true" className="auth-shell-backplane" />

      <div className="auth-shell-grid">
        <section className="auth-shell-intro">
          <div className="auth-shell-intro-stack">
            <div className="auth-shell-wordmark-row">
              <Badge variant="outline" className="auth-shell-badge">
                {text("eyebrow")}
              </Badge>
              <span className="auth-shell-wordmark" translate="no">
                Afenda
              </span>
            </div>

            <div className="auth-shell-copy-block">
              <h1 className="auth-shell-hero-title">
                {text(`views.${copyKey}.hero_title`)}
              </h1>
              <p className="auth-shell-copy">
                {text(`views.${copyKey}.hero_description`)}
              </p>
            </div>

            {methodLabels.length > 0 && (
              <div
                className="auth-shell-method-list"
                aria-label={text("methods_title")}
              >
                {methodLabels.map((label) => (
                  <span key={label} className="auth-shell-pill">
                    {label}
                  </span>
                ))}
              </div>
            )}

            <div className="auth-shell-topic-grid">
              {topics.map(({ key, Icon }) => (
                <article key={key} className="auth-shell-topic-card">
                  <span className="auth-shell-topic-icon" aria-hidden="true">
                    <Icon className="size-4" />
                  </span>

                  <div className="auth-shell-topic-copy">
                    <h2 className="auth-shell-topic-title">
                      {text(`views.${copyKey}.topics.${key}.title`)}
                    </h2>
                    <p className="auth-shell-topic-body">
                      {text(`views.${copyKey}.topics.${key}.body`)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="auth-shell-panel-rail">
          <div className="auth-shell-panel-frame">{children}</div>
        </section>
      </div>
    </main>
  )
}
