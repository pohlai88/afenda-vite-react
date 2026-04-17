import type { TruthChamberSeed } from "../types/platform-preview-orchestration-types"
import { createFixtureItem, createRail } from "./platform-preview-truth-factories"

export const controllerTruthChamberSeed = {
  chamberId: "controller",
  chamberTitle: "Controller",
  chamberSubtitle:
    "Reporting truth fails when books, period discipline, disclosure structure, and digital reporting rules drift apart.",
  painPoints: ["Fiscal period drift", "IFRS reporting", "XBRL tagging"],
  riskLine:
    "Risk: reporting truth fails before statements are released under challenge.",
  statutoryPosture:
    "Statutory center of gravity with period-lock tension, disclosure discipline, and release-readiness control.",
  visualTone: "reporting command table",
  entryActionLabel: "Enter chamber",
  defaultCaseId: "fiscal-period-drift",
  cases: [
    {
      caseId: "fiscal-period-drift",
      caseTitle: "Fiscal period drift",
      caseSignal: "Postings are crossing the reporting boundary they should have respected.",
      caseConsequence:
        "A period boundary breach is a reporting integrity failure, not a harmless timing issue.",
      rails: [
        createRail(
          "distortion",
          "Distortion",
          "Transactions crossed into the wrong fiscal boundary.",
          "Recognition timing has drifted across the period lock, altering what belongs inside the reporting package.",
          "critical",
          [
            createFixtureItem("controller-distortion-close", "Close window", "April close locked at 18:00 ICT"),
            createFixtureItem("controller-distortion-posting", "Late posting", "JE-5521 entered at 18:14 ICT but stamped into April"),
          ]
        ),
        createRail(
          "evidence",
          "Evidence",
          "Calendar, lock state, and posting trail show the drift clearly.",
          "The close calendar, approval log, and posting timestamps agree that the transaction entered after the governed boundary.",
          "elevated",
          [
            createFixtureItem("controller-evidence-calendar", "Calendar", "April close authority ended Apr 30, 18:00 ICT"),
            createFixtureItem("controller-evidence-lock", "Period lock", "Ledger lock engaged before the late entry arrived"),
            createFixtureItem("controller-evidence-log", "Audit trail", "Override token was not issued"),
          ]
        ),
        createRail(
          "governance",
          "Governance",
          "Close governance and reporting presentation discipline are implicated.",
          "The controller is defending reporting period integrity, not merely queue timing. The package cannot be trusted while the boundary is loose.",
          "critical",
          [
            createFixtureItem("controller-governance-close", "Close policy", "Period lock exceptions require controller override and disclosure note"),
            createFixtureItem("controller-governance-release", "Release posture", "Package status remains blocked until drift is resolved"),
          ]
        ),
        createRail(
          "resolution",
          "Resolution",
          "Lock, adjust, and certify only after the boundary is repaired.",
          "The entry must be moved to the correct period or formally overridden with governed evidence before the reporting package proceeds.",
          "contained",
          [
            createFixtureItem("controller-resolution-step-1", "Step", "Reverse late entry from the April package"),
            createFixtureItem("controller-resolution-step-2", "Next", "Repost into May or issue controlled override memo"),
          ]
        ),
      ],
    },
    {
      caseId: "ifrs-reporting",
      caseTitle: "IFRS reporting posture",
      caseSignal: "Presentation and disclosure structure are drifting from governed policy.",
      caseConsequence:
        "Reporting truth fails when statements are assembled without defensible presentation and disclosure posture.",
      rails: [
        createRail(
          "distortion",
          "Distortion",
          "The reporting package is internally complete but externally indefensible.",
          "Amounts reconcile, yet the structure of presentation and disclosure no longer aligns with the governed reporting position.",
          "critical",
          [
            createFixtureItem("ifrs-distortion-package", "Package", "Q2 statement draft assembled without updated disclosure block"),
            createFixtureItem("ifrs-distortion-drift", "Drift", "Financing vs operating presentation note omitted"),
          ]
        ),
        createRail(
          "evidence",
          "Evidence",
          "Disclosure package and reporting assembly disagree on what is ready.",
          "Narrative note tables, statement draft, and release checklist are present, but their structure no longer matches one governed reporting story.",
          "elevated",
          [
            createFixtureItem("ifrs-evidence-statement", "Statement draft", "Primary statements regenerated after classification update"),
            createFixtureItem("ifrs-evidence-note", "Disclosure note", "Supporting note matrix still reflects prior presentation"),
          ]
        ),
        createRail(
          "governance",
          "Governance",
          "Presentation and disclosure policy must govern release readiness.",
          "This chamber is defending defensibility under IFRS presentation and disclosure requirements, not just numerical reconciliation.",
          "critical",
          [
            createFixtureItem("ifrs-governance-policy", "Policy", "Presentation memo requires aligned statement and note structure before release"),
            createFixtureItem("ifrs-governance-review", "Review gate", "Controller certification blocked pending disclosure alignment"),
          ]
        ),
        createRail(
          "resolution",
          "Resolution",
          "Repair disclosure structure before certifying the package.",
          "Statements, notes, and release memo must return to one defensible reporting posture before sign-off resumes.",
          "contained",
          [
            createFixtureItem("ifrs-resolution-step-1", "Step", "Rebuild disclosure note matrix against updated presentation memo"),
            createFixtureItem("ifrs-resolution-step-2", "Next", "Re-run controller certification checklist"),
          ]
        ),
      ],
    },
    {
      caseId: "xbrl-tagging",
      caseTitle: "XBRL tagging exception",
      caseSignal:
        "Digital reporting structure no longer matches the governed financial statement meaning.",
      caseConsequence:
        "Tagging is not decoration. When the machine-readable structure drifts, comparability and release defensibility fail together.",
      rails: [
        createRail(
          "distortion",
          "Distortion",
          "Taxonomy tags no longer express the same reporting meaning as the statement.",
          "The digital reporting layer still exists, but it has started saying something different from the human-readable statements.",
          "critical",
          [
            createFixtureItem("xbrl-distortion-tag", "Tag drift", "Statement line mapped to outdated taxonomy concept"),
            createFixtureItem("xbrl-distortion-impact", "Impact", "Digital filing preview shows financing cash flow under operating activities"),
          ]
        ),
        createRail(
          "evidence",
          "Evidence",
          "Statement line, taxonomy map, and filing preview disagree visibly.",
          "The reporting package is internally coherent until the machine-readable map is rendered and the wrong concept becomes visible.",
          "elevated",
          [
            createFixtureItem("xbrl-evidence-line", "Statement line", "Financing cash flow line updated in the release draft"),
            createFixtureItem("xbrl-evidence-map", "Taxonomy map", "Still bound to previous operating-activity concept"),
            createFixtureItem("xbrl-evidence-preview", "Filing preview", "External filing preview diverges from PDF release draft"),
          ]
        ),
        createRail(
          "governance",
          "Governance",
          "Taxonomy control and digital reporting readiness are implicated.",
          "The controller is responsible for making sure tagged reporting remains structurally true, machine-readable, and defensible.",
          "critical",
          [
            createFixtureItem("xbrl-governance-control", "Control", "Taxonomy validation must pass before release package is marked ready"),
            createFixtureItem("xbrl-governance-standard", "Posture", "Digital filing must preserve the same financial meaning as the governed statements"),
          ]
        ),
        createRail(
          "resolution",
          "Resolution",
          "Retag, validate, and release only after the filing structure matches the statement truth.",
          "The digital layer must be repaired before the package can be defended as ready for external challenge.",
          "contained",
          [
            createFixtureItem("xbrl-resolution-step-1", "Step", "Rebind affected lines to the correct taxonomy concepts"),
            createFixtureItem("xbrl-resolution-step-2", "Next", "Re-run filing validation and filing preview review"),
          ]
        ),
      ],
    },
  ],
} as const satisfies TruthChamberSeed
