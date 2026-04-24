#!/usr/bin/env node

import { generateFeaturePack } from "../generator/generate-pack.js"
import { readSeedCandidates, resolveGeneratedPacksPath } from "../workspace.js"

import {
  parseCliCommand,
  printCommandHelp,
  requireSyncPackCommandDefinition,
  runCli,
} from "./shared.js"

const command = requireSyncPackCommandDefinition("generate")

await runCli(async () => {
  const cli = parseCliCommand(command)

  if (cli.helpRequested) {
    printCommandHelp(command)
    return
  }

  const candidates = await readSeedCandidates()
  const outputDirectory = resolveGeneratedPacksPath()
  let generatedFileCount = 0

  for (const candidate of candidates) {
    const result = await generateFeaturePack({ candidate, outputDirectory })
    generatedFileCount += result.writtenFiles.length
  }

  console.log(
    `Generated ${generatedFileCount} Feature Sync-Pack files for ${candidates.length} candidates.`
  )
  console.log(`Output: ${outputDirectory}`)
}, "Feature Sync-Pack generation")
