#!/usr/bin/env node

import { writeCliResult } from "../cli-output.js"
import {
  runSyncPackIntentCheck,
  type SyncPackIntentCheckFinding,
  type SyncPackIntentCheckResult,
} from "../intent/index.js"

import {
  parseCliCommand,
  printCommandHelp,
  requireSyncPackCommandDefinition,
  runCli,
} from "./shared.js"

const command = requireSyncPackCommandDefinition("intent-check")

function renderFindingList(
  findings: readonly SyncPackIntentCheckFinding[]
): void {
  if (findings.length === 0) {
    console.log("  None.")
    return
  }

  for (const finding of findings) {
    const location = finding.filePath ? ` [${finding.filePath}]` : ""
    console.log(`  - ${finding.code}: ${finding.message}${location}`)

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

function renderIntentCheckText(result: SyncPackIntentCheckResult): void {
  console.log("Feature Sync-Pack intent check")
  console.log("")
  console.log(`VERDICT: ${result.verdict.toUpperCase()}`)
  console.log(`CONTRACT: ${result.contractId}`)
  console.log("")
  console.log("WHY:")

  if (result.changedFiles.length === 0) {
    console.log("  - No git worktree changes were detected.")
  } else if (result.verdict === "pass") {
    console.log(
      `  - Changed files are covered by non-draft intent updates: ${result.matchedIntentIds.join(", ") || "none"}.`
    )
  } else {
    console.log(
      `  - Git worktree changes were detected, but valid non-draft intent coverage is incomplete.`
    )
  }

  console.log("")
  console.log("WHAT BROKE:")
  renderFindingList(
    result.findings.filter((finding) => finding.severity === "error")
  )

  console.log("")
  console.log("HOW TO FIX:")

  const remediations = result.findings
    .map((finding) => finding.remediation)
    .filter((remediation): remediation is NonNullable<typeof remediation> =>
      Boolean(remediation)
    )

  if (remediations.length === 0) {
    console.log("  None required.")
  } else {
    for (const remediation of remediations) {
      console.log(`  - ${remediation.action}`)

      if (remediation.command) {
        console.log(`    command: ${remediation.command}`)
      }

      if (remediation.doc) {
        console.log(`    doc: ${remediation.doc}`)
      }
    }
  }

  console.log("")
  console.log("EVIDENCE:")

  if (result.changedFiles.length === 0) {
    console.log("  - clean worktree")
  } else {
    for (const changedFile of result.changedFiles) {
      console.log(`  - ${changedFile}`)
    }
  }

  if (result.matchedIntentIds.length > 0) {
    console.log("  - matched intents:")

    for (const intentId of result.matchedIntentIds) {
      console.log(`    - ${intentId}`)
    }
  }
}

await runCli(async () => {
  const cli = parseCliCommand(command)

  if (cli.helpRequested) {
    printCommandHelp(command)
    return
  }

  const result = await runSyncPackIntentCheck()

  writeCliResult({
    result,
    renderText: renderIntentCheckText,
  })
}, "Feature Sync-Pack intent check")
