export const opsWorkflowSteps = [
  "Captured",
  "Assigned",
  "In progress",
  "Completed",
  "Closed",
] as const

export type OpsEventState =
  | "draft"
  | "assigned"
  | "in_progress"
  | "completed"
  | "closed"

export type OpsEventPriority = "critical" | "high" | "medium" | "low"
export type OpsPartnerHealth = "healthy" | "attention" | "blocked"

const stateToStepIndex: Readonly<Record<OpsEventState, number>> = {
  draft: 1,
  assigned: 2,
  in_progress: 3,
  completed: 4,
  closed: 5,
}

const stateToStageLabel: Readonly<Record<OpsEventState, string>> = {
  draft: "Captured",
  assigned: "Assigned",
  in_progress: "In progress",
  completed: "Completed",
  closed: "Closed",
}

export function stageLabelForOpsEventState(state: OpsEventState): string {
  return stateToStageLabel[state]
}

export function progressForOpsEventState(state: OpsEventState) {
  return {
    currentStep: stateToStepIndex[state],
    totalSteps: opsWorkflowSteps.length,
    steps: opsWorkflowSteps,
  }
}

export function canAdvanceOpsEventState(state: OpsEventState): boolean {
  return state !== "closed" && state !== "draft"
}

export function advanceOpsEventState(state: OpsEventState): OpsEventState {
  switch (state) {
    case "assigned":
      return "in_progress"
    case "in_progress":
      return "completed"
    case "completed":
      return "closed"
    case "draft":
      throw new Error("ops_event_invalid_transition:draft_to_advance")
    case "closed":
      throw new Error("ops_event_invalid_transition:closed_to_advance")
  }
}
