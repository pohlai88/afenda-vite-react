/**
 * PLATFORM PREVIEW ROLE-PLAY DATA
 *
 * Shared role and scenario definitions for AFENDA's role-play showcase.
 * Keeps page composition thinner and prevents drift between:
 * - role entry cards
 * - scenario switching
 * - cross-role curiosity bridges
 * - future inspect / supervision controls
 */

import type {
  PreviewRole,
  PreviewRoleCard,
  PreviewScenario,
  PreviewScenarioDefinition,
} from "../types/platform-preview-types"

export const previewRoleCards: ReadonlyArray<PreviewRoleCard> = [
  {
    id: "controller",
    label: "Controller / Finance Manager",
    shortLabel: "Controller",
    iconKey: "shield-check",
    summary: "See the control posture before approval.",
    hook: "You care about readiness, evidence, handoff, and whether release should move now.",
    question: "Can I trust this process before it advances?",
    whatYouSee: [
      "control checks and release posture",
      "scope, role, and entity context",
      "operator notes tied to the event",
      "evidence continuity before approval",
    ],
    bridgeUp: {
      label: "Curious what your CFO sees from this same release?",
      targetRole: "executive",
      targetScenario: "month-end-close",
      teaser: "See how one release becomes entity-level confidence and exception posture.",
    },
    bridgeDown: {
      label: "See what your operator must resolve before you approve.",
      targetRole: "operator",
      targetScenario: "payment-release",
      teaser: "Drop into the working surface where the next action and missing context appear.",
    },
  },
  {
    id: "executive",
    label: "CFO / CTO",
    shortLabel: "Executive",
    iconKey: "building-2",
    summary: "See whether the business is visible, governable, and scalable.",
    hook: "You care about confidence, exposure, operating discipline, and whether this becomes a serious control surface.",
    question: "Can I trust this as a system of command?",
    whatYouSee: [
      "roll-up confidence and exception posture",
      "entity-level visibility and control coverage",
      "whether evidence survives across workflows",
      "how much reconstruction work the business still carries",
    ],
    bridgeDown: {
      label: "See the controller’s decision surface beneath this summary.",
      targetRole: "controller",
      targetScenario: "payment-release",
      teaser: "Move from roll-up confidence into the actual approval posture that creates it.",
    },
  },
  {
    id: "owner",
    label: "Business Owner",
    shortLabel: "Owner",
    iconKey: "briefcase-business",
    summary: "See what changed, who acted, and whether the business is protected.",
    hook: "You care about clarity, confidence, and knowing the business is not drifting into blind spots.",
    question: "Can I understand what matters without learning the whole system?",
    whatYouSee: [
      "business impact without system overload",
      "who acted and whether controls held",
      "whether movement is safe and attributable",
      "how decisions roll into business confidence",
    ],
    bridgeUp: {
      label: "See the executive roll-up this operating truth becomes.",
      targetRole: "executive",
      targetScenario: "month-end-close",
      teaser: "Jump from business clarity into the broader confidence and exposure view.",
    },
    bridgeDown: {
      label: "See what your finance lead checks before sign-off.",
      targetRole: "controller",
      targetScenario: "payment-release",
      teaser: "Reveal the control surface that sits between work completion and approval.",
    },
  },
  {
    id: "operator",
    label: "Operator / Staff",
    shortLabel: "Operator",
    iconKey: "users",
    summary: "See the next action, the context, and what happens after you complete it.",
    hook: "You care about doing the work clearly, resolving exceptions quickly, and not getting lost in system noise.",
    question: "What do I do next, and does the system help me do it right?",
    whatYouSee: [
      "the task queue and next action",
      "what is missing and why it matters",
      "how the task rolls up to approval",
      "what survives after you finish your step",
    ],
    bridgeUp: {
      label: "See what your controller reviews before approval.",
      targetRole: "controller",
      targetScenario: "payment-release",
      teaser: "Move upward into readiness, evidence continuity, and release posture.",
    },
    bridgeDown: {
      label: "See the business owner’s simplified confidence view.",
      targetRole: "owner",
      targetScenario: "audit-review",
      teaser: "Switch to the simpler business-facing view of what changed and why it is safe.",
    },
  },
] as const

export const previewScenarioDefinitions: ReadonlyArray<PreviewScenarioDefinition> = [
  {
    id: "payment-release",
    label: "Payment release",
    summary:
      "A payment moves through readiness, control, and treasury handoff under close pressure.",
    continuity: [
      "Webhook received",
      "Normalized",
      "Control checks passed",
      "Ready for release",
      "Audit trace preserved",
    ],
  },
  {
    id: "month-end-close",
    label: "Month-end close",
    summary:
      "Close activities roll across teams while scope, posture, and evidence remain visible.",
    continuity: [
      "Entity scope set",
      "Exceptions reviewed",
      "Approvals aligned",
      "Close movement verified",
      "Executive confidence updated",
    ],
  },
  {
    id: "audit-review",
    label: "Audit review",
    summary:
      "An auditor inspects the event path without reconstructing scattered fragments from other tools.",
    continuity: [
      "Source event located",
      "Actor trace confirmed",
      "Control posture inspected",
      "Commentary preserved",
      "Lineage accepted",
    ],
  },
  {
    id: "integration-exception",
    label: "Integration exception",
    summary:
      "A connector degrades, but business continuity and traceability still remain visible.",
    continuity: [
      "Signal degraded",
      "Mismatch identified",
      "Business meaning retained",
      "Operator action guided",
      "Risk escalated cleanly",
    ],
  },
] as const

export function getPreviewRoleCard(role: PreviewRole): PreviewRoleCard {
  return previewRoleCards.find((item) => item.id === role) ?? previewRoleCards[0]
}

export function getPreviewScenarioDefinition(
  scenario: PreviewScenario,
): PreviewScenarioDefinition {
  return (
    previewScenarioDefinitions.find((item) => item.id === scenario) ??
    previewScenarioDefinitions[0]
  )
}
