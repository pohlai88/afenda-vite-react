export const auditActionKeys = [
  "auth.account.linked",
  "auth.login.succeeded",
  "auth.session.created",
  "auth.session.revoked",
  "auth.user.updated",
  "shell.interaction.recorded",
] as const

export type AuditActionKey = (typeof auditActionKeys)[number]

export function isAuditActionKey(value: string): value is AuditActionKey {
  return auditActionKeys.includes(value as AuditActionKey)
}
