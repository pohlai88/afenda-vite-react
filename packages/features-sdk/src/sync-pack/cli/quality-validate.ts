#!/usr/bin/env node

import { writeCliResult } from "../cli-output.js"
import {
  runSyncPackQualityValidation,
  type SyncPackQualityValidationFinding,
  type SyncPackQualityValidationResult,
  type SyncPackQualityValidationStepResult,
} from "../quality-validation/index.js"

import {
  parseCliCommand,
  printCommandHelp,
  requireSyncPackCommandDefinition,
  runCli,
} from "./shared.js"

const command = requireSyncPackCommandDefinition("quality-validate")

function formatStepLabel(step: SyncPackQualityValidationStepResult): string {
  return `${step.phase.padEnd(9)} ${step.name.padEnd(16)} ${step.status.toUpperCase().padEnd(4)} (${step.errorCount} blocking, ${step.warningCount} non-blocking)`
}

function renderFindingList(
  findings: readonly SyncPackQualityValidationFinding[]
): void {
  if (findings.length === 0) {
    console.log("  None.")
    return
  }

  for (const finding of findings) {
    const location = finding.filePath ? ` [${finding.filePath}]` : ""
    console.log(
      `  - ${finding.step}/${finding.code}: ${finding.message}${location}`
    )
    console.log(`    owner: ${finding.owner}`)
    console.log(`    disposition: ${finding.disposition}`)

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
}

function renderQualityValidationText(
  result: SyncPackQualityValidationResult
): void {
  console.log("Feature Sync-Pack quality validation")
  console.log("")

  if (result.selectedCandidate) {
    console.log("Operator validation seed:")
    console.log(
      `  ${result.selectedCandidate.id} (${result.selectedCandidate.category}, ${result.selectedCandidate.lane})`
    )
    console.log("")
  }

  console.log("Commands executed:")

  for (const step of result.steps) {
    console.log(`  - ${formatStepLabel(step)}`)
    console.log(`    command: ${step.command}`)
  }

  console.log("")
  console.log("Blocking findings:")
  renderFindingList(result.blockingFindings)

  console.log("")
  console.log("Non-blocking findings:")
  renderFindingList(result.nonBlockingFindings)

  console.log("")
  console.log("Evidence:")

  for (const evidencePath of result.evidencePaths) {
    console.log(`  - ${evidencePath}`)
  }

  console.log("")
  console.log("Closure:")

  if (result.verdict === "pass") {
    console.log("  PASS -> package is eligible to move into Next roadmap work.")
  } else if (result.verdict === "warn") {
    console.log(
      "  WARN -> package may proceed, but tracked warnings remain visible and must be owned."
    )
  } else {
    console.log("  FAIL -> stop and fix blocking findings before promotion.")
  }

  console.log("")
  console.log("Final verdict:")
  console.log(
    `  ${result.verdict.toUpperCase()} (${result.errorCount} blocking findings, ${result.warningCount} non-blocking warnings)`
  )
}

await runCli(async () => {
  const cli = parseCliCommand(command)

  if (cli.helpRequested) {
    printCommandHelp(command)
    return
  }

  const result = await runSyncPackQualityValidation({
    includePreflight: cli.hasFlag("--preflight"),
  })

  writeCliResult({
    result,
    renderText: renderQualityValidationText,
  })
}, "Feature Sync-Pack quality validation")
