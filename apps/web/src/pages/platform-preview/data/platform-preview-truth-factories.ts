import type {
  TruthFixtureItem,
  TruthRailId,
  TruthRailSeed,
} from "../types/platform-preview-orchestration-types"

export function createFixtureItem(
  id: string,
  label: string,
  value: string
): TruthFixtureItem {
  return { id, label, value }
}

export function createRail(
  railId: TruthRailId,
  eyebrow: string,
  headline: string,
  body: string,
  riskSeverity: TruthRailSeed["riskSeverity"],
  fixtureItems: readonly TruthFixtureItem[]
): TruthRailSeed {
  return {
    railId,
    eyebrow,
    headline,
    body,
    fixtureItems,
    riskSeverity,
  }
}
