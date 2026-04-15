/**
 * PLATFORM PREVIEW STAGE CONFIG
 *
 * Shared stage configuration and role/scenario emphasis logic for the
 * AFENDA role-play showcase live shell.
 *
 * Purpose:
 * - keep `showcase-shell-preview.tsx` focused on rendering
 * - centralize stage wording and emphasis rules
 * - prevent drift across role/scenario matrices
 */

import type {
  PreviewInspectState,
  PreviewRole,
  PreviewScenario,
} from "../types/platform-preview-types"

export interface RoleStageDefinition {
  readonly label: string
  readonly focusTitle: string
  readonly focusDescription: string
  readonly primaryQuestion: string
  readonly highlightedEventId: string
  readonly sideTitle: string
  readonly sideDescription: string
  readonly chips: readonly string[]
  readonly stageEyebrow: string
  readonly stageRoleSummary: string
  readonly featuredFrameLabel: string
  readonly featuredFrameSummary: string
  readonly continuityFocusLabel: string
  readonly summaryCards: ReadonlyArray<{
    readonly id: string
    readonly label: string
    readonly value: string
  }>
}

export interface ScenarioStageDefinition {
  readonly label: string
  readonly topBand: readonly string[]
  readonly stageTitle: string
  readonly stageDescription: string
  readonly riskLabel: string
  readonly continuity: readonly string[]
}

const roleStageMap = {
  controller: {
    label: "Controller lens",
    focusTitle: "Control posture before approval",
    focusDescription:
      "You are checking whether this movement is ready, attributable, and safe to release without leaving a reconstruction mess behind.",
    primaryQuestion: "Can I approve this now with confidence?",
    highlightedEventId: "evt-1027",
    sideTitle: "What a controller is checking",
    sideDescription:
      "Readiness, evidence continuity, actor trace, and whether the release posture really deserves a yes.",
    chips: ["approval posture", "evidence linked", "scope visible"],
    stageEyebrow: "Controller priority",
    stageRoleSummary:
      "This view emphasizes readiness, approval posture, and whether the trace is strong enough to support release.",
    featuredFrameLabel: "Why this event is surfaced first",
    featuredFrameSummary:
      "This is the decision surface: whether evidence, actor context, and control posture justify moving forward now.",
    continuityFocusLabel: "Continuity focus for approval",
    summaryCards: [
      { id: "controller-1", label: "Release confidence", value: "Ready with trace" },
      { id: "controller-2", label: "Blocking exceptions", value: "1 review note" },
      { id: "controller-3", label: "Approval context", value: "Entity + operator preserved" },
    ],
  },
  executive: {
    label: "Executive lens",
    focusTitle: "Roll-up confidence without losing the business truth",
    focusDescription:
      "You are not approving a single click. You are checking whether the system gives command, visibility, and governable movement across the business.",
    primaryQuestion: "Can I trust this as a system of command?",
    highlightedEventId: "evt-1026",
    sideTitle: "What an executive is seeing",
    sideDescription:
      "Risk posture, entity confidence, control coverage, and whether operations still roll up into something governable.",
    chips: ["entity confidence", "control coverage", "exception posture"],
    stageEyebrow: "Executive priority",
    stageRoleSummary:
      "This view emphasizes confidence, exposure, and whether one event still rolls up into a governable operating picture.",
    featuredFrameLabel: "Why this event is surfaced first",
    featuredFrameSummary:
      "This event is the best executive proof point because it shows whether the system preserves meaning before it becomes a summary.",
    continuityFocusLabel: "Continuity focus for command",
    summaryCards: [
      { id: "executive-1", label: "Operating confidence", value: "High, trace intact" },
      { id: "executive-2", label: "Entity exposure", value: "Contained to AP lane" },
      { id: "executive-3", label: "Reconstruction burden", value: "Reduced" },
    ],
  },
  owner: {
    label: "Owner lens",
    focusTitle: "See what changed and whether the business is protected",
    focusDescription:
      "You want clarity without drowning in system detail: what moved, who acted, and whether the business is still safe.",
    primaryQuestion: "Is the business protected while this moves?",
    highlightedEventId: "evt-1027",
    sideTitle: "What a business owner is seeing",
    sideDescription:
      "Simplified confidence: the business changed, the controls held, and the people involved are visible when needed.",
    chips: ["business impact", "confidence summary", "who acted"],
    stageEyebrow: "Owner priority",
    stageRoleSummary:
      "This view emphasizes business clarity: what changed, whether protection held, and whether the movement still feels safe.",
    featuredFrameLabel: "Why this event is surfaced first",
    featuredFrameSummary:
      "This event gives the clearest owner-level answer: something moved, the business stayed protected, and the decision path is understandable.",
    continuityFocusLabel: "Continuity focus for confidence",
    summaryCards: [
      { id: "owner-1", label: "Business impact", value: "Release path protected" },
      { id: "owner-2", label: "Decision clarity", value: "Yes, with visible trace" },
      { id: "owner-3", label: "What changed", value: "Payment cleared for handoff" },
    ],
  },
  operator: {
    label: "Operator lens",
    focusTitle: "See the next action and why it matters",
    focusDescription:
      "You are doing the work. The system should tell you what to fix, what happens next, and why your step matters upstream.",
    primaryQuestion: "What do I do next?",
    highlightedEventId: "evt-1028",
    sideTitle: "What an operator is seeing",
    sideDescription:
      "Task clarity, exception context, next action, and what survives after the step is complete.",
    chips: ["next action", "exception context", "handoff preserved"],
    stageEyebrow: "Operator priority",
    stageRoleSummary:
      "This view emphasizes task clarity, missing context, and whether the next step is obvious without digging through system noise.",
    featuredFrameLabel: "Why this event is surfaced first",
    featuredFrameSummary:
      "This is the working surface: what needs attention right now, what context is preserved, and how the task rolls upward after completion.",
    continuityFocusLabel: "Continuity focus for action",
    summaryCards: [
      { id: "operator-1", label: "Current task", value: "Resolve review note" },
      { id: "operator-2", label: "Next handoff", value: "Controller review" },
      { id: "operator-3", label: "Why it matters", value: "Trace rolls upward" },
    ],
  },
} as const satisfies Record<PreviewRole, RoleStageDefinition>

