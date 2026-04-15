/**
 * Actions emitted by {@link emitAfendaAuthSecurityAudit} for session/account/user hooks.
 * Used to scope `recentEvents` to security-relevant audit rows (not all of `audit_logs`).
 */
export const AUTH_SECURITY_RECENT_EVENT_ACTIONS = [
  "auth.session.created",
  "auth.session.revoked",
  "auth.account.linked",
  "auth.user.updated",
] as const

export type AuthSecurityRecentEventAction =
  (typeof AUTH_SECURITY_RECENT_EVENT_ACTIONS)[number]

/** Fixed `IN (...)` fragment for raw SQL (values are catalog-controlled, not user input). */
export function authSecurityRecentEventActionsInSql(): string {
  return AUTH_SECURITY_RECENT_EVENT_ACTIONS.map((a) => `'${a}'`).join(", ")
}
