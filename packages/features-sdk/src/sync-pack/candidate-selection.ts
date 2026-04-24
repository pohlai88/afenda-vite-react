import { z } from "zod"

import {
  appCandidateArraySchema,
  type AppCandidate,
} from "./schema/candidate.schema.js"
import {
  featureCategorySchema,
  featureLaneSchema,
  type FeatureCategory,
  type FeatureLane,
} from "./schema/category.schema.js"

export const candidateSelectionSchema = z.strictObject({
  category: featureCategorySchema.optional(),
  lane: featureLaneSchema.optional(),
  owner: z.string().trim().min(1).optional(),
  pack: z.string().trim().min(1).optional(),
})

export type CandidateSelection = z.infer<typeof candidateSelectionSchema>

function normalizePackSelector(value: string): string {
  return value.replaceAll("\\", "/").trim().toLowerCase()
}

function matchesPack(candidate: AppCandidate, selector: string): boolean {
  const normalizedSelector = normalizePackSelector(selector)
  const candidateId = candidate.id.toLowerCase()
  const candidatePath =
    `${candidate.internalCategory}/${candidate.id}`.toLowerCase()

  return (
    normalizedSelector === candidateId || normalizedSelector === candidatePath
  )
}

export function hasCandidateSelection(
  selectionInput: CandidateSelection | undefined
): boolean {
  if (!selectionInput) {
    return false
  }

  const selection = candidateSelectionSchema.parse(selectionInput)
  return Object.values(selection).some((value) => value !== undefined)
}

export function describeCandidateSelection(
  selectionInput: CandidateSelection | undefined
): readonly string[] {
  if (!selectionInput) {
    return []
  }

  const selection = candidateSelectionSchema.parse(selectionInput)
  const parts: string[] = []

  if (selection.category) {
    parts.push(`category=${selection.category}`)
  }

  if (selection.lane) {
    parts.push(`lane=${selection.lane}`)
  }

  if (selection.owner) {
    parts.push(`owner=${selection.owner}`)
  }

  if (selection.pack) {
    parts.push(`pack=${selection.pack}`)
  }

  return parts
}

export function filterCandidates(
  candidatesInput: unknown,
  selectionInput: CandidateSelection = {}
): AppCandidate[] {
  const candidates = appCandidateArraySchema.parse(candidatesInput)
  const selection = candidateSelectionSchema.parse(selectionInput)
  const normalizedOwner = selection.owner?.trim().toLowerCase()

  return candidates.filter((candidate) => {
    if (
      selection.category &&
      candidate.internalCategory !== selection.category
    ) {
      return false
    }

    if (selection.lane && candidate.lane !== selection.lane) {
      return false
    }

    if (
      normalizedOwner &&
      candidate.ownerTeam.trim().toLowerCase() !== normalizedOwner
    ) {
      return false
    }

    if (selection.pack && !matchesPack(candidate, selection.pack)) {
      return false
    }

    return true
  })
}

export type { AppCandidate, FeatureCategory, FeatureLane }
