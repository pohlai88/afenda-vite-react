/**
 * GOVERNANCE VALIDATOR — validate-shell-registry
 * Validates that the shell component registry remains internally consistent and reviewable.
 * Scope: registry-key ↔ contract-key alignment, slot mapping, slot contracts vs policy, parent-frame coherence, singleton rules.
 * Authority: this validates reviewed registry truth, not a replacement authoring source.
 * Consumption: validate-constants, CI.
 * Purpose: fail fast when shell participation truth drifts.
 *
 * **Governance checklist for registry validators** (same discipline as cross-policy / runtime validators)
 * - Type issue `code` with {@link ShellRegistryIssueCode}; add new codes in `shell-registry-issue-codes.ts` in the same PR.
 * - Prefer `collectShellRegistryIssues(ctx)` + `validateShellRegistryWithContext` for tests (no mutation of frozen registry or imported policy objects).
 * - Document each phase inline: per-component checks, structural frame ownership, slot contracts vs policy, parent-frame coherence, singleton conflicts.
 * - Keep `validateShellRegistry()` as a thin wrapper over {@link buildShellRegistryValidationContextFromImports}.
 * - Optional discoverability: {@link ShellRegistryUtils} (`validate`, `validateWithContext`, `collectIssues`, `buildContextFromImports`); named exports remain preferred for tree-shaking.
 *
 * @example Live registry (repo default)
 * ```ts
 * const report = validateShellRegistry()
 * expect(report.ok).toBe(true)
 * ```
 */
import type { ShellComponentContractEntry } from "../contract/shell-component-contract"
import {
  shellComponentRegistry,
  type ShellComponentRegistryKey,
} from "../registry/shell-component-registry"
import {
  shellSlotContractBySlotId,
  type ShellSlotContractBySlotId,
} from "../registry/shell-slot-registry"
import {
  shellSlotPolicy,
  shellStructuralFrameOwnerComponentKeys,
  shellStructuralFrameSlotIds,
  type ShellSlotId,
} from "../policy/shell-slot-policy"

import { ShellRegistryIssueCode } from "./shell-registry-issue-codes"
import type { ShellRegistryIssueCode as ShellRegistryIssueCodeType } from "./shell-registry-issue-codes"

/** Re-export for consumers that import only this module. */
export { ShellRegistryIssueCode } from "./shell-registry-issue-codes"

export interface ShellRegistryIssue {
  code: ShellRegistryIssueCodeType
  registryKey: string
  message: string
}

export interface ShellRegistryValidationReport {
  ok: boolean
  issues: readonly ShellRegistryIssue[]
}

/**
 * Snapshot of registry + slot policy + slot contracts for {@link collectShellRegistryIssues}.
 * Built from live modules via {@link buildShellRegistryValidationContextFromImports}.
 */
export interface ShellRegistryValidationContext {
  registry: Record<ShellComponentRegistryKey, ShellComponentContractEntry>
  slotPolicy: {
    componentToSlot: Record<string, ShellSlotId | undefined>
    slots: readonly { slotId: ShellSlotId; zone: string }[]
    singletonSlotIds: readonly ShellSlotId[]
    enforceSingletonSlotUniqueness: boolean
  }
  slotContracts: ShellSlotContractBySlotId
  structuralFrameSlotIds: readonly ShellSlotId[]
  /** Keys that own structural `*.frame` slots (see `shellStructuralFrameOwnerComponentKeys`). */
  structuralFrameOwnerKeys: readonly string[]
}

export function buildShellRegistryValidationContextFromImports(): ShellRegistryValidationContext {
  return {
    registry: shellComponentRegistry,
    slotPolicy: {
      componentToSlot: shellSlotPolicy.componentToSlot,
      slots: shellSlotPolicy.slots,
      singletonSlotIds: shellSlotPolicy.singletonSlotIds,
      enforceSingletonSlotUniqueness: shellSlotPolicy.enforceSingletonSlotUniqueness,
    },
    slotContracts: shellSlotContractBySlotId,
    structuralFrameSlotIds: shellStructuralFrameSlotIds,
    structuralFrameOwnerKeys: shellStructuralFrameOwnerComponentKeys as unknown as readonly string[],
  }
}