const scenarioStageMap = {
  "payment-release": {
    label: "Payment release",
    topBand: ["AP lane", "Treasury handoff", "release-ready", "trace preserved"],
    stageTitle: "A payment is about to move under close pressure",
    stageDescription:
      "This is the same business movement, seen from different levels of responsibility.",
    riskLabel: "Moderate review pressure",
    continuity: [
      "Webhook received",
      "Normalized",
      "Control checks passed",
      "Ready for release",
      "Audit trace preserved",
    ],
  },
  "month-end-close": {
    label: "Month-end close",
    topBand: ["multi-entity", "exception review", "close posture", "executive confidence"],
    stageTitle: "Close activities stay visible as they roll across teams",
    stageDescription:
      "The system should hold context, posture, and evidence even when the pace gets dense.",
    riskLabel: "High coordination pressure",
    continuity: [
      "Entity scope set",
      "Exceptions reviewed",
      "Approvals aligned",
      "Close movement verified",
      "Executive confidence updated",
    ],
  },
  "audit-review": {
    label: "Audit review",
    topBand: ["trace inspection", "actor proof", "control posture", "commentary retained"],
    stageTitle: "An auditor inspects the path without reconstructing it",
    stageDescription:
      "Truth should still be visible after the event, not hidden in disconnected fragments.",
    riskLabel: "Low movement, high scrutiny",
    continuity: [
      "Source event located",
      "Actor trace confirmed",
      "Control posture inspected",
      "Commentary preserved",
      "Lineage accepted",
    ],
  },
  "integration-exception": {
    label: "Integration exception",
    topBand: ["connector degraded", "business meaning retained", "guided action", "clean escalation"],
    stageTitle: "A connector degrades, but the business truth does not disappear",
    stageDescription:
      "Even when the plumbing gets noisy, the operational meaning should remain readable.",
    riskLabel: "Elevated signal risk",
    continuity: [
      "Signal degraded",
      "Mismatch identified",
      "Business meaning retained",
      "Operator action guided",
      "Risk escalated cleanly",
    ],
  },
} as const satisfies Record<PreviewScenario, ScenarioStageDefinition>

