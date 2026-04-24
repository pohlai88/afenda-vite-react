#!/usr/bin/env node

import { filterCandidates } from "../candidate-selection.js"
import { scoreCandidate } from "../scoring/score-candidate.js"
import { readSeedCandidates } from "../workspace.js"

import {
  formatCandidateSelectionSummary,
  parseCliCommand,
  printCommandHelp,
  readCandidateSelection,
  requireSyncPackCommandDefinition,
  runCli,
} from "./shared.js"

const command = requireSyncPackCommandDefinition("rank")

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

  const rankedCandidates = [...selectedCandidates].sort((left, right) => {
    const leftScore = scoreCandidate(left)
    const rightScore = scoreCandidate(right)

    if (rightScore.score !== leftScore.score) {
      return rightScore.score - leftScore.score
    }

    return left.id.localeCompare(right.id)
  })

  console.log(`Applied filters: ${formatCandidateSelectionSummary(selection)}`)
  console.log("| Candidate | Declared | Recommended | Score | Match |")
  console.log("| --- | --- | --- | ---: | --- |")

  for (const candidate of rankedCandidates) {
    const score = scoreCandidate(candidate)
    console.log(
      `| ${candidate.id} | ${score.declaredPriority} | ${score.recommendedPriority} | ${score.score} | ${score.declaredPriorityMatchesRecommendation ? "yes" : "no"} |`
    )
  }
}, "Feature Sync-Pack ranking")
