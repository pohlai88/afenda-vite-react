"use client"

import { Shield, ShieldAlert } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import {
  Button,
  DropdownMenuItem,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@afenda/design-system/ui-primitives"

import { useAuthIntelligence, useAuthSessions } from "../../auth"
import { useCloseMobileSidebar } from "../hooks/use-close-mobile-sidebar"

function trustLabelKey(level: "low" | "medium" | "high" | "verified") {
  if (level === "verified") return "auth_security.trust.verified" as const
  if (level === "high") return "auth_security.trust.high" as const
  if (level === "medium") return "auth_security.trust.medium" as const
  return "auth_security.trust.low" as const
}

export function ShellUserMenuSecurityPanel() {
  const { t } = useTranslation("shell")
  const closeMobileSidebar = useCloseMobileSidebar()
  const [open, setOpen] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const intelligence = useAuthIntelligence()
  const sessions = useAuthSessions(open)

  const trustKey = trustLabelKey(intelligence.data.trustLevel)

  async function onRevokeSession(sessionId: string) {
    setStatusMessage(t("actions.command_running"))
    try {
      await sessions.revokeSession(sessionId)
      setStatusMessage(t("auth_security.revoke_success"))
    } catch {
      setStatusMessage(t("auth_security.revoke_failed"))
    }
  }

  return (
    <>
      <DropdownMenuItem
        className="gap-2"
        onSelect={(event) => {
          event.preventDefault()
          closeMobileSidebar()
          setOpen(true)
        }}
      >
        <Shield className="size-4" aria-hidden />
        {t("auth_security.menu_item")}
      </DropdownMenuItem>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full border-border-muted bg-popover sm:max-w-lg"
        >
          <SheetHeader>
            <SheetTitle>{t("auth_security.panel_title")}</SheetTitle>
            <SheetDescription>
              {t("auth_security.panel_description")}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 px-4 pb-4">
            <section className="rounded-xl border border-border-muted bg-card/55 p-3">
              <p className="text-xs text-muted-foreground">
                {t("auth_security.trust_label")}
              </p>
              <p className="text-base font-semibold">
                {t(trustKey)} / {intelligence.data.score}
              </p>
              <p className="text-xs text-muted-foreground">
                {intelligence.data.lastSeenLabel}
              </p>
            </section>

            <section className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">
                  {t("auth_security.sessions_title")}
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void sessions.reload()}
                  disabled={sessions.isLoading}
                >
                  {t("actions.refresh")}
                </Button>
              </div>

              <div className="space-y-2">
                {(sessions.data?.sessions ?? []).map((session) => (
                  <article
                    key={session.id}
                    className="rounded-lg border border-border-muted bg-card/60 p-3"
                  >
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium">
                        {session.device}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {session.risk}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {session.location}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(session.lastActiveAt))}
                    </p>
                    {!session.isCurrent ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="mt-2"
                        onClick={() => void onRevokeSession(session.id)}
                      >
                        {t("auth_security.revoke_action")}
                      </Button>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>

            <section className="space-y-2 rounded-xl border border-border-muted bg-card/55 p-3">
              <p className="text-sm font-semibold">
                {t("auth_security.factors_title")}
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>
                  {t("auth_security.factor.password")}:{" "}
                  {sessions.data?.factors.password
                    ? t("auth_security.factor_enabled")
                    : t("auth_security.factor_disabled")}
                </li>
                <li>
                  {t("auth_security.factor.social")}:{" "}
                  {sessions.data?.factors.social
                    ? t("auth_security.factor_enabled")
                    : t("auth_security.factor_disabled")}
                </li>
                <li>
                  {t("auth_security.factor.passkey")}:{" "}
                  {sessions.data?.factors.passkey
                    ? t("auth_security.factor_enabled")
                    : t("auth_security.factor_disabled")}
                </li>
                <li>
                  {t("auth_security.factor.mfa")}:{" "}
                  {sessions.data?.factors.mfa
                    ? t("auth_security.factor_enabled")
                    : t("auth_security.factor_disabled")}
                </li>
              </ul>
            </section>

            <section className="space-y-2 rounded-xl border border-border-muted bg-card/55 p-3">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <ShieldAlert
                  className="size-4 text-muted-foreground"
                  aria-hidden
                />
                {t("auth_security.timeline_title")}
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {(sessions.data?.recentEvents ?? []).map((event) => (
                  <li key={event.id}>
                    {event.title} -{" "}
                    {new Intl.DateTimeFormat(undefined, {
                      timeStyle: "short",
                    }).format(new Date(event.timeLabel))}
                  </li>
                ))}
              </ul>
            </section>

            {statusMessage ? (
              <p
                className="text-sm text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                {statusMessage}
              </p>
            ) : null}
            {sessions.errorCode ? (
              <p className="text-sm text-destructive" role="alert">
                {t("auth_security.panel_error")}
              </p>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
