#!/usr/bin/env node

import { checkGeneratedPacks } from "../check/pack-check.js"
import { printCliFindings, writeCliResult } from "../cli-output.js"

import {
  parseCliCommand,
  printCommandHelp,
  requireSyncPackCommandDefinition,
  runCli,
} from "./shared.js"

const command = requireSyncPackCommandDefinition("check")

await runCli(async () => {
  const cli = parseCliCommand(command)

  if (cli.helpRequested) {
    printCommandHelp(command)
    return
  }

  const result = await checkGeneratedPacks({
    packsRoot: cli.getOptionValue("--pack"),
  })

  writeCliResult({
    result,
    renderText: (checkResult) => {
      console.log(
        `Sync-Pack check inspected ${checkResult.checkedPackCount} pack(s).`
      )
      console.log(`Errors: ${checkResult.errorCount}`)
      console.log(`Warnings: ${checkResult.warningCount}`)
      printCliFindings(checkResult.findings)
    },
  })
}, "Feature Sync-Pack check")
