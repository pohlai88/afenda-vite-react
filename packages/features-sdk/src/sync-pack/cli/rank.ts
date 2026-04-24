#!/usr/bin/env node

import { scoreCandidate } from "../scoring/score-candidate.js"
import { readSeedCandidates } from "../workspace.js"

import {
  parseCliCommand,
  printCommandHelp,
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

  console.log("| Candidate | Declared | Recommended | Score | Match |")
  console.log("| --- | --- | --- | ---: | --- |")

  for (const candidate of candidates) {
    const score = scoreCandidate(candidate)
    console.log(
      `| ${candidate.id} | ${score.declaredPriority} | ${score.recommendedPriority} | ${score.score} | ${score.declaredPriorityMatchesRecommendation ? "yes" : "no"} |`
    )
  }
}, "Feature Sync-Pack ranking")
