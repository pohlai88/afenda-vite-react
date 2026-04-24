#!/usr/bin/env node

import { writeSyncPackChangeIntent } from "../intent/index.js"

import {
  CliUsageError,
  parseCliCommand,
  printCommandHelp,
  requireSyncPackCommandDefinition,
  runCli,
} from "./shared.js"

const command = requireSyncPackCommandDefinition("intent")

await runCli(async () => {
  const cli = parseCliCommand(command)

  if (cli.helpRequested) {
    printCommandHelp(command)
    return
  }

  const id = cli.getOptionValue("--id")
  const title = cli.getOptionValue("--title")
  const owner = cli.getOptionValue("--owner")

  if (!id) {
    throw new CliUsageError(
      "missing-cli-option-value",
      "Option --id for command intent requires a value."
    )
  }

  if (!title) {
    throw new CliUsageError(
      "missing-cli-option-value",
      "Option --title for command intent requires a value."
    )
  }

  if (!owner) {
    throw new CliUsageError(
      "missing-cli-option-value",
      "Option --owner for command intent requires a value."
    )
  }

  const result = await writeSyncPackChangeIntent({
    id,
    title,
    owner,
    summary: cli.getOptionValue("--summary"),
  })

  console.log("Feature Sync-Pack intent scaffold")
  console.log("")
  console.log(`Wrote: ${result.filePath}`)
  console.log(`Status: ${result.intent.status}`)
  console.log("")
  console.log("Next:")
  console.log("  1. Fill changedSurface, commandsAffected, and truthBinding.")
  console.log("  2. Promote status to accepted or implemented.")
  console.log("  3. Run pnpm run feature-sync:intent-check.")
}, "Feature Sync-Pack intent scaffold")
