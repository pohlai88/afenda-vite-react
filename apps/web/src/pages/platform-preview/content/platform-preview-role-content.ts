/**
 * PLATFORM PREVIEW ROLE CONTENT
 *
 * Role-aware content matrices for AFENDA's role-play showcase.
 * Keeps role-specific wording and emphasis logic out of the page component.
 *
 * Scope:
 * - intro content
 * - closing content
 * - footer-strip content
 * - role-aware scenario teaser copy
 * - role-aware continuity emphasis
 */

import type { PreviewRole, PreviewScenario } from "../types/platform-preview-types"

export function getRoleIntroContent(role: PreviewRole) {
  const matrix: Record<
    PreviewRole,
    {
      readonly eyebrow: string
      readonly title: string
      readonly description: string
      readonly quickLabel: string
      readonly quickPoints: readonly string[]
      readonly curiosityLabel: string
      readonly curiosityText: string
    }
  > = {
    controller: {
      eyebrow: "Controller / Finance Manager lens",
      title: "See whether this process deserves approval before it moves.",
      description:
        "For readers who check readiness, trace continuity, and whether release is safe to approve.",
      quickLabel: "What you want in 30 seconds",
      quickPoints: [
        "Is the event ready to move?",
        "Is the evidence attached?",
        "Will the trace survive review?",
      ],
      curiosityLabel: "What you will probably ask next",
      curiosityText:
        "What does my CFO see on this release — and what did my operator have to fix?",
    },
    executive: {
      eyebrow: "CFO / CTO lens",
      title: "See whether this business movement rolls up into real command.",
      description:
        "For leaders who need visibility, exposure awareness, and proof the system stays governable.",
      quickLabel: "What you want in 30 seconds",
      quickPoints: [
        "Can I trust this as a command surface?",
        "Does the truth survive across roles?",
        "Does this reduce reconstruction burden?",
      ],
      curiosityLabel: "What you will probably ask next",
      curiosityText:
        "What does my controller review under this summary — and what did the operator see first?",
    },
    owner: {
      eyebrow: "Business Owner lens",
      title: "See what changed, who acted, and whether the business stayed protected.",
      description:
        "For owners who want clarity and confidence without wading through system detail.",
      quickLabel: "What you want in 30 seconds",
      quickPoints: [
        "What changed?",
        "Was the business protected?",
        "Can I understand this without system overload?",
      ],
      curiosityLabel: "What you will probably ask next",
      curiosityText:
        "What does finance check before sign-off — and what does the executive team see above this?",
    },
    operator: {
      eyebrow: "Operator / Staff lens",
      title: "See the next action, the missing context, and what happens after you finish.",
      description:
        "For people doing the work who need the next step obvious under pressure.",
      quickLabel: "What you want in 30 seconds",
      quickPoints: [
        "What do I do next?",
        "Why does it matter?",
        "What survives after I complete it?",
      ],
      curiosityLabel: "What you will probably ask next",
      curiosityText:
        "What does my controller see after this step — and how does that become executive confidence?",
    },
  }

  return matrix[role]
}

export function getRoleClosingContent(role: PreviewRole) {
  const matrix: Record<
    PreviewRole,
    {
      readonly eyebrow: string
      readonly title: string
      readonly description: string
      readonly primaryActionLabel: string
      readonly secondaryActionLabel: string
      readonly finalPrompt: string
    }
  > = {
    controller: {
      eyebrow: "Controller next step",
      title: "See whether AFENDA gives your team a cleaner approval surface.",
      description:
        "Walk the release, the evidence, and the cross-role handoff as the person responsible for saying yes with confidence.",
      primaryActionLabel: "Book a controller walkthrough",
      secondaryActionLabel: "Keep exploring approval paths",
      finalPrompt:
        "Then compare that approval surface with what your CFO sees above it and what your operator resolves below it.",
    },
    executive: {
      eyebrow: "Executive next step",
      title: "See whether AFENDA gives the business a real system of command.",
      description:
        "Walk the same movement as the person responsible for visibility, confidence, and whether the operating truth still rolls up cleanly.",
      primaryActionLabel: "Book an executive walkthrough",
      secondaryActionLabel: "Keep exploring confidence views",
      finalPrompt:
        "Then step down into the controller and operator desks to see what creates that confidence underneath.",
    },
    owner: {
      eyebrow: "Owner next step",
      title: "See whether AFENDA makes business change understandable without overload.",
      description:
        "Walk the system as the person who needs clarity, protection, and confidence without becoming buried in system detail.",
      primaryActionLabel: "Book an owner walkthrough",
      secondaryActionLabel: "Keep exploring business views",
      finalPrompt:
        "Then compare that confidence with the finance control surface and the executive roll-up above it.",
    },
    operator: {
      eyebrow: "Operator next step",
      title: "See whether AFENDA makes the work clearer while preserving what matters upstream.",
      description:
        "Walk the next action, the missing context, and the handoff path as the person doing the work under real operational pressure.",
      primaryActionLabel: "Book an operator walkthrough",
      secondaryActionLabel: "Keep exploring task flows",
      finalPrompt:
        "Then jump upward to see how your step becomes controller review and executive confidence later.",
    },
  }

  return matrix[role]
}

