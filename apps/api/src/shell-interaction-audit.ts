/**
 * POST /v1/audit/shell-interaction — shell UI interaction evidence (not business audit).
 */

import {
  assertUserHasTenantAccess,
  insertGovernedAuditLog,
  type DatabaseClient,
} from "@afenda/database"
import type { Context } from "hono"

export interface ShellInteractionAuditRequestBody {
  action: string
  interactionPhase: string
  actor?: {
    userId?: string
    actingAsUserId?: string
  }
  subject: {
    type: string
    id: string
  }
  commandId?: string
  tenantId?: string
  metadata: {
    module: string
    route?: string
    feature?: string
    extra: {
      sevenW1H: Record<string, unknown>
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function parseShellInteractionAuditBody(
  raw: unknown
): ShellInteractionAuditRequestBody | null {
  if (!isRecord(raw)) {
    return null
  }
  const action = raw.action
  const interactionPhase = raw.interactionPhase
  const subject = raw.subject
  const metadata = raw.metadata

  if (typeof action !== "string" || action !== "shell.interaction.recorded") {
    return null
  }
  if (
    typeof interactionPhase !== "string" ||
    !["started", "succeeded", "failed", "cancelled"].includes(interactionPhase)
  ) {
    return null
  }
  if (
    !isRecord(subject) ||
    typeof subject.type !== "string" ||
    typeof subject.id !== "string"
  ) {
    return null
  }
  if (!isRecord(metadata) || typeof metadata.module !== "string") {
    return null
  }
  const extra = metadata.extra
  if (!isRecord(extra) || !isRecord(extra.sevenW1H)) {
    return null
  }

  const actor = raw.actor
  let parsedActor: ShellInteractionAuditRequestBody["actor"]
  if (actor !== undefined) {
    if (!isRecord(actor)) {
      return null
    }
    parsedActor = {}
    if (typeof actor.userId === "string") {
      parsedActor.userId = actor.userId
    }
    if (typeof actor.actingAsUserId === "string") {
      parsedActor.actingAsUserId = actor.actingAsUserId
    }
  }

  return {
    action: "shell.interaction.recorded",
    interactionPhase,
    actor: parsedActor,
    subject: { type: subject.type, id: subject.id },
    ...(typeof raw.commandId === "string" && { commandId: raw.commandId }),
    ...(typeof raw.tenantId === "string" && { tenantId: raw.tenantId }),
    metadata: {
      module: metadata.module,
      ...(typeof metadata.route === "string" && { route: metadata.route }),
      ...(typeof metadata.feature === "string" && {
        feature: metadata.feature,
      }),
      extra: { sevenW1H: extra.sevenW1H as Record<string, unknown> },
    },
  }
}

function mapInteractionToAuditOutcome(
  phase: string,
  commandOutcomeCategory?: string
): "success" | "failed" | "rejected" | "partial" {
  if (phase === "succeeded") {
    return "success"
  }
  if (phase === "started") {
    return "partial"
  }
  if (phase === "cancelled") {
    return "rejected"
  }
  if (phase === "failed") {
    if (
      commandOutcomeCategory === "validation_failed" ||
      commandOutcomeCategory === "unauthorized"
    ) {
      return "rejected"
    }
    return "failed"
  }
  return "failed"
}

export async function handleShellInteractionAudit(
  c: Context,
  db: DatabaseClient,
  sessionEmail: string | null | undefined
): Promise<Response> {
  const auditCtx = c.get("audit")
  const tenantHeader = auditCtx.tenantId
  let raw: unknown
  try {
    raw = await c.req.json()
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400)
  }

  const body = parseShellInteractionAuditBody(raw)
  if (body === null) {
    return c.json({ error: "Invalid shell interaction audit payload" }, 400)
  }

  const tenantId = tenantHeader ?? body.tenantId
  if (tenantId === undefined || tenantId === "") {
    return c.json(
      { error: "Missing X-Tenant-Id header or tenantId in body" },
      400
    )
  }

  const allowed = await assertUserHasTenantAccess(db, sessionEmail, tenantId)
  if (!allowed) {
    return c.json({ error: "Tenant not allowed for this session" }, 403)
  }

  const seven = body.metadata.extra.sevenW1H
  const category =
    typeof seven.commandOutcomeCategory === "string"
      ? seven.commandOutcomeCategory
      : undefined

  const outcome = mapInteractionToAuditOutcome(body.interactionPhase, category)

  const actorUserId = body.actor?.userId
  const actorType =
    actorUserId !== undefined && actorUserId !== "" ? "person" : "system"

  const row = await insertGovernedAuditLog(db, {
    tenantId,
    action: "shell.interaction.recorded",
    actorType,
    ...(actorUserId !== undefined && actorUserId !== "" && { actorUserId }),
    ...(body.actor?.actingAsUserId !== undefined &&
      body.actor.actingAsUserId !== "" && {
        actingAsUserId: body.actor.actingAsUserId,
      }),
    subjectType: "shell_interaction",
    subjectId: body.subject.id,
    sourceChannel: "ui",
    outcome,
    ...(body.commandId !== undefined && { commandId: body.commandId }),
    requestId: auditCtx.requestId,
    traceId: auditCtx.traceId,
    correlationId: auditCtx.correlationId,
    metadata: {
      route: body.metadata.route,
      module: body.metadata.module,
      feature: body.metadata.feature,
      extra: {
        interactionPhase: body.interactionPhase,
        sevenW1H: body.metadata.extra.sevenW1H,
      },
    },
  })

  return c.json({ id: row.id, recordedAt: row.recordedAt.toISOString() }, 201)
}
