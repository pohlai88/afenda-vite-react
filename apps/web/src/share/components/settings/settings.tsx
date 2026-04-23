import { useAuth, useAuthenticate } from "@better-auth-ui/react"
import type { SettingsView } from "@better-auth-ui/react/core"
import { CircleUserRound, ShieldCheck, Sparkles } from "lucide-react"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import {
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"
import { AccountSettings } from "./account/account-settings"
import { SecuritySettings } from "./security/security-settings"

export type SettingsProps = {
  className?: string
  path?: string
  /** @remarks `SettingsView` */
  view?: SettingsView
  hideNav?: boolean
  embedded?: boolean
}

/**
 * Renders the settings UI and activates the appropriate settings view based on `view` or `path`.
 *
 * @param className - Additional CSS class names applied to the root container
 * @param path - Route path used to resolve which settings view to activate when `view` is not provided
 * @param view - Explicit settings view to activate (for example, `"account"` or `"security"`)
 * @param hideNav - When `true`, hides the settings navigation tabs
 * @returns A JSX element rendering the settings layout and the selected settings panel
 */
export function Settings({
  className,
  view,
  path,
  hideNav,
  embedded = false,
}: SettingsProps) {
  const {
    basePaths,
    emailAndPassword,
    localization,
    multiSession,
    passkey,
    socialProviders,
    viewPaths,
    Link,
  } = useAuth()
  useAuthenticate()
  const { t } = useTranslation("auth", { keyPrefix: "experience.settings" })

  if (!view && !path) {
    throw new Error("[Better Auth UI] Either `view` or `path` must be provided")
  }

  const settingsPathViews = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(viewPaths.settings).map(([k, v]) => [v, k])
      ) as Record<string, SettingsView>,
    [viewPaths.settings]
  )

  const currentView = view || (path ? settingsPathViews[path] : undefined)
  const viewLabel =
    currentView === "security"
      ? localization.settings.security
      : localization.settings.account
  const capabilityLabels = useMemo(
    () =>
      [
        emailAndPassword?.enabled ? localization.auth.password : null,
        socialProviders?.length ? localization.settings.linkedAccounts : null,
        passkey ? localization.settings.passkeys : null,
        multiSession ? localization.settings.manageAccounts : null,
      ].filter((label): label is string => Boolean(label)),
    [
      emailAndPassword?.enabled,
      localization.auth.password,
      localization.settings.linkedAccounts,
      localization.settings.manageAccounts,
      localization.settings.passkeys,
      multiSession,
      passkey,
      socialProviders?.length,
    ]
  )

  if (!currentView) {
    throw new Error(
      `[Better Auth UI] Valid settings views are: ${Object.keys(viewPaths.settings).join(", ")}`
    )
  }

  return (
    <Tabs value={currentView} className={cn("auth-settings-root", className)}>
      {!embedded ? (
        <section className="auth-settings-header">
          <div className="auth-settings-intro">
            <div className="auth-settings-eyebrow-row">
              <Badge variant="outline" className="auth-shell-badge">
                {t("eyebrow")}
              </Badge>
              <span className="auth-shell-wordmark">
                {localization.settings.settings}
              </span>
            </div>

            <div className="auth-settings-copy-block">
              <h1 className="auth-settings-title">
                {t(`views.${currentView}.title`)}
              </h1>
              <p className="auth-settings-description">
                {t(`views.${currentView}.description`)}
              </p>
            </div>
          </div>

          <div className="auth-settings-summary">
            <div className="grid gap-2">
              <div className="auth-settings-section-title">
                {currentView === "security" ? (
                  <ShieldCheck
                    className="size-4 text-primary"
                    aria-hidden="true"
                  />
                ) : (
                  <CircleUserRound
                    className="size-4 text-primary"
                    aria-hidden="true"
                  />
                )}
                {viewLabel}
              </div>
              <p className="auth-settings-summary-copy">
                {t(`views.${currentView}.summary`)}
              </p>
            </div>

            <div className="grid gap-3">
              <div className="auth-settings-section-title">
                <Sparkles className="size-4 text-primary" aria-hidden="true" />
                {t("capabilities_title")}
              </div>
              <div className="auth-settings-capability-list">
                {capabilityLabels.map((label) => (
                  <span key={label} className="auth-settings-pill">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className={cn(hideNav && "hidden")}>
            <TabsList
              variant="line"
              aria-label={t("tabs_label")}
              className="auth-settings-nav"
            >
              <TabsTrigger
                value="account"
                className="auth-settings-trigger"
                asChild
              >
                <Link
                  href={`${basePaths.settings}/${viewPaths.settings.account}`}
                >
                  {localization.settings.account}
                </Link>
              </TabsTrigger>

              <TabsTrigger
                value="security"
                className="auth-settings-trigger"
                asChild
              >
                <Link
                  href={`${basePaths.settings}/${viewPaths.settings.security}`}
                >
                  {localization.settings.security}
                </Link>
              </TabsTrigger>
            </TabsList>
          </div>
        </section>
      ) : (
        <div
          className={cn(
            "flex flex-wrap items-center gap-3",
            hideNav && "hidden"
          )}
        >
          <TabsList
            variant="line"
            aria-label={t("tabs_label")}
            className="auth-settings-nav"
          >
            <TabsTrigger
              value="account"
              className="auth-settings-trigger"
              asChild
            >
              <Link
                href={`${basePaths.settings}/${viewPaths.settings.account}`}
              >
                {localization.settings.account}
              </Link>
            </TabsTrigger>

            <TabsTrigger
              value="security"
              className="auth-settings-trigger"
              asChild
            >
              <Link
                href={`${basePaths.settings}/${viewPaths.settings.security}`}
              >
                {localization.settings.security}
              </Link>
            </TabsTrigger>
          </TabsList>
        </div>
      )}

      <TabsContent value="account" tabIndex={-1} className="mt-0">
        <AccountSettings />
      </TabsContent>

      <TabsContent value="security" tabIndex={-1} className="mt-0">
        <SecuritySettings />
      </TabsContent>
    </Tabs>
  )
}