function pushIssue(
  issues: ShellRegistryIssue[],
  code: ShellRegistryIssueCodeType,
  registryKey: string,
  message: string
): void {
  issues.push({ code, registryKey, message })
}

function validateRegistryKeyMatchesContractKey(
  registryKey: ShellComponentRegistryKey,
  contract: ShellComponentContractEntry,
  issues: ShellRegistryIssue[]
): void {
  if (registryKey !== contract.key) {
    pushIssue(
      issues,
      ShellRegistryIssueCode.REGISTRY_KEY_CONTRACT_KEY_MISMATCH,
      registryKey,
      `Registry key "${registryKey}" must match contract key "${contract.key}".`
    )
  }
}

function validateShellAwarenessConsistency(
  registryKey: ShellComponentRegistryKey,
  contract: ShellComponentContractEntry,
  issues: ShellRegistryIssue[]
): void {
  // Shell-aware components must declare a zone; shell-agnostic must not
  if (contract.shellAware && contract.zone === null) {
    pushIssue(
      issues,
      ShellRegistryIssueCode.SHELL_AWARE_MISSING_ZONE,
      registryKey,
      `Shell-aware component "${registryKey}" must declare a zone.`
    )
  }

  if (!contract.shellAware && contract.zone !== null) {
    pushIssue(
      issues,
      ShellRegistryIssueCode.SHELL_AGNOSTIC_HAS_ZONE,
      registryKey,
      `Shell-agnostic component "${registryKey}" must not declare a zone.`
    )
  }

  // Shell-agnostic: participation modes must stay "none"
  if (!contract.shellAware) {
    const dependencies: Array<[string, string]> = [
      ["shellMetadata", contract.participation.shellMetadata],
      ["navigationContext", contract.participation.navigationContext],
      ["commandInfrastructure", contract.participation.commandInfrastructure],
      ["layoutDensity", contract.participation.layoutDensity],
      ["responsiveShell", contract.participation.responsiveShell],
    ]

    for (const [key, mode] of dependencies) {
      if (mode !== "none") {
        pushIssue(
          issues,
          ShellRegistryIssueCode.SHELL_AGNOSTIC_HAS_DEPENDENCY,
          registryKey,
          `Shell-agnostic component "${registryKey}" must keep ${key} as "none".`
        )
      }
    }
  }
}

function validateProviderBoundaryExpectations(
  registryKey: ShellComponentRegistryKey,
  contract: ShellComponentContractEntry,
  issues: ShellRegistryIssue[]
): void {
  // Required shell metadata cannot combine with rendering outside ShellProvider
  if (
    contract.participation.shellMetadata === "required" &&
    contract.allowOutsideShellProvider
  ) {
    pushIssue(
      issues,
      ShellRegistryIssueCode.OUTSIDE_SHELL_PROVIDER_WITH_REQUIRED_METADATA,
      registryKey,
      `Component "${registryKey}" cannot allow outside-shell rendering when shellMetadata is required.`
    )
  }
}

function validateSlotAssignments(
  ctx: ShellRegistryValidationContext,
  registryKey: ShellComponentRegistryKey,
  contract: ShellComponentContractEntry,
  issues: ShellRegistryIssue[]
): void {
  // Registry key → slot id → descriptor zone must align with contract zone when shell-aware
  const slotId = ctx.slotPolicy.componentToSlot[registryKey]
  if (slotId === undefined) {
    pushIssue(
      issues,
      ShellRegistryIssueCode.MISSING_SLOT_MAPPING,
      registryKey,
      `Registry key "${registryKey}" is missing a shell-slot-policy componentToSlot entry.`
    )
    return
  }

  const descriptor = ctx.slotPolicy.slots.find((s) => s.slotId === slotId)
  if (!descriptor) {
    pushIssue(
      issues,
      ShellRegistryIssueCode.MISSING_SLOT_MAPPING,
      registryKey,
      `Slot "${slotId}" for "${registryKey}" is not declared in shell-slot-policy.slots.`
    )
    return
  }

  if (contract.shellAware && contract.zone !== null && contract.zone !== descriptor.zone) {
    pushIssue(
      issues,
      ShellRegistryIssueCode.SLOT_ZONE_MISMATCH,
      registryKey,
      `Component "${registryKey}" zone "${contract.zone}" does not match slot "${slotId}" zone "${descriptor.zone}".`
    )
  }

  const slotContract = ctx.slotContracts[slotId]
  if (
    slotContract &&
    contract.shellAware &&
    slotContract.allowedComponentKinds.length > 0 &&
    !slotContract.allowedComponentKinds.includes(contract.kind)
  ) {
    pushIssue(
      issues,
      ShellRegistryIssueCode.SLOT_KIND_NOT_ALLOWED,
      registryKey,
      `Component "${registryKey}" kind "${contract.kind}" is not allowed in slot "${slotId}" (allowed: ${slotContract.allowedComponentKinds.join(", ")}).`
    )
  }
}