export function getRoleFooterStripContent(role: PreviewRole) {
  const matrix: Record<
    PreviewRole,
    ReadonlyArray<{
      readonly id: string
      readonly title: string
      readonly description: string
    }>
  > = {
    controller: [
      {
        id: "controller-footer-1",
        title: "Approval surface",
        description:
          "Readiness, trace, and posture strong enough to justify approval.",
      },
      {
        id: "controller-footer-2",
        title: "Cross-role continuity",
        description:
          "How operator work becomes controller judgment, then executive confidence.",
      },
      {
        id: "controller-footer-3",
        title: "Why AFENDA matters here",
        description:
          "Evidence travels with the movement so approval stays legible.",
      },
    ],
    executive: [
      {
        id: "executive-footer-1",
        title: "Command surface",
        description:
          "See whether one business movement still rolls up into confidence, exposure awareness, and governable operating truth.",
      },
      {
        id: "executive-footer-2",
        title: "Cross-role continuity",
        description:
          "See how controller review and operator action create the confidence you are looking at from above.",
      },
      {
        id: "executive-footer-3",
        title: "Why AFENDA matters here",
        description:
          "The system stays strategic because the summary never loses connection to the desks underneath it.",
      },
    ],
    owner: [
      {
        id: "owner-footer-1",
        title: "Business clarity",
        description:
          "See what changed, whether the business stayed protected, and whether the story still makes sense without technical overload.",
      },
      {
        id: "owner-footer-2",
        title: "Cross-role continuity",
        description:
          "See how finance control, operator work, and executive confidence stay connected to the same truth.",
      },
      {
        id: "owner-footer-3",
        title: "Why AFENDA matters here",
        description:
          "The system becomes valuable when business change remains understandable instead of disappearing into process noise.",
      },
    ],
    operator: [
      {
        id: "operator-footer-1",
        title: "Task clarity",
        description:
          "See the next action, the missing context, and the handoff path without having to decode system noise.",
      },
      {
        id: "operator-footer-2",
        title: "Cross-role continuity",
        description:
          "See how your step becomes controller review and later executive confidence without losing meaning.",
      },
      {
        id: "operator-footer-3",
        title: "Why AFENDA matters here",
        description:
          "The system helps because your work does not vanish after completion; it stays visible in the chain above you.",
      },
    ],
  }

  return matrix[role]
}

export function getScenarioRoleTeaser(
  role: PreviewRole,
  scenario: PreviewScenario,
) {
  const matrix: Record<PreviewRole, Record<PreviewScenario, string>> = {
    controller: {
      "payment-release":
        "Check readiness, evidence continuity, and whether release deserves approval.",
      "month-end-close":
        "See whether close pressure is still controlled across entities and handoffs.",
      "audit-review":
        "Confirm whether the trace is complete enough to survive scrutiny.",
      "integration-exception":
        "Decide whether degraded signals still preserve a safe approval posture.",
    },
    executive: {
      "payment-release":
        "See how one release contributes to confidence, exposure, and control coverage.",
      "month-end-close":
        "Check whether the business remains governable during dense close movement.",
      "audit-review":
        "See whether the system preserves truth without costly reconstruction.",
      "integration-exception":
        "Evaluate whether degraded plumbing still leaves command and visibility intact.",
    },
    owner: {
      "payment-release":
        "See what changed, who acted, and whether the business is still protected.",
      "month-end-close":
        "Understand whether the close remains clear without drowning in system detail.",
      "audit-review":
        "See whether the business can explain itself when questioned later.",
      "integration-exception":
        "Check whether disruption is understandable without becoming technical noise.",
    },
    operator: {
      "payment-release":
        "See the next action, what is missing, and how the work rolls upward.",
      "month-end-close":
        "Understand what your task is during close and what must be resolved next.",
      "audit-review":
        "See which notes, traces, and actions from your work still matter later.",
      "integration-exception":
        "Understand the exception clearly and what the system wants you to do next.",
    },
  }

  return matrix[role][scenario]
}

export function getScenarioContinuityPreview(
  role: PreviewRole,
  scenario: PreviewScenario,
  continuity: ReadonlyArray<string>,
) {
  const priority: Record<PreviewRole, Record<PreviewScenario, readonly string[]>> = {
    controller: {
      "payment-release": ["Control checks passed", "Ready for release", "Audit trace preserved"],
      "month-end-close": ["Exceptions reviewed", "Approvals aligned", "Close movement verified"],
      "audit-review": ["Control posture inspected", "Actor trace confirmed", "Lineage accepted"],
      "integration-exception": ["Mismatch identified", "Risk escalated cleanly", "Business meaning retained"],
    },
    executive: {
      "payment-release": ["Ready for release", "Audit trace preserved", "Control checks passed"],
      "month-end-close": ["Executive confidence updated", "Close movement verified", "Approvals aligned"],
      "audit-review": ["Lineage accepted", "Control posture inspected", "Actor trace confirmed"],
      "integration-exception": ["Business meaning retained", "Risk escalated cleanly", "Signal degraded"],
    },
    owner: {
      "payment-release": ["Ready for release", "Audit trace preserved", "Normalized"],
      "month-end-close": ["Close movement verified", "Executive confidence updated", "Exceptions reviewed"],
      "audit-review": ["Commentary preserved", "Lineage accepted", "Actor trace confirmed"],
      "integration-exception": ["Business meaning retained", "Operator action guided", "Risk escalated cleanly"],
    },
    operator: {
      "payment-release": ["Webhook received", "Normalized", "Ready for release"],
      "month-end-close": ["Entity scope set", "Exceptions reviewed", "Approvals aligned"],
      "audit-review": ["Source event located", "Commentary preserved", "Actor trace confirmed"],
      "integration-exception": ["Signal degraded", "Operator action guided", "Mismatch identified"],
    },
  }

  const preferred = priority[role][scenario]
  const ordered: string[] = []

  for (const step of preferred) {
    if (continuity.includes(step) && !ordered.includes(step)) {
      ordered.push(step)
    }
  }

  for (const step of continuity) {
    if (!ordered.includes(step)) {
      ordered.push(step)
    }
  }

  return ordered.slice(0, 3)
}
