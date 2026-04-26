import {
  appCandidateArraySchema,
  type AppCandidate,
} from "../schema/candidate.schema.js"
import {
  scoreCandidate,
  type CandidatePriorityScore,
} from "../scoring/score-candidate.js"

export interface RankedSyncPackCandidate {
  readonly candidate: AppCandidate
  readonly score: CandidatePriorityScore
}

export function rankSyncPackCandidates(
  candidatesInput: unknown
): RankedSyncPackCandidate[] {
  const candidates = appCandidateArraySchema.parse(candidatesInput)

  return [...candidates]
    .map((candidate) => ({
      candidate,
      score: scoreCandidate(candidate),
    }))
    .sort((left, right) => {
      if (right.score.score !== left.score.score) {
        return right.score.score - left.score.score
      }

      return left.candidate.id.localeCompare(right.candidate.id)
    })
}