function validateFrameOwnerVsOccupantSlot(
  ctx: ShellRegistryValidationContext,
  registryKey: ShellComponentRegistryKey,
  issues: ShellRegistryIssue[]
): void {
  // Structural frame owners must map to *.frame slots; occupants must not use frame slots
  const slotId = ctx.slotPolicy.componentToSlot[registryKey]
  if (!slotId) return

  const frameSlotSet = new Set<string>(ctx.structuralFrameSlotIds)
  const isFrameSlot = frameSlotSet.has(slotId)
  const ownerSet = new Set(ctx.structuralFrameOwnerKeys)
  const isFrameOwner = ownerSet.has(registryKey)

  if (isFrameOwner && !isFrameSlot) {
    pushIssue(
      issues,
      ShellRegistryIssueCode.FRAME_COMPONENT_IN_NON_FRAME_SLOT,
      registryKey,
      `Structural shell owner "${registryKey}" must map to a structural frame slot (*.frame); got "${slotId}".`
    )
  }

  if (!isFrameOwner && isFrameSlot) {
    pushIssue(
      issues,
      ShellRegistryIssueCode.OCCUPANT_COMPONENT_IN_FRAME_SLOT,
      registryKey,
      `Occupant shell component "${registryKey}" must not map to structural frame slot "${slotId}".`
    )
  }
}

/**
 * Slot contracts vs slot policy: coverage, zones, frame vs occupant roles.
 */
function validateSlotContractsVsPolicy(
  ctx: ShellRegistryValidationContext,
  issues: ShellRegistryIssue[]
): void {
  const structuralFrameSlotSet = new Set<string>(ctx.structuralFrameSlotIds)
  const policySlotIds = new Set(ctx.slotPolicy.slots.map((s) => s.slotId))
  const contractKeys = Object.keys(ctx.slotContracts) as ShellSlotId[]

  for (const slotId of contractKeys) {
    if (!policySlotIds.has(slotId)) {
      pushIssue(
        issues,
        ShellRegistryIssueCode.SLOT_CONTRACT_MISSING_FOR_POLICY_SLOT,
        slotId,
        `Slot contract "${slotId}" has no matching shell-slot-policy.slots entry.`
      )
    }
  }

  for (const descriptor of ctx.slotPolicy.slots) {
    const slotId = descriptor.slotId
    const contract = ctx.slotContracts[slotId]
    if (!contract) {
      pushIssue(
        issues,
        ShellRegistryIssueCode.SLOT_CONTRACT_MISSING_FOR_POLICY_SLOT,
        slotId,
        `shell-slot-policy declares "${slotId}" but shellSlotContractBySlotId has no contract.`
      )
      continue
    }
    if (contract.zone !== descriptor.zone) {
      pushIssue(
        issues,
        ShellRegistryIssueCode.SLOT_CONTRACT_ZONE_MISMATCH,
        slotId,
        `Slot contract zone "${contract.zone}" must match policy zone "${descriptor.zone}" for "${slotId}".`
      )
    }

    const isStructuralFrame = structuralFrameSlotSet.has(slotId)
    if (isStructuralFrame && contract.slotRole !== "frame") {
      pushIssue(
        issues,
        ShellRegistryIssueCode.SLOT_CONTRACT_ROLE_MISMATCH,
        slotId,
        `Structural frame slot "${slotId}" must have slotRole "frame" (got "${contract.slotRole}").`
      )
    }
    if (!isStructuralFrame && contract.slotRole !== "occupant") {
      pushIssue(
        issues,
        ShellRegistryIssueCode.SLOT_CONTRACT_ROLE_MISMATCH,
        slotId,
        `Occupant slot "${slotId}" must have slotRole "occupant" (got "${contract.slotRole}").`
      )
    }
  }
}

