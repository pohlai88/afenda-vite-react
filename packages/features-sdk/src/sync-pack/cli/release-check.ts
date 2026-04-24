#!/usr/bin/env node

import { printCliFindings, writeCliResult } from "../cli-output.js"
import { checkFeatureSdkPackageContract } from "../package-contract.js"

import {
  parseCliCommand,
  printCommandHelp,
  requireSyncPackCommandDefinition,
  runCli,
} from "./shared.js"

const command = requireSyncPackCommandDefinition("release-check")

await runCli(async () => {
  const cli = parseCliCommand(command)

  if (cli.helpRequested) {
    printCommandHelp(command)
    return
  }

  const result = await checkFeatureSdkPackageContract()

  writeCliResult({
    result,
    renderText: (releaseCheckResult) => {
      console.log(
        `${releaseCheckResult.contractId}: Features SDK package contract`
      )
      console.log(`Errors: ${releaseCheckResult.errorCount}`)
      console.log(`Warnings: ${releaseCheckResult.warningCount}`)
      printCliFindings(releaseCheckResult.findings)
    },
  })
}, "Feature Sync-Pack release check")
