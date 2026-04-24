#!/usr/bin/env node

import { filterCandidates } from "../candidate-selection.js"
import { generateCandidateReport } from "../generator/generate-report.js"
import { readSeedCandidates } from "../workspace.js"

import {
  formatCandidateSelectionSummary,
  parseCliCommand,
  printCommandHelp,
  readCandidateSelection,
  requireSyncPackCommandDefinition,
  runCli,
} from "./shared.js"

const command = requireSyncPackCommandDefinition("report")

await runCli(async () => {
  const cli = parseCliCommand(command)

  if (cli.helpRequested) {
    printCommandHelp(command)
    return
  }

  const candidates = await readSeedCandidates()
  const selection = readCandidateSelection(cli)
  const selectedCandidates = filterCandidates(candidates, selection)

  if (selectedCandidates.length === 0) {
    throw new Error(
      `No candidates matched the requested filters (${formatCandidateSelectionSummary(selection)}).`
    )
  }

  const report = generateCandidateReport(candidates, { filters: selection })
  console.log(report)
}, "Feature Sync-Pack report")
