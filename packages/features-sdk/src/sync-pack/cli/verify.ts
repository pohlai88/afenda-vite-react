#!/usr/bin/env node

import { writeCliResult } from "../cli-output.js"
import {
  runSyncPackVerify,
  type SyncPackVerifyFinding,
  type SyncPackVerifyResult,
  type SyncPackVerifyStepResult,
} from "../verify/index.js"

import {
  parseCliCommand,
  printCommandHelp,
  requireSyncPackCommandDefinition,
  runCli,
} from "./shared.js"

const command = requireSyncPackCommandDefinition("verify")

function formatStepLabel(step: SyncPackVerifyStepResult): string {
  return `${step.name.padEnd(14)} ${step.status.toUpperCase().padEnd(4)} (${step.errorCount} errors, ${step.warningCount} warnings)`
}

function renderFindingList(findings: readonly SyncPackVerifyFinding[]): void {
  const limitedFindings = findings.slice(0, 5)

  for (const finding of limitedFindings) {
    const location = finding.filePath ? ` [${finding.filePath}]` : ""
    console.log(
      `  - ${finding.step}/${finding.code}: ${finding.message}${location}`
    )

    if (finding.remediation) {
      console.log(`    remediation: ${finding.remediation.action}`)

      if (finding.remediation.command) {
        console.log(`    command: ${finding.remediation.command}`)
      }

      if (finding.remediation.doc) {
        console.log(`    doc: ${finding.remediation.doc}`)
      }
    }
  }

  if (findings.length > limitedFindings.length) {
    console.log(
      `  - ${findings.length - limitedFindings.length} more findings not shown`
    )
  }
}

function renderVerifyText(result: SyncPackVerifyResult): void {
  const passedSteps = result.steps.filter((step) => step.status === "pass")
  const warnedSteps = result.steps.filter((step) => step.status === "warn")
  const failedSteps = result.steps.filter((step) => step.status === "fail")

  console.log("Feature Sync-Pack verify")
  console.log("")
  console.log("What ran?")

  for (const [index, step] of result.steps.entries()) {
    console.log(`  ${index + 1}. ${formatStepLabel(step)}`)
  }

  console.log("")
  console.log("What passed?")

  if (passedSteps.length === 0) {
    console.log("  None.")
  } else {
    for (const step of passedSteps) {
      console.log(`  - ${step.name}`)
    }
  }

  console.log("")
  console.log("What warned?")

  if (warnedSteps.length === 0) {
    console.log("  None.")
  } else {
    for (const step of warnedSteps) {
      console.log(`  - ${step.name} (${step.warningCount} warnings)`)
      renderFindingList(
        step.findings.filter((finding) => finding.severity === "warning")
      )
    }
  }

  console.log("")
  console.log("What failed?")

  if (failedSteps.length === 0) {
    console.log("  None.")
  } else {
    for (const step of failedSteps) {
      console.log(`  - ${step.name} (${step.errorCount} errors)`)
      renderFindingList(
        step.findings.filter((finding) => finding.severity === "error")
      )
    }
  }

  console.log("")
  console.log("What to fix next?")

  if (result.verdict === "fail") {
    console.log(
      "  Fix the failed step findings above, then rerun pnpm run feature-sync:verify."
    )
  } else if (result.verdict === "warn") {
    console.log(
      "  No blocking fixes required. Review warnings if you want a cleaner internal workspace."
    )
  } else {
    console.log("  No fixes required. The internal operator workflow is green.")
  }

  console.log("")
  console.log("Final verdict:")
  console.log(
    `  ${result.verdict.toUpperCase()} (${result.errorCount} errors, ${result.warningCount} warnings)`
  )
}

await runCli(async () => {
  const cli = parseCliCommand(command)

  if (cli.helpRequested) {
    printCommandHelp(command)
    return
  }

  const result = await runSyncPackVerify()

  writeCliResult({
    result,
    renderText: renderVerifyText,
  })
}, "Feature Sync-Pack verify")
