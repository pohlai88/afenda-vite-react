#!/usr/bin/env node

import { generateCandidateReport } from "../generator/generate-report.js"
import { readSeedCandidates } from "../workspace.js"

import {
  parseCliCommand,
  printCommandHelp,
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
  console.log(generateCandidateReport(candidates))
}, "Feature Sync-Pack report")
