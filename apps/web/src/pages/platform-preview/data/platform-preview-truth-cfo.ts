import type { TruthChamberSeed } from "../types/platform-preview-orchestration-types"
import { createFixtureItem, createRail } from "./platform-preview-truth-factories"

export const cfoTruthChamberSeed = {
  chamberId: "cfo",
  chamberTitle: "CFO",
  chamberSubtitle:
    "Enterprise truth is carried under valuation pressure, deal uncertainty, and audit challenge.",
  painPoints: ["M&A", "Valuation", "Auditor dispute"],
  riskLine:
    "Risk: enterprise truth collapses when assumptions cannot survive external challenge.",
  statutoryPosture:
    "Compressed, consequential, and decision-ready under board and audit pressure.",
  visualTone: "executive consequence brief",
  entryActionLabel: "Enter chamber",
  defaultCaseId: "valuation",
  cases: [
    {
      caseId: "m-and-a",
      caseTitle: "M&A exposure",
      caseSignal: "Deal confidence is being carried on assumptions that no longer hold cleanly.",
      caseConsequence:
        "If due diligence truth drifts, the board inherits enterprise risk without a defensible deal posture.",
      rails: [
        createRail(
          "distortion",
          "Distortion",
          "The transaction narrative and diligence evidence are no longer aligned.",
          "The deal still moves forward, but the assumptions supporting price, exposure, and readiness no longer tell one coherent story.",
          "critical",
          [
            createFixtureItem("ma-distortion-target", "Target issue", "Deferred revenue exposure revised upward after diligence refresh"),
            createFixtureItem("ma-distortion-model", "Model drift", "Purchase price memo still reflects prior exposure level"),
          ]
        ),
        createRail(
          "evidence",
          "Evidence",
          "Diligence memo, model inputs, and issue log show the fracture points.",
          "The numbers exist, but the consequence chain between diligence findings and decision position is no longer stable.",
          "elevated",
          [
            createFixtureItem("ma-evidence-dd", "Diligence note", "Customer contract review expanded revenue deferral estimate"),
            createFixtureItem("ma-evidence-model", "Valuation input", "Synergy case not refreshed after diligence revision"),
          ]
        ),
        createRail(
          "governance",
          "Governance",
          "Board approval posture and deal governance are implicated.",
          "The CFO is defending whether the enterprise can still take a position that remains credible when challenged.",
          "critical",
          [
            createFixtureItem("ma-governance-board", "Board gate", "Investment committee memo requires refreshed downside case"),
            createFixtureItem("ma-governance-risk", "Risk", "Reserved matters review remains open"),
          ]
        ),
        createRail(
          "resolution",
          "Resolution",
          "Refresh the position before the enterprise carries the wrong consequence into approval.",
          "The deal case must be rebuilt around the revised facts before board-grade decision readiness returns.",
          "contained",
          [
            createFixtureItem("ma-resolution-step-1", "Step", "Refresh downside case and revised purchase price memo"),
            createFixtureItem("ma-resolution-step-2", "Next", "Re-open investment committee review"),
          ]
        ),
      ],
    },
    {
      caseId: "valuation",
      caseTitle: "Valuation under challenge",
      caseSignal: "Enterprise value is resting on assumptions that have started to fracture.",
      caseConsequence:
        "Valuation is a defendable position under challenge, not a chart outcome. When assumptions drift, decision confidence collapses.",
      rails: [
        createRail(
          "distortion",
          "Distortion",
          "The valuation headline survives while its assumptions weaken underneath.",
          "Forecast strength, discount-rate posture, and market comparables no longer support the same enterprise value with equal confidence.",
          "critical",
          [
            createFixtureItem("valuation-distortion-wacc", "Discount rate", "WACC updated upward after financing conditions changed"),
            createFixtureItem("valuation-distortion-growth", "Growth", "Terminal growth assumption still reflects prior market optimism"),
          ]
        ),
        createRail(
          "evidence",
          "Evidence",
          "Model inputs, challenge notes, and scenario outputs reveal the fragility.",
          "The valuation workbook is complete, but the challenge log shows where the enterprise position becomes hard to defend.",
          "elevated",
          [
            createFixtureItem("valuation-evidence-model", "Model", "DCF downside case now 11% below management case"),
            createFixtureItem("valuation-evidence-challenge", "Challenge", "Audit note requests support for terminal-growth posture"),
          ]
        ),
        createRail(
          "governance",
          "Governance",
          "Approval authority and external reporting readiness are implicated.",
          "The question is whether the enterprise can defend the value it is asserting to directors, auditors, and counterparties.",
          "critical",
          [
            createFixtureItem("valuation-governance-board", "Board posture", "Board pack flagged for assumption refresh before circulation"),
            createFixtureItem("valuation-governance-reporting", "Reporting posture", "Impairment sensitivity note may need expansion"),
          ]
        ),
        createRail(
          "resolution",
          "Resolution",
          "Rebuild the defendable position before using the number to govern decisions.",
          "Refresh assumptions, rerun challenge cases, and carry forward only the value that can survive review.",
          "contained",
          [
            createFixtureItem("valuation-resolution-step-1", "Step", "Re-run management, downside, and audit challenge cases"),
            createFixtureItem("valuation-resolution-step-2", "Next", "Update board and reporting sensitivity narrative"),
          ]
        ),
      ],
    },
    {
      caseId: "auditor-dispute",
      caseTitle: "Auditor dispute",
      caseSignal: "The reporting position is now contested instead of merely reviewed.",
      caseConsequence:
        "Once the issue becomes a dispute, the enterprise is defending trust, release readiness, and board confidence at the same time.",
      rails: [
        createRail(
          "distortion",
          "Distortion",
          "An unresolved challenge is blocking release confidence.",
          "The business has a position, but the auditor is no longer treating it as settled or release-ready.",
          "critical",
          [
            createFixtureItem("audit-distortion-note", "Open note", "Revenue recognition memo returned with unresolved challenge points"),
            createFixtureItem("audit-distortion-status", "Release status", "Audit completion timeline now conditional"),
          ]
        ),
        createRail(
          "evidence",
          "Evidence",
          "Memo chain, challenge log, and board briefing show where the dispute is concentrated.",
          "The issue is no longer abstract. It lives in the wording, evidence, and counter-position now being exchanged.",
          "elevated",
          [
            createFixtureItem("audit-evidence-chain", "Memo chain", "Three rounds of auditor comments remain unresolved"),
            createFixtureItem("audit-evidence-board", "Board brief", "Audit committee note flagged for special handling"),
          ]
        ),
        createRail(
          "governance",
          "Governance",
          "Audit committee path and external reporting posture are implicated.",
          "The CFO must govern whether to defend, restate, reserve, or escalate before credibility erodes further.",
          "critical",
          [
            createFixtureItem("audit-governance-committee", "Committee", "Audit committee review required before filing sign-off"),
            createFixtureItem("audit-governance-external", "External posture", "Release memo cannot close while dispute remains open"),
          ]
        ),
        createRail(
          "resolution",
          "Resolution",
          "Choose the defensible path and escalate it deliberately.",
          "This chamber resolves by position: defend, revise, reserve, or escalate through the audit committee path.",
          "contained",
          [
            createFixtureItem("audit-resolution-step-1", "Step", "Issue revised position memo or controlled reserve recommendation"),
            createFixtureItem("audit-resolution-step-2", "Next", "Escalate final posture to audit committee"),
          ]
        ),
      ],
    },
  ],
} as const satisfies TruthChamberSeed
