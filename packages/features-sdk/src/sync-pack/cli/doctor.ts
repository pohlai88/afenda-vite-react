#!/usr/bin/env node

import { runSyncPackDoctor } from "../doctor/stack-doctor.js"
import { printCliFindings, writeCliResult } from "../cli-output.js"

import {
  parseCliCommand,
  printCommandHelp,
  requireSyncPackCommandDefinition,
  runCli,
} from "./shared.js"

const command = requireSyncPackCommandDefinition("doctor")

await runCli(async () => {
  const cli = parseCliCommand(command)

  if (cli.helpRequested) {
    printCommandHelp(command)
    return
  }

  const result = await runSyncPackDoctor({
    targetPath: cli.getOptionValue("--target"),
  })

  writeCliResult({
    result,
    renderText: (doctorResult) => {
      console.log(
        `Sync-Pack doctor checked ${doctorResult.checkedPackageCount} package(s).`
      )
      console.log(`Errors: ${doctorResult.errorCount}`)
      console.log(`Warnings: ${doctorResult.warningCount}`)
      printCliFindings(doctorResult.findings)
    },
  })
}, "Feature Sync-Pack doctor")
