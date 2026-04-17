import type {
  TruthCaseId,
  TruthChamberId,
  TruthChamberSeed,
} from "../types/platform-preview-orchestration-types"
import { accountantTruthChamberSeed } from "./platform-preview-truth-accountant"
import { cfoTruthChamberSeed } from "./platform-preview-truth-cfo"
import { controllerTruthChamberSeed } from "./platform-preview-truth-controller"

export const DEFAULT_TRUTH_CHAMBER: TruthChamberId = "controller"

export const truthCasesByChamber = {
  accountant: [
    "wrong-account-class-posting",
    "three-way-matching",
    "intercompany-transfer",
  ],
  controller: [
    "fiscal-period-drift",
    "ifrs-reporting",
    "xbrl-tagging",
  ],
  cfo: ["m-and-a", "valuation", "auditor-dispute"],
} as const satisfies Record<
  TruthChamberId,
  readonly [TruthCaseId, TruthCaseId, TruthCaseId]
>

export const legacySeatRedirects = {
  operator: "accountant",
  controller: "controller",
  executive: "cfo",
  owner: "cfo",
} as const

export const truthChamberSeeds = {
  accountant: accountantTruthChamberSeed,
  controller: controllerTruthChamberSeed,
  cfo: cfoTruthChamberSeed,
} as const satisfies Record<TruthChamberId, TruthChamberSeed>

export const truthChamberOrder = [
  truthChamberSeeds.accountant,
  truthChamberSeeds.controller,
  truthChamberSeeds.cfo,
] as const

export function isTruthChamberId(value: string | undefined): value is TruthChamberId {
  if (!value) return false
  return value in truthChamberSeeds
}

export function isTruthCaseId(value: string | undefined): value is TruthCaseId {
  if (!value) return false
  return Object.values(truthCasesByChamber)
    .flat()
    .includes(value as TruthCaseId)
}

export function getTruthChamberSeed(chamberId: TruthChamberId): TruthChamberSeed {
  return truthChamberSeeds[chamberId]
}

export function getLegacyChamberRedirect(
  legacySeat: string | undefined
): TruthChamberId {
  if (!legacySeat) return DEFAULT_TRUTH_CHAMBER
  return (
    legacySeatRedirects[legacySeat as keyof typeof legacySeatRedirects] ??
    DEFAULT_TRUTH_CHAMBER
  )
}
