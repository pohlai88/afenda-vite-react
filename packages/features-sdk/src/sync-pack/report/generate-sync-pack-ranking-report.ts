import {
  describeCandidateSelection,
  filterCandidates,
  type CandidateSelection,
} from "../candidate-selection.js"
import { rankSyncPackCandidates } from "../candidate/sync-pack-candidate-rank.js"
import {
  appCandidateArraySchema,
  type AppCandidate,
} from "../schema/candidate.schema.js"
import type { CandidatePriorityScore } from "../scoring/score-candidate.js"

import {
  syncPackRankingReportContractId,
  syncPackRankingReportSchema,
  type SyncPackImplementationSurface,
  type SyncPackRankingConfidence,
  type SyncPackRankingReport,
  type SyncPackRankingReportRow,
} from "./sync-pack-ranking-report.contract.js"

export interface GenerateSyncPackRankingReportOptions {
  readonly filters?: CandidateSelection
}

function deriveConfidence(
  candidate: AppCandidate,
  score: CandidatePriorityScore
): SyncPackRankingConfidence {
  if (
    candidate.status === "approved" &&
    score.reasons.length >= 2 &&
    score.declaredPriorityMatchesRecommendation
  ) {
    return "high"
  }

  if (
    candidate.status === "approved" ||
    score.recommendedPriority !== "good-to-have"
  ) {
    return "medium"
  }

  return "low"
}

function inferLikelyImplementationSurfaces(
  candidate: AppCandidate
): readonly SyncPackImplementationSurface[] {
  const surfaces: SyncPackImplementationSurface[] = ["apps/web"]

  if (
    candidate.buildMode !== "inspire" ||
    candidate.securityReviewRequired ||
    candidate.dataSensitivity !== "low" ||
    candidate.internalCategory !== "productivity-utilities"
  ) {
    surfaces.push("apps/api")
  }

  return surfaces
}

function buildAssumptions(candidate: AppCandidate): readonly string[] {
  const assumptions: string[] = []

  if (candidate.buildMode === "inspire") {
    assumptions.push(
      "Source behavior will be adapted to Afenda workflows rather than mirrored directly."
    )
  }

  if (candidate.status !== "approved") {
    assumptions.push(
      "Implementation should not start until approval status is promoted to approved."
    )
  }

  if (candidate.dataSensitivity !== "low") {
    assumptions.push(
      "Data handling constraints may force a stronger API and storage boundary than the seed alone implies."
    )
  }

  return assumptions
}

function buildRequiredValidation(
  candidate: AppCandidate,
  surfaces: readonly SyncPackImplementationSurface[]
): readonly string[] {
  const validation = [
    "Review the generated implementation pack before creating product tasks.",
  ]

  if (surfaces.includes("apps/web")) {
    validation.push(
      "Confirm the apps/web feature boundary and route ownership."
    )
  }

  if (surfaces.includes("apps/api")) {
    validation.push(
      "Confirm the apps/api module, route, and data-contract boundary."
    )
  }

  if (candidate.licenseReviewRequired) {
    validation.push("Complete license review before implementation starts.")
  }

  if (candidate.securityReviewRequired) {
    validation.push("Complete security review before implementation starts.")
  }

  if (candidate.dataSensitivity !== "low") {
    validation.push(
      "Confirm data classification, storage, and audit expectations before implementation."
    )
  }

  return validation
}

export function createSyncPackRankingReportRow(
  candidate: AppCandidate,
  score: CandidatePriorityScore
): SyncPackRankingReportRow {
  const likelyImplementationSurfaces =
    inferLikelyImplementationSurfaces(candidate)

  return {
    candidateId: candidate.id,
    declaredPriority: score.declaredPriority,
    recommendedPriority: score.recommendedPriority,
    score: score.score,
    confidence: deriveConfidence(candidate, score),
    declaredPriorityMatchesRecommendation:
      score.declaredPriorityMatchesRecommendation,
    reasons: [...score.reasons],
    assumptions: [...buildAssumptions(candidate)],
    likelyImplementationSurfaces: [...likelyImplementationSurfaces],
    requiredValidation: [
      ...buildRequiredValidation(candidate, likelyImplementationSurfaces),
    ],
  }
}

export function generateSyncPackRankingReport(
  candidatesInput: unknown,
  options: GenerateSyncPackRankingReportOptions = {}
): SyncPackRankingReport {
  const allCandidates = appCandidateArraySchema.parse(candidatesInput)
  const selectedCandidates = filterCandidates(allCandidates, options.filters)
  const rows = rankSyncPackCandidates(selectedCandidates).map(
    ({ candidate, score }) => createSyncPackRankingReportRow(candidate, score)
  )

  return syncPackRankingReportSchema.parse({
    contractId: syncPackRankingReportContractId,
    selectedCandidateCount: rows.length,
    totalCandidateCount: allCandidates.length,
    filters: describeCandidateSelection(options.filters),
    rows,
  })
}

export function renderSyncPackRankingReport(
  report: SyncPackRankingReport
): string {
  const rankingTableRows = report.rows
    .map(
      (row) =>
        `| ${row.candidateId} | ${row.declaredPriority} | ${row.recommendedPriority} | ${row.score} | ${row.confidence} | ${row.likelyImplementationSurfaces.join(", ")} |`
    )
    .join("\n")

  const detailSections = report.rows
    .map((row) =>
      [
        `### ${row.candidateId}`,
        "",
        `- Why this ranked here: ${row.reasons.join("; ")}`,
        `- Confidence: ${row.confidence}`,
        row.assumptions.length > 0
          ? `- Assumptions affecting confidence: ${row.assumptions.join("; ")}`
          : "- Assumptions affecting confidence: none recorded",
        `- Likely implementation surfaces: ${row.likelyImplementationSurfaces.join(", ")}`,
        `- Validation required before implementation: ${row.requiredValidation.join("; ")}`,
      ].join("\n")
    )
    .join("\n\n")

  return [
    "## Ranking Decision Artifact",
    "",
    `Contract: ${report.contractId}`,
    report.filters.length > 0
      ? `Applied filters: ${report.filters.join(", ")}`
      : "Applied filters: none",
    "",
    "| Candidate | Declared | Recommended | Score | Confidence | Likely surfaces |",
    "| --- | --- | --- | ---: | --- | --- |",
    rankingTableRows,
    "",
    "## Candidate Decision Notes",
    "",
    detailSections,
  ].join("\n")
}
