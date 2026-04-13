/**
 * MAP SHELL INTERACTION AUDIT PAYLOAD
 *
 * Pure envelope → JSON body for POST /v1/audit/shell-interaction.
 * No database imports.
 */

import type { ShellInteractionAuditEnvelope } from "../contract/shell-interaction-audit-contract"

export const SHELL_INTERACTION_AUDIT_ACTION =
  "shell.interaction.recorded" as const

export interface ShellInteractionAuditRequestBody {
  action: typeof SHELL_INTERACTION_AUDIT_ACTION
  interactionPhase: ShellInteractionAuditEnvelope["interactionPhase"]
  actor?: {
    userId?: string
    actingAsUserId?: string
  }
  subject: {
    type: "shell_interaction"
    id: string
  }
  commandId?: string
  tenantId?: string
  metadata: {
    module: "apps/web"
    route?: string
    feature?: string
    extra: {
      sevenW1H: Record<string, unknown>
    }
  }
}

function generateSubjectId(envelope: ShellInteractionAuditEnvelope): string {
  const base =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `shell_ix_${envelope.commandId ?? "unknown"}_${envelope.interactionPhase}_${Date.now()}`
  return base
}

export function mapShellInteractionAuditPayload(
  envelope: ShellInteractionAuditEnvelope
): ShellInteractionAuditRequestBody {
  const sevenW1H: Record<string, unknown> = {
    kind: envelope.kind,
    mechanism: envelope.mechanism,
    interactionPhase: envelope.interactionPhase,
    ...(envelope.actorUserId !== undefined && { who: envelope.actorUserId }),
    ...(envelope.actingAsUserId !== undefined && {
      actingAs: envelope.actingAsUserId,
    }),
    ...(envelope.actionType !== undefined && { what: envelope.actionType }),
    ...(envelope.commandId !== undefined && { commandId: envelope.commandId }),
    ...(envelope.shellSurface !== undefined && {
      shellSurface: envelope.shellSurface,
    }),
    ...(envelope.occurredAt !== undefined && { when: envelope.occurredAt }),
    ...(envelope.routeId !== undefined && { routeId: envelope.routeId }),
    ...(envelope.pathname !== undefined && { pathname: envelope.pathname }),
    ...(envelope.shellRegion !== undefined && {
      shellRegion: envelope.shellRegion,
    }),
    ...(envelope.reasonCategory !== undefined && {
      why: envelope.reasonCategory,
    }),
    ...(envelope.metadataReasonKey !== undefined && {
      metadataReasonKey: envelope.metadataReasonKey,
    }),
    ...(envelope.tenantId !== undefined && { tenantId: envelope.tenantId }),
    ...(envelope.targetModule !== undefined && {
      targetModule: envelope.targetModule,
    }),
    ...(envelope.targetFeature !== undefined && {
      targetFeature: envelope.targetFeature,
    }),
    ...(envelope.targetEntityRef !== undefined && {
      which: envelope.targetEntityRef,
    }),
    ...(envelope.affectedSubjectRef !== undefined && {
      whom: envelope.affectedSubjectRef,
    }),
    ...(envelope.commandOutcomeCategory !== undefined && {
      commandOutcomeCategory: envelope.commandOutcomeCategory,
    }),
    ...(envelope.errorMessage !== undefined && {
      errorMessage: envelope.errorMessage,
    }),
  }

  return {
    action: SHELL_INTERACTION_AUDIT_ACTION,
    interactionPhase: envelope.interactionPhase,
    ...(envelope.actorUserId !== undefined ||
    envelope.actingAsUserId !== undefined
      ? {
          actor: {
            ...(envelope.actorUserId !== undefined && {
              userId: envelope.actorUserId,
            }),
            ...(envelope.actingAsUserId !== undefined && {
              actingAsUserId: envelope.actingAsUserId,
            }),
          },
        }
      : {}),
    subject: {
      type: "shell_interaction",
      id: generateSubjectId(envelope),
    },
    ...(envelope.commandId !== undefined && { commandId: envelope.commandId }),
    ...(envelope.tenantId !== undefined && { tenantId: envelope.tenantId }),
    metadata: {
      module: "apps/web",
      ...(envelope.pathname !== undefined && { route: envelope.pathname }),
      ...(envelope.targetFeature !== undefined && {
        feature: envelope.targetFeature,
      }),
      extra: { sevenW1H },
    },
  }
}
