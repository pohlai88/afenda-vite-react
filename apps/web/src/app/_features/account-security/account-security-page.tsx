"use client"

import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { Button, Input, Label } from "@afenda/design-system/ui-primitives"

import {
  authAccountSettingsAbsoluteUrl,
  authClient,
  authPostAccountDeletionAbsoluteUrl,
  mapAuthErrorToUserMessage,
  useAfendaSession,
} from "@/app/_platform/auth"

function mapClientErrorMessage(error: unknown, fallback: string): string {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    const raw = (error as { message: string }).message.trim()
    if (raw.length === 0) return fallback
    return mapAuthErrorToUserMessage(raw, raw)
  }
  return fallback
}

/**
 * Authenticated account security: change email, change password, delete account (Better Auth).
 */
export function AccountSecurityPage() {
  const { t } = useTranslation("auth", { keyPrefix: "accountSecurity" })
  const sessionState = useAfendaSession()

  const [newEmail, setNewEmail] = useState("")
  const [emailMessage, setEmailMessage] = useState<{
    tone: "success" | "error"
    text: string
  } | null>(null)
  const [emailBusy, setEmailBusy] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [revokeOthers, setRevokeOthers] = useState(true)
  const [passwordMessage, setPasswordMessage] = useState<{
    tone: "success" | "error"
    text: string
  } | null>(null)
  const [passwordBusy, setPasswordBusy] = useState(false)

  const [hasCredential, setHasCredential] = useState<boolean | null>(null)
  const [accountsListFailed, setAccountsListFailed] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [deleteAck, setDeleteAck] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState<{
    tone: "success" | "error"
    text: string
  } | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    void authClient
      .listAccounts()
      .then((res: Awaited<ReturnType<typeof authClient.listAccounts>>) => {
        if (cancelled) return
        const accounts = res.data ?? []
        setAccountsListFailed(false)
        setHasCredential(
          accounts.some(
            (a: (typeof accounts)[number]) => a.providerId === "credential"
          )
        )
      })
      .catch(() => {
        if (!cancelled) {
          setAccountsListFailed(true)
          setHasCredential(null)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const userEmail = sessionState.data?.user.email ?? ""

  async function onChangeEmail(e: React.FormEvent) {
    e.preventDefault()
    setEmailMessage(null)
    const trimmed = newEmail.trim()
    if (!trimmed || trimmed === userEmail) {
      setEmailMessage({ tone: "error", text: t("email.invalid") })
      return
    }
    setEmailBusy(true)
    try {
      const { error } = await authClient.changeEmail({
        newEmail: trimmed,
        callbackURL: authAccountSettingsAbsoluteUrl(),
      })
      if (error) {
        setEmailMessage({
          tone: "error",
          text: mapClientErrorMessage(error, t("email.error")),
        })
        return
      }
      setNewEmail("")
      setEmailMessage({ tone: "success", text: t("email.success") })
    } finally {
      setEmailBusy(false)
    }
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordMessage(null)
    if (!currentPassword || !newPassword) {
      setPasswordMessage({ tone: "error", text: t("password.required") })
      return
    }
    setPasswordBusy(true)
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: revokeOthers,
      })
      if (error) {
        setPasswordMessage({
          tone: "error",
          text: mapClientErrorMessage(error, t("password.error")),
        })
        return
      }
      setCurrentPassword("")
      setNewPassword("")
      setPasswordMessage({ tone: "success", text: t("password.success") })
    } finally {
      setPasswordBusy(false)
    }
  }

  async function onDeleteAccount(e: React.FormEvent) {
    e.preventDefault()
    setDeleteMessage(null)
    if (!deleteAck) {
      setDeleteMessage({ tone: "error", text: t("delete.need_ack") })
      return
    }
    setDeleteBusy(true)
    try {
      const { error } = await authClient.deleteUser({
        ...(deletePassword.trim() ? { password: deletePassword.trim() } : {}),
        callbackURL: authPostAccountDeletionAbsoluteUrl(),
      })
      if (error) {
        setDeleteMessage({
          tone: "error",
          text: mapClientErrorMessage(error, t("delete.error")),
        })
        return
      }
      setDeleteMessage({ tone: "success", text: t("delete.success") })
    } finally {
      setDeleteBusy(false)
    }
  }

  if (sessionState.isPending) {
    return (
      <section className="ui-page ui-stack-relaxed" aria-busy="true">
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </section>
    )
  }

  if (!sessionState.data) {
    return (
      <section className="ui-page ui-stack-relaxed">
        <p className="text-sm text-muted-foreground">{t("signed_out")}</p>
      </section>
    )
  }

  return (
    <section className="ui-page ui-stack-relaxed max-w-xl">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div className="space-y-4 rounded-xl border border-border-muted bg-card/55 p-4">
        <h2 className="text-sm font-semibold">{t("email.heading")}</h2>
        <p className="text-xs text-muted-foreground">
          {t("email.current_label")}{" "}
          <span className="font-medium text-foreground">{userEmail}</span>
        </p>
        <form onSubmit={onChangeEmail} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="account-new-email">{t("email.new_label")}</Label>
            <Input
              id="account-new-email"
              type="email"
              autoComplete="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder={t("email.placeholder")}
            />
          </div>
          {emailMessage ? (
            <p
              className={
                emailMessage.tone === "success"
                  ? "text-sm text-emerald-600 dark:text-emerald-400"
                  : "text-sm text-destructive"
              }
              role="status"
            >
              {emailMessage.text}
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">{t("email.help")}</p>
          <Button type="submit" disabled={emailBusy}>
            {emailBusy ? t("email.submitting") : t("email.submit")}
          </Button>
        </form>
      </div>

      {hasCredential !== false || accountsListFailed ? (
        <div className="space-y-4 rounded-xl border border-border-muted bg-card/55 p-4">
          <h2 className="text-sm font-semibold">{t("password.heading")}</h2>
          <form onSubmit={onChangePassword} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="account-current-password">
                {t("password.current_label")}
              </Label>
              <Input
                id="account-current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-new-password">
                {t("password.new_label")}
              </Label>
              <Input
                id="account-new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={revokeOthers}
                onChange={(e) => setRevokeOthers(e.target.checked)}
              />
              {t("password.revoke_others")}
            </label>
            {passwordMessage ? (
              <p
                className={
                  passwordMessage.tone === "success"
                    ? "text-sm text-emerald-600 dark:text-emerald-400"
                    : "text-sm text-destructive"
                }
                role="status"
              >
                {passwordMessage.text}
              </p>
            ) : null}
            <Button type="submit" disabled={passwordBusy}>
              {passwordBusy ? t("password.submitting") : t("password.submit")}
            </Button>
          </form>
        </div>
      ) : null}

      {import.meta.env.VITE_AFENDA_AUTH_ALL_PLUGINS !== "false" ? (
        <div className="space-y-2 rounded-xl border border-border-muted bg-card/55 p-4">
          <h2 className="text-sm font-semibold">{t("apiKeys.heading")}</h2>
          <p className="text-sm text-muted-foreground">{t("apiKeys.body")}</p>
          <p className="text-xs text-muted-foreground">{t("apiKeys.hint")}</p>
        </div>
      ) : null}

      <div className="space-y-4 rounded-xl border border-destructive/40 bg-destructive/5 p-4">
        <h2 className="text-sm font-semibold text-destructive">
          {t("delete.heading")}
        </h2>
        <p className="text-xs text-muted-foreground">{t("delete.warning")}</p>
        <form onSubmit={onDeleteAccount} className="space-y-3">
          {hasCredential !== false || accountsListFailed ? (
            <div className="space-y-2">
              <Label htmlFor="account-delete-password">
                {t("delete.password_label")}
              </Label>
              <Input
                id="account-delete-password"
                type="password"
                autoComplete="current-password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {t("delete.password_help_oauth")}
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t("delete.oauth_only")}
            </p>
          )}
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={deleteAck}
              onChange={(e) => setDeleteAck(e.target.checked)}
              className="mt-1"
            />
            {t("delete.ack")}
          </label>
          {deleteMessage ? (
            <p
              className={
                deleteMessage.tone === "success"
                  ? "text-sm text-emerald-600 dark:text-emerald-400"
                  : "text-sm text-destructive"
              }
              role="status"
            >
              {deleteMessage.text}
            </p>
          ) : null}
          <Button type="submit" variant="destructive" disabled={deleteBusy}>
            {deleteBusy ? t("delete.submitting") : t("delete.submit")}
          </Button>
        </form>
      </div>
    </section>
  )
}
