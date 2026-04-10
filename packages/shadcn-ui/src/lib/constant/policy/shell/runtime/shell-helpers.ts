/**
 * RUNTIME HELPERS — shell
 * Pure helpers for slot lookup and state-key queries aligned with shell doctrine.
 * Scope: no hidden mutation; safe for validators and runtime consumers.
 *
 * Authority split:
 * - Slot vocabulary / descriptors: `shell-slot-policy` (`slots`, `componentToSlot` for diagnostics).
 * - Structural semantics (`slotRole`, `parentFrameSlot`, `required`): `shell-slot-registry` contracts.
 */
import type { ShellSlotContract } from "../contract/shell-slot-contract"
import type { ShellSlotId } from "../policy/shell-slot-policy"
import {
  shellStatePolicy,
  type ShellStateDeclaration,
  type ShellStateDomain,
  type ShellStateIsolation,
  type ShellStatePersistence,
  type ShellStateResetTrigger,
} from "../policy/shell-state-policy"
import { shellSlotPolicy } from "../policy/shell-slot-policy"
import type { ShellStateKey } from "../shell-values"

import {
  shellSlotContractBySlotId,
  type ShellSlotContractBySlotId,
} from "../registry/shell-slot-registry"

/** Typed map for safe indexing under typed-eslint when registry resolution is partial. */
const slotContractMap: ShellSlotContractBySlotId = shellSlotContractBySlotId

/** Canonical descriptor lookup — avoids repeated linear scans over `shellSlotPolicy.slots`. */
const shellSlotDescriptorBySlotId: Readonly<
  Record<ShellSlotId, (typeof shellSlotPolicy.slots)[number]>
> = Object.fromEntries(
  shellSlotPolicy.slots.map((slot) => [slot.slotId, slot])
) as Readonly<Record<ShellSlotId, (typeof shellSlotPolicy.slots)[number]>>

function getShellSlotContracts(): readonly ShellSlotContract[] {
  return Object.values(slotContractMap)
}

export function getShellSlotDescriptor(slotId: ShellSlotId) {
  const descriptor = shellSlotDescriptorBySlotId[slotId]
  if (!descriptor) {
    throw new Error(`Unknown shell slot id "${slotId}".`)
  }
  return descriptor
}

export function getShellSlotContract(
  slotId: ShellSlotId
): ShellSlotContract | undefined {
  return slotContractMap[slotId]
}

export function requireShellSlotContract(slotId: ShellSlotId): ShellSlotContract {
  const contract = getShellSlotContract(slotId)
  if (!contract) {
    throw new Error(`Missing shell slot contract for slot "${slotId}".`)
  }
  return contract
}

/** Parent structural `*.frame` for occupant slots; `null` for frame rows (see `ShellSlotContract.parentFrameSlot`). */
export function getParentFrameSlotForSlotId(
  slotId: ShellSlotId
): ShellSlotContract["parentFrameSlot"] {
  return requireShellSlotContract(slotId).parentFrameSlot
}

/** Structural `*.frame` slot ids — derived from slot contracts (`slotRole === "frame"`), registry order. */
export function getShellFrameSlotIds(): readonly ShellSlotId[] {
  return getShellSlotContracts()
    .filter((row) => row.slotRole === "frame")
    .map((row) => row.key)
}

/** Occupant slots — derived from slot contracts (`slotRole === "occupant"`); includes `slotStatus: "reserved"` rows. */
export function getShellOccupantSlotIds(): ShellSlotId[] {
  return getShellSlotContracts()
    .filter((row) => row.slotRole === "occupant")
    .map((row) => row.key)
}

/** Frame slots marked required in the slot contract registry. */
export function getRequiredFrameSlotIds(): ShellSlotId[] {
  return getShellSlotContracts()
    .filter((row) => row.slotRole === "frame" && row.required === true)
    .map((row) => row.key)
}

/**
 * Registry keys (`shell-*`) that map to the given slot id.
 * Source: `shellSlotPolicy.componentToSlot` (governed inventory; aligns with component registry validation).
 */
export function getRegistryKeysForSlot(slotId: ShellSlotId): string[] {
  return Object.entries(shellSlotPolicy.componentToSlot)
    .filter(([, sid]) => sid === slotId)
    .map(([key]) => key)
}

/** Alias aligned with shell doctrine docs (`getSlotOwners` / owner resolution). */
export const getSlotOwners = getRegistryKeysForSlot

const shellStateDeclarationByKey: Readonly<
  Record<ShellStateKey, ShellStateDeclaration>
> = Object.fromEntries(
  shellStatePolicy.declaredStateKeys.map((row) => [row.key, row])
) as Readonly<Record<ShellStateKey, ShellStateDeclaration>>

/** Single declaration row for a governed state key (throws if doctrine is incomplete). */
export function getShellStateDeclaration(key: ShellStateKey): ShellStateDeclaration {
  const row = shellStateDeclarationByKey[key]
  if (!row) {
    throw new Error(`Missing shell state declaration for key "${key}".`)
  }
  return row
}

export function getShellStateKeysByDomain(
  domain: ShellStateDomain
): readonly ShellStateKey[] {
  return shellStatePolicy.declaredStateKeys
    .filter((d) => d.domain === domain)
    .map((d) => d.key)
}

export function getShellStateKeysByIsolation(
  isolation: ShellStateIsolation
): readonly ShellStateKey[] {
  return shellStatePolicy.declaredStateKeys
    .filter((d) => d.isolation === isolation)
    .map((d) => d.key)
}

export function getShellStateKeysByPersistence(
  persistence: ShellStatePersistence
): readonly ShellStateKey[] {
  return shellStatePolicy.declaredStateKeys
    .filter((d) => d.persistence === persistence)
    .map((d) => d.key)
}

export function getRequiredShellStateKeys(): readonly ShellStateKey[] {
  return shellStatePolicy.declaredStateKeys
    .filter((d) => d.required)
    .map((d) => d.key)
}

export function getStateKeysForResetTrigger(
  trigger: ShellStateResetTrigger
): readonly ShellStateKey[] {
  return shellStatePolicy.declaredStateKeys
    .filter((d) => d.resetTriggers.includes(trigger))
    .map((d) => d.key)
}
