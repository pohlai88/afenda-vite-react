import type { TruthRecordEnvelope } from "../../truth/truth-record.model.js"
import type {
  CommandExecutionContext,
  CommandExecutionResult,
} from "../../command/execute-command.js"
import {
  claimStateForActor,
  persistOpsMutation,
  readOpsEventProjection,
  stageStateForAdvance,
} from "./ops.projection.js"
import { canAdvanceOpsEventState } from "./ops.state-machine.js"

function actorRoleFromEvent(counterpartyId: string | null): string {
  return counterpartyId ? "Events operator" : "Operations reviewer"
}

export async function executeOpsEventClaimCommand(
  context: CommandExecutionContext,
  payload: { readonly eventId: string }
): Promise<CommandExecutionResult> {
  const current = await readOpsEventProjection(
    context.tenantId,
    payload.eventId
  )
  if (!current) {
    throw new Error(`event_not_found:${payload.eventId}`)
  }
  if (current.state === "closed") {
    throw new Error("ops_event_invalid_transition:closed_to_claim")
  }

  const nextEvent = claimStateForActor(
    current,
    context.actorId,
    context.actorLabel
  )
  const truthRecord: TruthRecordEnvelope = {
    tenantId: context.tenantId,
    entityType: "ops_event",
    entityId: current.id,
    commandType: "ops.event.claim",
    actorId: context.actorId,
    timestamp: new Date(nextEvent.updatedAt),
    beforeState: {
      eventCode: current.eventCode,
      state: current.state,
      ownerActorId: current.ownerActorId,
      ownerLabel: current.ownerLabel,
    },
    afterState: {
      eventCode: nextEvent.eventCode,
      state: nextEvent.state,
      ownerActorId: nextEvent.ownerActorId,
      ownerLabel: nextEvent.ownerLabel,
    },
    doctrineRef: "ops.truth.claim",
    metadata: {
      eventCode: nextEvent.eventCode,
      title: `${nextEvent.eventCode} claimed for operator follow-up`,
      description:
        current.ownerLabel === null
          ? "The event moved out of the shared queue into named ownership."
          : "The event ownership was reassigned without breaking truth continuity.",
      actionLabel: "Claimed event",
      actorLabel: context.actorLabel,
      actorRole: actorRoleFromEvent(nextEvent.counterpartyId),
    },
  }

  const truthRecordId = await persistOpsMutation({
    tenantId: context.tenantId,
    expectedEvent: current,
    nextEvent,
    truthRecord,
  })

  return {
    truthRecordId,
  }
}

export async function executeOpsEventAdvanceCommand(
  context: CommandExecutionContext,
  payload: { readonly eventId: string }
): Promise<CommandExecutionResult> {
  const current = await readOpsEventProjection(
    context.tenantId,
    payload.eventId
  )
  if (!current) {
    throw new Error(`event_not_found:${payload.eventId}`)
  }
  if (!canAdvanceOpsEventState(current.state)) {
    throw new Error(`ops_event_invalid_transition:${current.state}_to_advance`)
  }

  const nextEvent = stageStateForAdvance(
    current.ownerLabel === null
      ? claimStateForActor(current, context.actorId, context.actorLabel)
      : current
  )

  const truthRecord: TruthRecordEnvelope = {
    tenantId: context.tenantId,
    entityType: "ops_event",
    entityId: current.id,
    commandType: "ops.event.advance",
    actorId: context.actorId,
    timestamp: new Date(nextEvent.updatedAt),
    beforeState: {
      eventCode: current.eventCode,
      state: current.state,
      ownerActorId: current.ownerActorId,
      ownerLabel: current.ownerLabel,
    },
    afterState: {
      eventCode: nextEvent.eventCode,
      state: nextEvent.state,
      ownerActorId: nextEvent.ownerActorId,
      ownerLabel: nextEvent.ownerLabel,
    },
    doctrineRef: "ops.truth.advance",
    invariantRefs: ["ops.state_machine.transition"],
    metadata: {
      eventCode: nextEvent.eventCode,
      title: `${nextEvent.eventCode} advanced to ${nextEvent.state}`,
      description:
        nextEvent.state === "closed"
          ? "The event reached a closed state with truth continuity preserved."
          : "The event progressed through its next accountable operating state.",
      actionLabel: "Advanced stage",
      actorLabel: context.actorLabel,
      actorRole: actorRoleFromEvent(nextEvent.counterpartyId),
    },
  }

  const truthRecordId = await persistOpsMutation({
    tenantId: context.tenantId,
    expectedEvent: current,
    nextEvent,
    truthRecord,
  })

  return {
    truthRecordId,
  }
}
