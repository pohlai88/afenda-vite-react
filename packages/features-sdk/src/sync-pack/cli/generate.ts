#!/usr/bin/env node

import { filterCandidates } from "../candidate-selection.js"
import { generateFeaturePack } from "../generator/generate-pack.js"
import { readSeedCandidates, resolveGeneratedPacksPath } from "../workspace.js"

import {
  formatCandidateSelectionSummary,
  parseCliCommand,
  printCommandHelp,
  readCandidateSelection,
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
  const selection = readCandidateSelection(cli)
  const selectedCandidates = filterCandidates(candidates, selection)

  if (selectedCandidates.length === 0) {
    throw new Error(
      `No candidates matched the requested filters (${formatCandidateSelectionSummary(selection)}).`
    )
  }

  const outputDirectory = resolveGeneratedPacksPath()
  let generatedFileCount = 0

  for (const candidate of selectedCandidates) {
    const result = await generateFeaturePack({ candidate, outputDirectory })
    generatedFileCount += result.writtenFiles.length
  }

  console.log(
    `Generated ${generatedFileCount} Feature Sync-Pack files for ${selectedCandidates.length} candidates.`
  )
  console.log(`Applied filters: ${formatCandidateSelectionSummary(selection)}`)
  console.log(`Output: ${outputDirectory}`)
}, "Feature Sync-Pack generation")
