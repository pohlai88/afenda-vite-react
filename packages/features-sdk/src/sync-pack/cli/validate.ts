#!/usr/bin/env node

import { writeCliResult } from "../cli-output.js"
import { runSyncPackValidate } from "../validate/index.js"

import {
  parseCliCommand,
  printCommandHelp,
  requireSyncPackCommandDefinition,
  runCli,
} from "./shared.js"

const command = requireSyncPackCommandDefinition("validate")

await runCli(async () => {
  const cli = parseCliCommand(command)

  if (cli.helpRequested) {
    printCommandHelp(command)
    return
  }

  const result = await runSyncPackValidate()

  writeCliResult({
    result,
    renderText: (validateResult) => {
      console.log(
        `Feature Sync-Pack seed valid: ${validateResult.candidateCount} candidates`
      )
      console.log(`Seed: ${validateResult.seedPath}`)
    },
  })
}, "Feature Sync-Pack validation")
