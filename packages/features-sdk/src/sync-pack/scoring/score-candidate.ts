import type { AppCandidate } from "../schema/candidate.schema.js"
import type { AppPriority } from "../schema/priority.schema.js"

import {
  criticalPrioritySignals,
  essentialPrioritySignals,
  priorityScoreThresholds,
  priorityScoreWeights,
} from "./priority-rules.js"

export interface CandidatePriorityScore {
  readonly candidateId: string
  readonly declaredPriority: AppPriority
  readonly recommendedPriority: AppPriority
  readonly score: number
  readonly reasons: readonly string[]
  readonly declaredPriorityMatchesRecommendation: boolean
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function includesSignal(haystack: string, signal: string): boolean {
  return new RegExp(`\\b${escapeRegExp(signal)}\\b`, "i").test(haystack)
}

function matchedSignals(
  haystack: string,
  signals: readonly string[]
): readonly string[] {
  return signals.filter((signal) => includesSignal(haystack, signal))
}

function priorityFromScore(
  score: number,
  hasCriticalEscalationSignal: boolean
): AppPriority {
  if (
    hasCriticalEscalationSignal &&
    score >= priorityScoreThresholds.critical
  ) {
    return "critical"
  }

  if (score >= priorityScoreThresholds.essential) {
    return "essential"
  }

  return "good-to-have"
}

export function scoreCandidate(
  candidate: AppCandidate
): CandidatePriorityScore {
  const searchableText = [
    candidate.id,
    candidate.name,
    candidate.sourceCategory,
    candidate.internalCategory,
    candidate.internalUseCase,
  ]
    .join(" ")
    .toLowerCase()

  const criticalSignals = matchedSignals(
    searchableText,
    criticalPrioritySignals
  )
  const essentialSignals = matchedSignals(
    searchableText,
    essentialPrioritySignals
  )
  const hasCriticalEscalationSignal =
    criticalSignals.length > 0 ||
    (candidate.dataSensitivity === "high" && candidate.securityReviewRequired)

  let score = 0
  const reasons: string[] = []

  if (criticalSignals.length > 0) {
    score += criticalSignals.length * priorityScoreWeights.criticalSignal
    reasons.push(`Critical signals: ${criticalSignals.join(", ")}`)
  }

  if (essentialSignals.length > 0) {
    score += essentialSignals.length * priorityScoreWeights.essentialSignal
    reasons.push(`Essential signals: ${essentialSignals.join(", ")}`)
  }

  if (candidate.dataSensitivity === "high") {
    score += priorityScoreWeights.highSensitivity
    reasons.push("High data sensitivity")
  } else if (candidate.dataSensitivity === "medium") {
    score += priorityScoreWeights.mediumSensitivity
    reasons.push("Medium data sensitivity")
  }

  if (candidate.securityReviewRequired) {
    score += priorityScoreWeights.securityReviewRequired
    reasons.push("Security review required")
  }

  if (candidate.licenseReviewRequired) {
    score += priorityScoreWeights.licenseReviewRequired
    reasons.push("License review required")
  }

  const recommendedPriority = priorityFromScore(
    score,
    hasCriticalEscalationSignal
  )

  return {
    candidateId: candidate.id,
    declaredPriority: candidate.priority,
    recommendedPriority,
    score,
    reasons: reasons.length > 0 ? reasons : ["No priority escalation signals"],
    declaredPriorityMatchesRecommendation:
      candidate.priority === recommendedPriority,
  }
}
