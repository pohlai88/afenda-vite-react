#!/usr/bin/env node

import {
  parseCliCommand,
  printCommandHelp,
  printQuickstart,
  requireSyncPackCommandDefinition,
  runCli,
} from "./shared.js"

const command = requireSyncPackCommandDefinition("quickstart")

await runCli(async () => {
  const cli = parseCliCommand(command)

  if (cli.helpRequested) {
    printCommandHelp(command)
    return
  }

  printQuickstart()
}, "Feature Sync-Pack quickstart")
