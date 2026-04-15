import {
  ensureIdentityLinkForBetterAuthUser,
  insertGovernedAuditLog,
  resolveAfendaMeContextFromBetterAuthUserId,
  type AuditActionKey,
  type DatabaseClient,
} from "@afenda/database"
import { betterAuth } from "better-auth"
import type { Pool } from "pg"

type AfendaDatabaseHooks = NonNullable<
  Parameters<typeof betterAuth>[0]["databaseHooks"]
>

export type AfendaAuthSecurityAuditAction = Extract<
  AuditActionKey,
  | "auth.session.created"
  | "auth.session.revoked"
  | "auth.account.linked"
  | "auth.user.updated"
>

function resolveAuthAuditFallbackTenantId(): string | null {
  const raw = process.env.AFENDA_AUTH_AUDIT_FALLBACK_TENANT_ID?.trim()
  return raw && raw.length > 0 ? raw : null
}

function resolveAuditDeploymentEnvironment(): "production" | "dev" {
  return process.env.NODE_ENV === "production" ? "production" : "dev"
}

async function resolveTenantAndActor(
  _pool: Pool,
  db: DatabaseClient,
  betterAuthUserId: string | null
): Promise<{ tenantId: string | null; actorUserId: string | null }> {
  if (!betterAuthUserId) {
    return { tenantId: resolveAuthAuditFallbackTenantId(), actorUserId: null }
  }

  const bridge = await resolveAfendaMeContextFromBetterAuthUserId(
    db,
    betterAuthUserId
  )
  if (bridge) {
    return {
      tenantId:
        bridge.defaultTenantId ?? resolveAuthAuditFallbackTenantId(),
      actorUserId: bridge.afendaUserId,
    }
  }

  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "[afenda/auth] Security audit skipped: no identity_links row for Better Auth user (actor unknown). Sign-up bootstrap must create the bridge."
    )
  }
  return {
    tenantId: resolveAuthAuditFallbackTenantId(),
    actorUserId: null,
  }
}

/**
 * Writes governed `audit_logs` rows for Better Auth {@link BetterAuthOptions.databaseHooks}.
 * Never throws: failures are logged so auth flows are not blocked.
 */
export async function emitAfendaAuthSecurityAudit(
  pool: Pool,
  db: DatabaseClient,
  input: {
    action: AfendaAuthSecurityAuditAction
    betterAuthUserId: string | null
    subjectType: string
    subjectId: string | null
    sessionId?: string | null
    metadata?: Record<string, unknown>
  }
): Promise<void> {
  const { tenantId, actorUserId } = await resolveTenantAndActor(
    pool,
    db,
    input.betterAuthUserId
  )
  if (!tenantId) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[afenda/auth] Security audit skipped: no tenant (no active Afenda membership and AFENDA_AUTH_AUDIT_FALLBACK_TENANT_ID unset)."
      )
    }
    return
  }

  try {
    await insertGovernedAuditLog(db, {
      tenantId,
      actorType: input.betterAuthUserId ? "person" : "system",
      actorUserId: actorUserId ?? undefined,
      /** Governed column for Better Auth user id; keeps `metadata.betterAuthUserId` during transition. */
      authUserId: input.betterAuthUserId ?? undefined,
      action: input.action,
      subjectType: input.subjectType,
      subjectId: input.subjectId ?? undefined,
      sourceChannel: "api",
      outcome: "success",
      sessionId: input.sessionId ?? undefined,
      environment: resolveAuditDeploymentEnvironment(),
      metadata: {
        ...input.metadata,
        betterAuthUserId: input.betterAuthUserId,
      },
    })
  } catch (e) {
    console.error("[afenda/auth] emitAfendaAuthSecurityAudit failed", e)
  }
}

type SessionRow = { id: string; userId: string }
type AccountRow = { id: string; userId: string; providerId: string }
type UserRow = { id: string; email?: string | null }

export function createAfendaDatabaseAuthHooks(
  pool: Pool,
  db: DatabaseClient
): AfendaDatabaseHooks {
  return {
    session: {
      create: {
        after: async (created: SessionRow) => {
          await emitAfendaAuthSecurityAudit(pool, db, {
            action: "auth.session.created",
            betterAuthUserId: created.userId,
            subjectType: "auth.session",
            subjectId: created.id,
            sessionId: created.id,
          })
        },
      },
      delete: {
        after: async (removed: SessionRow) => {
          await emitAfendaAuthSecurityAudit(pool, db, {
            action: "auth.session.revoked",
            betterAuthUserId: removed.userId,
            subjectType: "auth.session",
            subjectId: removed.id,
            sessionId: removed.id,
          })
        },
      },
    },
    account: {
      create: {
        after: async (created: AccountRow) => {
          await emitAfendaAuthSecurityAudit(pool, db, {
            action: "auth.account.linked",
            betterAuthUserId: created.userId,
            subjectType: "auth.account",
            subjectId: created.id,
            metadata: { providerId: created.providerId },
          })
        },
      },
    },
    user: {
      create: {
        after: async (created: UserRow) => {
          const email = created.email?.trim()
          if (!email) {
            if (process.env.NODE_ENV !== "production") {
              console.warn(
                "[afenda/auth] identity bootstrap skipped: Better Auth user has no email"
              )
            }
            return
          }
          try {
            await ensureIdentityLinkForBetterAuthUser(db, {
              betterAuthUserId: created.id,
              email,
            })
          } catch (e) {
            console.error("[afenda/auth] identity bootstrap failed", e)
          }
        },
      },
      update: {
        after: async (updated: UserRow) => {
          await emitAfendaAuthSecurityAudit(pool, db, {
            action: "auth.user.updated",
            betterAuthUserId: updated.id,
            subjectType: "auth.user",
            subjectId: updated.id,
            metadata: { email: updated.email ?? undefined },
          })
        },
      },
    },
  }
}