export function getRoleStage(role: PreviewRole): RoleStageDefinition {
  return roleStageMap[role]
}

export function getScenarioStage(
  scenario: PreviewScenario,
): ScenarioStageDefinition {
  return scenarioStageMap[scenario]
}

export function getStressCopy(stress: PreviewInspectState["stress"]) {
  switch (stress) {
    case "empty":
      return {
        label: "Empty-state pressure",
        description:
          "Testing whether the surface still reads cleanly when business movement is thin.",
      }
    case "degraded":
      return {
        label: "Degraded-state pressure",
        description:
          "Testing whether signal loss or workflow friction remains readable.",
      }
    default:
      return {
        label: "Default-state pressure",
        description:
          "Normal staged product movement with complete continuity and visible proof.",
      }
  }
}

export function getInsightPriority(role: PreviewRole) {
  const priority: Record<PreviewRole, readonly string[]> = {
    controller: [
      "insight-audit-coverage",
      "insight-operator-notes",
      "insight-integration-signals",
    ],
    executive: [
      "insight-audit-coverage",
      "insight-integration-signals",
      "insight-operator-notes",
    ],
    owner: [
      "insight-operator-notes",
      "insight-audit-coverage",
      "insight-integration-signals",
    ],
    operator: [
      "insight-operator-notes",
      "insight-integration-signals",
      "insight-audit-coverage",
    ],
  }

  return priority[role]
}

export function getInsightHeading(role: PreviewRole) {
  switch (role) {
    case "controller":
      return {
        title: "Insight focus for control",
        description:
          "This stack emphasizes approval posture, trace continuity, and what survives into review.",
      }
    case "executive":
      return {
        title: "Insight focus for command",
        description:
          "This stack emphasizes confidence, integration meaning, and whether the system still rolls up cleanly.",
      }
    case "owner":
      return {
        title: "Insight focus for business clarity",
        description:
          "This stack emphasizes understandable business change, protection, and visible continuity.",
      }
    case "operator":
      return {
        title: "Insight focus for action",
        description:
          "This stack emphasizes working context, notes, and the signals that help the next step stay clear.",
      }
  }
}

export function getTopBandPriority(
  role: PreviewRole,
  scenario: PreviewScenario,
) {
  const priority: Record<PreviewRole, Record<PreviewScenario, readonly string[]>> = {
    controller: {
      "payment-release": [
        "release-ready",
        "trace preserved",
        "Treasury handoff",
        "AP lane",
      ],
      "month-end-close": [
        "exception review",
        "close posture",
        "multi-entity",
        "executive confidence",
      ],
      "audit-review": [
        "control posture",
        "actor proof",
        "trace inspection",
        "commentary retained",
      ],
      "integration-exception": [
        "guided action",
        "clean escalation",
        "business meaning retained",
        "connector degraded",
      ],
    },
    executive: {
      "payment-release": [
        "trace preserved",
        "release-ready",
        "Treasury handoff",
        "AP lane",
      ],
      "month-end-close": [
        "executive confidence",
        "close posture",
        "multi-entity",
        "exception review",
      ],
      "audit-review": [
        "trace inspection",
        "control posture",
        "actor proof",
        "commentary retained",
      ],
      "integration-exception": [
        "business meaning retained",
        "clean escalation",
        "connector degraded",
        "guided action",
      ],
    },
    owner: {
      "payment-release": [
        "release-ready",
        "trace preserved",
        "AP lane",
        "Treasury handoff",
      ],
      "month-end-close": [
        "close posture",
        "executive confidence",
        "exception review",
        "multi-entity",
      ],
      "audit-review": [
        "commentary retained",
        "trace inspection",
        "actor proof",
        "control posture",
      ],
      "integration-exception": [
        "business meaning retained",
        "guided action",
        "clean escalation",
        "connector degraded",
      ],
    },
    operator: {
      "payment-release": [
        "AP lane",
        "Treasury handoff",
        "release-ready",
        "trace preserved",
      ],
      "month-end-close": [
        "multi-entity",
        "exception review",
        "close posture",
        "executive confidence",
      ],
      "audit-review": [
        "actor proof",
        "commentary retained",
        "trace inspection",
        "control posture",
      ],
      "integration-exception": [
        "connector degraded",
        "guided action",
        "business meaning retained",
        "clean escalation",
      ],
    },
  }

  return priority[role][scenario]
}

