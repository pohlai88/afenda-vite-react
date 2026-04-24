#!/usr/bin/env node

import { createCliErrorResult, isJsonOutput } from "../cli-output.js"

import {
  printCommandHelp,
  printSyncPackUsage,
  resolveSyncPackCliRequest,
} from "./shared.js"

const request = resolveSyncPackCliRequest()

switch (request.kind) {
  case "help-root":
    printSyncPackUsage()
    break
  case "help-command":
    printCommandHelp(request.command)
    break
  case "execute":
    await request.command.load?.()
    break
  case "unknown-command": {
    const error = new Error(
      `Unknown Sync-Pack command: ${request.input}`
    ) as Error & {
      code: string
    }
    error.code = "unknown-sync-pack-command"

    if (isJsonOutput()) {
      console.log(
        JSON.stringify(
          createCliErrorResult("Afenda Sync-Pack CLI", error),
          null,
          2
        )
      )
    } else {
      console.error(`Unknown Sync-Pack command: ${request.input}`)
      printSyncPackUsage()
    }

    process.exitCode = 1
  }
}

export {}
