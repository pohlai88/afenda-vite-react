import {
  DEFAULT_TRUTH_CHAMBER,
  getTruthChamberSeed,
  isTruthCaseId,
} from "../data/platform-preview-truth-seed"
import type {
  TruthChamberId,
  TruthChamberViewModel,
} from "../types/platform-preview-orchestration-types"

const doctrineLineByChamber: Record<TruthChamberId, string> = {
  accountant: "Accountant guards transaction truth.",
  controller: "Controller guards reporting truth.",
  cfo: "CFO guards enterprise truth.",
}

const forbiddenPublicKeys = [
  "activeSession",
  "permission",
  "permissions",
  "roleKey",
  "canonicalRoleKey",
  "canonicalRoleCandidates",
  "session",
  "seat",
  "seatId",
]

export function createTruthChamberViewModel(
  chamberId: TruthChamberId,
  requestedCaseId?: string
): TruthChamberViewModel {
  const seed = getTruthChamberSeed(chamberId)
  const activeCaseId =
    requestedCaseId && isTruthCaseId(requestedCaseId)
      ? requestedCaseId
      : seed.defaultCaseId
  const activeCase =
    seed.cases.find((entry) => entry.caseId === activeCaseId) ?? seed.cases[0]

  return {
    chamberId: seed.chamberId,
    chamberTitle: seed.chamberTitle,
    chamberSubtitle: seed.chamberSubtitle,
    doctrineLine: doctrineLineByChamber[chamberId],
    riskLine: seed.riskLine,
    statutoryPosture: seed.statutoryPosture,
    visualTone: seed.visualTone,
    activeCaseId: activeCase.caseId,
    activeCase,
    cases: seed.cases,
  }
}

export function createDefaultTruthChamberViewModel(): TruthChamberViewModel {
  return createTruthChamberViewModel(DEFAULT_TRUTH_CHAMBER)
}

export function exposesForbiddenPublicKeys(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false

  const serialized = JSON.stringify(value)
  return forbiddenPublicKeys.some((key) => serialized.includes(key))
}