export function getTopBandHeading(role: PreviewRole) {
  switch (role) {
    case "controller":
      return "Signal focus for approval"
    case "executive":
      return "Signal focus for command"
    case "owner":
      return "Signal focus for confidence"
    case "operator":
      return "Signal focus for action"
  }
}

export function getEvidencePriority(role: PreviewRole) {
  const priority: Record<PreviewRole, readonly string[]> = {
    controller: [
      "Control posture",
      "Actor trace",
      "Release state",
      "Scope binding",
      "Operator visibility",
      "Source",
      "Comment visibility",
      "Attribution",
    ],
    executive: [
      "Scope binding",
      "Release state",
      "Control posture",
      "Source",
      "Actor trace",
      "Operator visibility",
      "Attribution",
      "Comment visibility",
    ],
    owner: [
      "Release state",
      "Attribution",
      "Actor trace",
      "Control posture",
      "Scope binding",
      "Comment visibility",
      "Operator visibility",
      "Source",
    ],
    operator: [
      "Comment visibility",
      "Operator visibility",
      "Source",
      "Attribution",
      "Actor trace",
      "Scope binding",
      "Release state",
      "Control posture",
    ],
  }

  return priority[role]
}

export function getEvidenceHeading(role: PreviewRole) {
  switch (role) {
    case "controller":
      return "Evidence focus for approval"
    case "executive":
      return "Evidence focus for command"
    case "owner":
      return "Evidence focus for confidence"
    case "operator":
      return "Evidence focus for action"
  }
}

export function getSignalPriority(role: PreviewRole) {
  const priority: Record<PreviewRole, readonly string[]> = {
    controller: [
      "signal-reconciliation",
      "signal-audit-writer",
      "signal-workflow-bus",
      "signal-ingestion",
    ],
    executive: [
      "signal-reconciliation",
      "signal-audit-writer",
      "signal-ingestion",
      "signal-workflow-bus",
    ],
    owner: [
      "signal-reconciliation",
      "signal-workflow-bus",
      "signal-ingestion",
      "signal-audit-writer",
    ],
    operator: [
      "signal-ingestion",
      "signal-workflow-bus",
      "signal-audit-writer",
      "signal-reconciliation",
    ],
  }

  return priority[role]
}

export function getSignalHeading(role: PreviewRole) {
  switch (role) {
    case "controller":
      return {
        title: "Signal focus for approval",
        description:
          "This stack emphasizes whether the process is aligned, writable, and ready to move safely.",
      }
    case "executive":
      return {
        title: "Signal focus for command",
        description:
          "This stack emphasizes confidence, alignment, and whether telemetry still supports a governable picture.",
      }
    case "owner":
      return {
        title: "Signal focus for confidence",
        description:
          "This stack emphasizes whether the business remains understandable, protected, and moving cleanly.",
      }
    case "operator":
      return {
        title: "Signal focus for action",
        description:
          "This stack emphasizes which working signals help the next task stay clear and actionable.",
      }
  }
}

export function getScenarioBridgeContext(
  scenario: PreviewScenario,
  targetRoleShortLabel: string,
  targetScenarioLabel: string,
) {
  switch (scenario) {
    case "payment-release":
      return {
        title: `See how this release looks to ${targetRoleShortLabel}`,
        description: `Open the ${targetScenarioLabel.toLowerCase()} lens from this release decision.`,
      }
    case "month-end-close":
      return {
        title: `See how this close posture looks to ${targetRoleShortLabel}`,
        description: `Shift into the ${targetScenarioLabel.toLowerCase()} read while close pressure stays visible.`,
      }
    case "audit-review":
      return {
        title: `See how this trace looks to ${targetRoleShortLabel}`,
        description: `Same audit path in the ${targetScenarioLabel.toLowerCase()} view — truth unchanged.`,
      }
    case "integration-exception":
      return {
        title: `See how this degraded signal looks to ${targetRoleShortLabel}`,
        description: `From connector noise to the ${targetScenarioLabel.toLowerCase()} lens with meaning intact.`,
      }
  }
}

