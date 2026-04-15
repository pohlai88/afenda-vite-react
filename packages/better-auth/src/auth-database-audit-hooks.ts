import {
  insertGovernedAuditLog,
  resolveAfendaMeContext,
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

/**
 * Loads Better Auth `user.email` by primary key so we can match Afenda `users.email`
 * (see {@link resolveAfendaMeContext}).
 */
export async function loadBetterAuthUserEmail(
  pool: Pool,
  betterAuthUserId: string
): Promise<string | null> {
  const r = await pool.query<{ email: string }>(
    `select "email" from "user" where "id" = $1 limit 1`,
    [betterAuthUserId]
  )
  const email = r.rows[0]?.email?.trim()
  return email && email.length > 0 ? email : null
}

async function resolveTenantAndActor(
  pool: Pool,
  db: DatabaseClient,
  betterAuthUserId: string | null
): Promise<{ tenantId: string | null; actorUserId: string | null }> {
  if (!betterAuthUserId) {
    return { tenantId: resolveAuthAuditFallbackTenantId(), actorUserId: null }
  }
  const email = await loadBetterAuthUserEmail(pool, betterAuthUserId)
  if (!email) {
    return {
      tenantId: resolveAuthAuditFallbackTenantId(),
      actorUserId: null,
    }
  }
  const ctx = await resolveAfendaMeContext(db, email)
  const tenantId = ctx?.defaultTenantId ?? resolveAuthAuditFallbackTenantId()
  return {
    tenantId,
    actorUserId: ctx?.afendaUserId ?? null,
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