/**
 * Parent frame links: frame slots flat; occupant slots point at zone frame; zones and status align.
 */
function validateParentFrameSlotCoherence(
  ctx: ShellRegistryValidationContext,
  issues: ShellRegistryIssue[]
): void {
  const structuralFrameSlotSet = new Set<string>(ctx.structuralFrameSlotIds)

  for (const slotId of Object.keys(ctx.slotContracts)) {
    const contract = ctx.slotContracts[slotId as keyof typeof ctx.slotContracts]
    if (!contract) continue

    if (contract.slotRole === "frame") {
      if (contract.parentFrameSlot !== null) {
        pushIssue(
          issues,
          ShellRegistryIssueCode.FRAME_PARENT_FRAME_SLOT_MUST_BE_NULL,
          slotId,
          `Structural frame slot "${slotId}" must set parentFrameSlot to null (flat shell tree).`
        )
      }
      continue
    }

    const parentId = contract.parentFrameSlot
    if (parentId === null) {
      pushIssue(
        issues,
        ShellRegistryIssueCode.OCCUPANT_PARENT_FRAME_MISSING,
        slotId,
        `Occupant slot "${slotId}" must declare a non-null parentFrameSlot pointing at its zone frame.`
      )
      continue
    }

    const parent = ctx.slotContracts[parentId]
    if (!parent) {
      pushIssue(
        issues,
        ShellRegistryIssueCode.OCCUPANT_PARENT_FRAME_UNKNOWN,
        slotId,
        `Occupant slot "${slotId}" references unknown parentFrameSlot "${parentId}".`
      )
      continue
    }

    if (!structuralFrameSlotSet.has(parentId)) {
      pushIssue(
        issues,
        ShellRegistryIssueCode.OCCUPANT_PARENT_MUST_BE_STRUCTURAL_FRAME,
        slotId,
        `Occupant slot "${slotId}" parentFrameSlot "${parentId}" must be a structural *.frame slot id.`
      )
    }

    if (parent.slotRole !== "frame") {
      pushIssue(
        issues,
        ShellRegistryIssueCode.OCCUPANT_PARENT_MUST_BE_STRUCTURAL_FRAME,
        slotId,
        `Occupant slot "${slotId}" parent "${parentId}" must have slotRole "frame" (got "${parent.slotRole}").`
      )
    }

    if (parent.zone !== contract.zone) {
      pushIssue(
        issues,
        ShellRegistryIssueCode.OCCUPANT_PARENT_FRAME_ZONE_MISMATCH,
        slotId,
        `Occupant slot "${slotId}" zone "${contract.zone}" must match parent frame "${parentId}" zone "${parent.zone}".`
      )
    }

    if (parent.slotStatus !== "active") {
      pushIssue(
        issues,
        ShellRegistryIssueCode.OCCUPANT_PARENT_FRAME_NOT_ACTIVE,
        slotId,
        `Occupant slot "${slotId}" cannot hang under inactive parent frame "${parentId}" (slotStatus "${parent.slotStatus}").`
      )
    }
  }
}