export function getPerspectiveBridgeNarrative(
  role: PreviewRole,
  scenario: PreviewScenario,
) {
  const matrix: Record<
    PreviewRole,
    Record<
      PreviewScenario,
      { readonly title: string; readonly description: string; readonly actionLabel: string }
    >
  > = {
    controller: {
      "payment-release": {
        title: "This release should still make sense above and below the approval desk.",
        description:
          "A controller view is valuable only if the same movement remains readable to the operator doing the work and the executive trusting the outcome.",
        actionLabel: "Follow this release upward",
      },
      "month-end-close": {
        title: "Close pressure should still stay legible across desks.",
        description:
          "The same close movement should preserve control logic for you, execution clarity below you, and confidence above you.",
        actionLabel: "See how close rolls upward",
      },
      "audit-review": {
        title: "The approval trace should survive scrutiny from every angle.",
        description:
          "If the control story is real, it should still make sense to the auditor, the executive, and the operator who created the work.",
        actionLabel: "Follow the trace across roles",
      },
      "integration-exception": {
        title: "Degraded signals should not break decision clarity.",
        description:
          "Even when integrations wobble, the controller should still be able to pass a clean story upward and downward.",
        actionLabel: "See the next role’s reading",
      },
    },
    executive: {
      "payment-release": {
        title: "This release should roll up into confidence, not abstraction.",
        description:
          "The executive view matters only if the same event still connects back to the people approving and doing the work.",
        actionLabel: "Step down into the working view",
      },
      "month-end-close": {
        title: "Close posture should still feel governable at every level.",
        description:
          "The business is only in command if the close story survives from entity-level confidence down to the control surface.",
        actionLabel: "See what creates this confidence",
      },
      "audit-review": {
        title: "The trace should remain coherent when you step out of summary mode.",
        description:
          "An executive should be able to move from roll-up confidence into the detailed trace without finding a different reality underneath.",
        actionLabel: "Drop into the detailed view",
      },
      "integration-exception": {
        title: "Signal degradation should not destroy command.",
        description:
          "If the system is serious, the executive story still connects down into the operational and approval surfaces cleanly.",
        actionLabel: "See how teams absorb the signal",
      },
    },
    owner: {
      "payment-release": {
        title: "Business confidence should still connect back to the desks doing the work.",
        description:
          "This movement should feel safe and understandable to you without breaking when you look up or down the chain.",
        actionLabel: "See the other desk",
      },
      "month-end-close": {
        title: "Close confidence should stay understandable across roles.",
        description:
          "The owner view should remain simple, but it should still connect cleanly to the controller and executive perspectives.",
        actionLabel: "Follow the close through roles",
      },
      "audit-review": {
        title: "The explanation should survive later questions.",
        description:
          "A business owner should be able to move into review and audit perspectives without losing the original meaning of the event.",
        actionLabel: "See how the trace survives",
      },
      "integration-exception": {
        title: "Even disruption should still make business sense.",
        description:
          "A degraded signal should still be explainable when you move from business confidence into the more operational desks.",
        actionLabel: "See how the org reads this signal",
      },
    },
    operator: {
      "payment-release": {
        title: "Your task should still make sense at the next desk up.",
        description:
          "The work you complete here should turn cleanly into controller review and then executive confidence without losing trace.",
        actionLabel: "See the next desk",
      },
      "month-end-close": {
        title: "Your close work should roll upward without translation loss.",
        description:
          "The operator view matters because it becomes the controller’s posture and the executive’s confidence later.",
        actionLabel: "Follow your work upward",
      },
      "audit-review": {
        title: "What you did should still be visible later.",
        description:
          "The operator’s notes, actions, and context should remain readable when the same event is inspected after the fact.",
        actionLabel: "See who reads this later",
      },
      "integration-exception": {
        title: "Signal problems should still leave you with a clear next action.",
        description:
          "Even when the connector is noisy, your task should remain visible and then roll upward into cleaner decision surfaces.",
        actionLabel: "See how this rolls upward",
      },
    },
  }

  return matrix[role][scenario]
}
