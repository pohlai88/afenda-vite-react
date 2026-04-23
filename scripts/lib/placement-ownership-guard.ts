import type {
  PlacementOwnershipRule,
  PlacementOwnershipScope,
} from "@afenda/governance-toolchain"
import {
  evaluatePlacementOwnershipFindings,
  matchesPlacementOwnershipRule,
  resolvePlacementOwnershipScope,
  resolveStrongestPlacementOwnershipRules,
} from "@afenda/governance-toolchain"

import type {
  AfendaConfig,
  FileSurvivalOwnerTruth,
  FileSurvivalRolloutDefinition,
} from "../afenda-config.js"
export type { PlacementOwnershipRule, PlacementOwnershipScope }
export {
  evaluatePlacementOwnershipFindings,
  matchesPlacementOwnershipRule,
  resolvePlacementOwnershipScope,
  resolveStrongestPlacementOwnershipRules,
} from "@afenda/governance-toolchain"

export function buildPlacementOwnershipScopes(
  config: AfendaConfig,
  staticScopes: readonly PlacementOwnershipScope[] = []
): readonly PlacementOwnershipScope[] {
  return [
    ...config.fileSurvival.rollouts.map((rollout) =>
      buildPlacementOwnershipScope(rollout)
    ),
    ...staticScopes,
  ]
}

export function buildPlacementOwnershipScope(
  rollout: FileSurvivalRolloutDefinition
): PlacementOwnershipScope {
  const ownerTruthByRoot = new Map(
    rollout.ownerTruth.map((ownerTruth) => [ownerTruth.root, ownerTruth.owner])
  )
  const specializedRoots = new Set([
    ...rollout.runtimeOwners,
    ...rollout.sharedRoots,
  ])
  const rules: PlacementOwnershipRule[] = [
    ...rollout.runtimeOwners.map((ownerPath) => ({
      owner: ownerTruthByRoot.get(ownerPath) ?? `${rollout.id}:runtime`,
      root: ownerPath,
      kind: "runtime-owner" as const,
      matchMode: "exact" as const,
    })),
    ...rollout.sharedRoots.map((sharedRoot) => ({
      owner: ownerTruthByRoot.get(sharedRoot) ?? `${rollout.id}:shared`,
      root: sharedRoot,
      kind: "shared-root" as const,
      matchMode: "prefix" as const,
    })),
    ...rollout.ownerTruth
      .filter((ownerTruth) => !specializedRoots.has(ownerTruth.root))
      .map((ownerTruth) => toOwnerRootRule(ownerTruth)),
  ]

  return {
    id: rollout.id,
    scopeRoot: rollout.scopeRoot,
    ignorePatterns: rollout.ignore,
    rules,
  }
}

function toOwnerRootRule(
  ownerTruth: FileSurvivalOwnerTruth
): PlacementOwnershipRule {
  return {
    owner: ownerTruth.owner,
    root: ownerTruth.root,
    kind: "owner-root",
    matchMode: "prefix",
  }
}