function validateStructuralFrameSlotOwnership(
  ctx: ShellRegistryValidationContext,
  issues: ShellRegistryIssue[],
  entries: Array<[ShellComponentRegistryKey, ShellComponentContractEntry]>
): void {
  // Each structural *.frame slot must have exactly one registered owner component
  const slotToKeys = new Map<string, ShellComponentRegistryKey[]>()
  for (const [registryKey] of entries) {
    const sid = ctx.slotPolicy.componentToSlot[registryKey]
    if (!sid) continue
    const list = slotToKeys.get(sid) ?? []
    list.push(registryKey)
    slotToKeys.set(sid, list)
  }

  for (const frameSlotId of ctx.structuralFrameSlotIds) {
    const keys = slotToKeys.get(frameSlotId) ?? []
    if (keys.length === 0) {
      pushIssue(
        issues,
        ShellRegistryIssueCode.STRUCTURAL_FRAME_SLOT_OWNER_MISMATCH,
        frameSlotId,
        `Structural frame slot "${frameSlotId}" must have exactly one registered shell component owner.`
      )
      continue
    }
    if (keys.length > 1) {
      for (const registryKey of keys) {
        pushIssue(
          issues,
          ShellRegistryIssueCode.STRUCTURAL_FRAME_SLOT_OWNER_MISMATCH,
          registryKey,
          `Structural frame slot "${frameSlotId}" must have exactly one owner; found: ${keys.join(", ")}.`
        )
      }
    }
  }
}

/**
 * Pure registry validation against a context snapshot (for CI and unit tests).
 */
export function collectShellRegistryIssues(
  ctx: ShellRegistryValidationContext
): ShellRegistryIssue[] {
  const issues: ShellRegistryIssue[] = []
  const entries = Object.entries(ctx.registry) as Array<
    [ShellComponentRegistryKey, ShellComponentContractEntry]
  >

  const seenContractKeys = new Set<string>()
  for (const [registryKey, contract] of entries) {
    if (seenContractKeys.has(contract.key)) {
      pushIssue(
        issues,
        ShellRegistryIssueCode.DUPLICATE_CONTRACT_KEY,
        registryKey,
        `Duplicate contract key "${contract.key}" detected in shell registry.`
      )
    }
    seenContractKeys.add(contract.key)

    validateRegistryKeyMatchesContractKey(registryKey, contract, issues)
    validateShellAwarenessConsistency(registryKey, contract, issues)
    validateProviderBoundaryExpectations(registryKey, contract, issues)
    validateSlotAssignments(ctx, registryKey, contract, issues)
    validateFrameOwnerVsOccupantSlot(ctx, registryKey, issues)
  }

  validateStructuralFrameSlotOwnership(ctx, issues, entries)
  validateSlotContractsVsPolicy(ctx, issues)
  validateParentFrameSlotCoherence(ctx, issues)

  if (ctx.slotPolicy.enforceSingletonSlotUniqueness) {
    const slotToKeys = new Map<string, ShellComponentRegistryKey[]>()
    for (const [registryKey] of entries) {
      const sid = ctx.slotPolicy.componentToSlot[registryKey]
      if (!sid) continue
      const list = slotToKeys.get(sid) ?? []
      list.push(registryKey)
      slotToKeys.set(sid, list)
    }
    for (const slotId of ctx.slotPolicy.singletonSlotIds) {
      const keys = slotToKeys.get(slotId)
      if (keys && keys.length > 1) {
        for (const registryKey of keys) {
          pushIssue(
            issues,
            ShellRegistryIssueCode.SINGLETON_SLOT_CONFLICT,
            registryKey,
            `Singleton slot "${slotId}" has multiple registry components: ${keys.join(", ")}.`
          )
        }
      }
    }
  }

  return issues
}

export function validateShellRegistryWithContext(
  ctx: ShellRegistryValidationContext
): ShellRegistryValidationReport {
  const issues = collectShellRegistryIssues(ctx)
  return {
    ok: issues.length === 0,
    issues,
  }
}

export function validateShellRegistry(): ShellRegistryValidationReport {
  return validateShellRegistryWithContext(buildShellRegistryValidationContextFromImports())
}

/**
 * Frozen alias for discoverability (`ShellRegistryUtils.validate`, `collectIssues`, etc.).
 * Named exports remain preferred for tree-shaking clarity.
 */
export const ShellRegistryUtils = Object.freeze({
  validate: validateShellRegistry,
  validateWithContext: validateShellRegistryWithContext,
  collectIssues: collectShellRegistryIssues,
  buildContextFromImports: buildShellRegistryValidationContextFromImports,
})
