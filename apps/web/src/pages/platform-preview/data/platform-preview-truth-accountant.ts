import type { TruthChamberSeed } from "../types/platform-preview-orchestration-types"
import { createFixtureItem, createRail } from "./platform-preview-truth-factories"

export const accountantTruthChamberSeed = {
  chamberId: "accountant",
  chamberTitle: "Accountant",
  chamberSubtitle:
    "Transaction truth breaks here first when classification, matching, and entity alignment drift.",
  painPoints: [
    "Wrong account class posting",
    "3-way matching",
    "Intercompany transfer",
  ],
  riskLine: "Risk: transaction truth breaks before reporting even starts to form.",
  statutoryPosture:
    "Closest to the originating event, evidence-heavy, and intolerant of loose classification.",
  visualTone: "forensic workbench",
  entryActionLabel: "Enter chamber",
  defaultCaseId: "wrong-account-class-posting",
  cases: [
    {
      caseId: "wrong-account-class-posting",
      caseTitle: "Wrong account class posting",
      caseSignal: "Classification drift contaminates downstream truth.",
      caseConsequence:
        "One misclassified entry contaminates reporting logic, approval context, and external confidence.",
      rails: [
        createRail(
          "distortion",
          "Distortion",
          "Invoice posted into the wrong account class.",
          "The originating business event is real, but its classification has drifted into the wrong ledger meaning.",
          "critical",
          [
            createFixtureItem(
              "acct-distortion-invoice",
              "Invoice",
              "INV-44018 staged to office supplies instead of trade payables"
            ),
            createFixtureItem(
              "acct-distortion-trigger",
              "Trigger",
              "Auto-posting rule inherited the wrong account class"
            ),
          ]
        ),
        createRail(
          "evidence",
          "Evidence",
          "Source documents prove the event but not the classification.",
          "The PO, goods receipt, vendor invoice, and ledger entry agree on the business event while the account class diverges.",
          "elevated",
          [
            createFixtureItem("acct-evidence-po", "PO", "PO-22941 approved against raw materials"),
            createFixtureItem("acct-evidence-grn", "GRN", "GRN-11804 confirms receipt for the same item class"),
            createFixtureItem("acct-evidence-journal", "Ledger entry", "JE-8193 routed to office supplies expense"),
          ]
        ),
        createRail(
          "governance",
          "Governance",
          "Chart-of-accounts policy and posting control are implicated.",
          "This is not a cosmetic cleanup. It is a breach of classification policy that changes what the transaction means downstream.",
          "critical",
          [
            createFixtureItem("acct-governance-policy", "Policy", "COA policy requires raw-material invoices to resolve to trade payables"),
            createFixtureItem("acct-governance-control", "Control", "Posting-rule exception threshold exceeded"),
          ]
        ),
        createRail(
          "resolution",
          "Resolution",
          "Reclassify, revalidate, and hold release until the ledger meaning is repaired.",
          "The line cannot progress until the account class, evidence chain, and downstream release logic realign.",
          "contained",
          [
            createFixtureItem("acct-resolution-step-1", "Step", "Reverse JE-8193 and repost with corrected account class"),
            createFixtureItem("acct-resolution-step-2", "Next", "Re-run approval and release checks after repost"),
          ]
        ),
      ],
    },
    {
      caseId: "three-way-matching",
      caseTitle: "3-way matching failure",
      caseSignal: "Document trail is incomplete at the point of liability.",
      caseConsequence:
        "Without document integrity, the liability cannot be defended when questioned by audit or procurement governance.",
      rails: [
        createRail(
          "distortion",
          "Distortion",
          "The liability exists in the queue without a complete 3-way match.",
          "An invoice is present, but one leg of the PO, receipt, or invoice chain is missing or inconsistent.",
          "critical",
          [
            createFixtureItem("match-distortion-invoice", "Invoice", "INV-22104 ready for posting"),
            createFixtureItem("match-distortion-gap", "Gap", "Receipt quantity differs from invoice quantity by 14%"),
          ]
        ),
        createRail(
          "evidence",
          "Evidence",
          "The document set shows where the mismatch begins.",
          "The PO amount, receiving confirmation, and vendor invoice all exist, but they no longer tell the same story.",
          "elevated",
          [
            createFixtureItem("match-evidence-po", "PO", "PO-11871 approved at 480 units"),
            createFixtureItem("match-evidence-receipt", "Receipt", "GRN-44102 confirms 412 units received"),
            createFixtureItem("match-evidence-invoice", "Invoice", "Vendor billed 480 units in full"),
          ]
        ),
        createRail(
          "governance",
          "Governance",
          "3-way matching discipline is the governing control.",
          "A payable cannot move forward while procurement evidence and liability recognition disagree on the same event.",
          "critical",
          [
            createFixtureItem("match-governance-policy", "Control", "3-way match required for any release above delegated threshold"),
            createFixtureItem("match-governance-owner", "Owner", "Procurement operations must confirm receiving variance"),
          ]
        ),
        createRail(
          "resolution",
          "Resolution",
          "Hold release and force the source trail back into alignment.",
          "The next step is not acceleration. It is reconciliation across PO, receipt, and invoice before liability proceeds.",
          "contained",
          [
            createFixtureItem("match-resolution-step-1", "Step", "Freeze payable release pending variance explanation"),
            createFixtureItem("match-resolution-step-2", "Next", "Obtain corrected receipt or vendor credit before repost"),
          ]
        ),
      ],
    },
    {
      caseId: "intercompany-transfer",
      caseTitle: "Intercompany transfer drift",
      caseSignal:
        "Entity-to-entity movement no longer agrees on both sides of the transfer.",
      caseConsequence:
        "When intercompany truth splits across entities, eliminations and reporting confidence fail later under pressure.",
      rails: [
        createRail(
          "distortion",
          "Distortion",
          "The sending and receiving entities no longer describe the same transfer.",
          "Cash or inventory moved, but the paired entity entries now disagree on amount, timing, or purpose.",
          "critical",
          [
            createFixtureItem("intercompany-distortion-send", "Sending entity", "Acme Holdings posted THB 4.2m transfer out"),
            createFixtureItem("intercompany-distortion-receive", "Receiving entity", "Acme Treasury Ltd recognized THB 3.8m transfer in"),
          ]
        ),
        createRail(
          "evidence",
          "Evidence",
          "Both sides of the movement are visible and inconsistent.",
          "Bank instruction, entity ledgers, and transfer memo all exist, but the paired entries cannot be reconciled one-to-one.",
          "elevated",
          [
            createFixtureItem("intercompany-evidence-bank", "Bank instruction", "IFT-2049 settled on Apr 13"),
            createFixtureItem("intercompany-evidence-ledger", "Ledger pair", "JE-7719 and JE-7720 no longer align"),
          ]
        ),
        createRail(
          "governance",
          "Governance",
          "Intercompany policy requires mirrored recognition and elimination readiness.",
          "A transfer is not valid simply because cash moved. It must be defensible across both ledgers and their elimination path.",
          "critical",
          [
            createFixtureItem("intercompany-governance-policy", "Policy", "Intercompany movements require mirrored entity ledger entries within same close window"),
            createFixtureItem("intercompany-governance-close", "Close impact", "Elimination package blocked until paired entries match"),
          ]
        ),
        createRail(
          "resolution",
          "Resolution",
          "Repair the mirrored entity entries before close logic inherits the distortion.",
          "The transfer remains under hold until both entities and the elimination path tell the same story.",
          "contained",
          [
            createFixtureItem("intercompany-resolution-step-1", "Step", "Reverse and repost receiving-entity entry to match the sending ledger entry"),
            createFixtureItem("intercompany-resolution-step-2", "Next", "Re-run elimination preview before release"),
          ]
        ),
      ],
    },
  ],
} as const satisfies TruthChamberSeed
