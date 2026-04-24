#!/usr/bin/env node

import { printCliFindings, writeCliResult } from "../cli-output.js"
import {
  syncGoldenExampleFitness,
  type SyncGoldenExampleFitnessResult,
} from "../example-fitness/index.js"

import {
  parseCliCommand,
  printCommandHelp,
  requireSyncPackCommandDefinition,
  runCli,
} from "./shared.js"

const command = requireSyncPackCommandDefinition("sync-examples")

function renderSyncExamplesText(result: SyncGoldenExampleFitnessResult): void {
  console.log("Feature Sync-Pack golden example sync")
  console.log("")
  console.log(`Registry: ${result.registryPath}`)
  console.log(`Guide: ${result.guidePath}`)
  console.log(`Examples synced: ${result.packCount}`)
  console.log(`Errors: ${result.errorCount}`)
  console.log(`Warnings: ${result.warningCount}`)
  console.log("")
  printCliFindings(result.findings)
}

await runCli(async () => {
  const cli = parseCliCommand(command)

  if (cli.helpRequested) {
    printCommandHelp(command)
    return
  }

  const result = await syncGoldenExampleFitness()

  writeCliResult({
    result,
    renderText: renderSyncExamplesText,
  })
}, "Feature Sync-Pack golden example sync")
