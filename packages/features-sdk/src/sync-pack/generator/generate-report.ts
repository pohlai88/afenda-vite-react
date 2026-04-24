import {
  appCandidateArraySchema,
  type AppCandidate,
} from "../schema/candidate.schema.js"
import {
  featureCategories,
  featureLanes,
  type FeatureCategory,
  type FeatureLane,
} from "../schema/category.schema.js"
import { appPriorities, type AppPriority } from "../schema/priority.schema.js"
import {
  buildModes,
  candidateStatuses,
  type BuildMode,
  type CandidateStatus,
} from "../schema/review.schema.js"

export interface CandidateReportGroups {
  readonly total: number
  readonly byLane: Readonly<Record<FeatureLane, number>>
  readonly byCategory: Readonly<Record<FeatureCategory, number>>
  readonly byPriority: Readonly<Record<AppPriority, number>>
  readonly byBuildMode: Readonly<Record<BuildMode, number>>
  readonly byStatus: Readonly<Record<CandidateStatus, number>>
}

function createCountMap<T extends string>(
  values: readonly T[]
): Record<T, number> {
  return Object.fromEntries(values.map((value) => [value, 0])) as Record<
    T,
    number
  >
}

function increment<T extends string>(counts: Record<T, number>, key: T): void {
  counts[key] += 1
}

export function groupCandidates(
  candidatesInput: unknown
): CandidateReportGroups {
  const candidates = appCandidateArraySchema.parse(candidatesInput)
  const byLane = createCountMap(featureLanes)
  const byCategory = createCountMap(featureCategories)
  const byPriority = createCountMap(appPriorities)
  const byBuildMode = createCountMap(buildModes)
  const byStatus = createCountMap(candidateStatuses)

  for (const candidate of candidates) {
    increment(byLane, candidate.lane)
    increment(byCategory, candidate.internalCategory)
    increment(byPriority, candidate.priority)
    increment(byBuildMode, candidate.buildMode)
    increment(byStatus, candidate.status)
  }

  return {
    total: candidates.length,
    byLane,
    byCategory,
    byPriority,
    byBuildMode,
    byStatus,
  }
}

function renderCountTable<T extends string>(
  title: string,
  counts: Readonly<Record<T, number>>
): string {
  const rows = Object.entries(counts)
    .map(([name, count]) => `| ${name} | ${count} |`)
    .join("\n")

  return `## ${title}\n\n| Value | Count |\n| --- | ---: |\n${rows}`
}

function renderCandidateTable(candidates: readonly AppCandidate[]): string {
  const rows = candidates
    .map(
      (candidate) =>
        `| ${candidate.id} | ${candidate.internalCategory} | ${candidate.lane} | ${candidate.priority} | ${candidate.buildMode} | ${candidate.status} | ${candidate.ownerTeam} |`
    )
    .join("\n")

  return [
    "## Candidates",
    "",
    "| ID | Category | Lane | Priority | Build Mode | Status | Owner |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    rows,
  ].join("\n")
}

export function generateCandidateReport(candidatesInput: unknown): string {
  const candidates = appCandidateArraySchema.parse(candidatesInput)
  const groups = groupCandidates(candidates)

  return [
    "# Feature Sync-Pack Report",
    "",
    `Total candidates: ${groups.total}`,
    "",
    renderCountTable("By Lane", groups.byLane),
    "",
    renderCountTable("By Category", groups.byCategory),
    "",
    renderCountTable("By Priority", groups.byPriority),
    "",
    renderCountTable("By Build Mode", groups.byBuildMode),
    "",
    renderCountTable("By Status", groups.byStatus),
    "",
    renderCandidateTable(candidates),
    "",
  ].join("\n")
}
