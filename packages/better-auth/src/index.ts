export {
  createAfendaDatabaseAuthHooks,
  emitAfendaAuthSecurityAudit,
} from "./auth-database-audit-hooks.js"
export type { AfendaAuthSecurityAuditAction } from "./auth-database-audit-hooks.js"
export {
  createAfendaAuth,
  DEFAULT_BETTER_AUTH_TRUSTED_ORIGINS,
} from "./create-afenda-auth.js"
export * from "./afenda-auth-plugin-flags.js"
export {
  setSessionOperatingContext,
  type SetSessionOperatingContextInput,
  type SetSessionOperatingContextResult,
} from "./set-session-operating-context.js"
export { resolveAfendaAuthCapabilityHooks } from "./create-afenda-auth.js"
export type { AfendaAuthCapabilityHooks } from "./create-afenda-auth.js"
export {
  AFENDA_EMAIL_DELIVERY_FAILED,
  AFENDA_EMAIL_DELIVERY_FAILED_MESSAGE,
} from "./afenda-resend-mail.js"

/** Better Auth instance from {@link createAfendaAuth} — includes `handler`, `api`, `$Infer`, … */
export type AfendaAuth = ReturnType<
  typeof import("./create-afenda-auth.js").createAfendaAuth
>
