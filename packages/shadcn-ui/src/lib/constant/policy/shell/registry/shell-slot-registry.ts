/**
 * GOVERNANCE REGISTRY — shell-slot
 * Authoritative slot contract map — must align with shell-slot-policy.slots (slot ids + zones).
 * Scope: explicit slot universe with allowed component kinds for validators and governance tooling.
 * V2/V3: structural `*.frame` slots vs occupant slots; `slotStatus` marks active vs reserved doctrine;
 * `parentFrameSlot` links each occupant to its zone’s structural frame (`null` on `*.frame` rows).
 *
 * Slot id vocabulary (`shellSlotIdValues` / `ShellSlotId`) lives in `shell-slot-policy` as the single source of truth.
 *
 * **Consumption patterns**
 *
 * - Named imports: `import { shellSlotContractBySlotId, parseShellSlotContractBySlotId, shellSlotContractRecordSchema } from "@afenda/shadcn-ui/lib/constant"`
 * - Namespace: `import { ShellSlotRegistryUtils } from "@afenda/shadcn-ui/lib/constant"` → `ShellSlotRegistryUtils.defaults`, `ShellSlotRegistryUtils.parse(...)`.
 */
import { z } from "zod/v4"

import { defineConstMap } from "../../../schema/shared"
import {
  defineShellSlotContract,
  shellSlotContractSchema,
} from "../contract/shell-slot-contract"
import { shellSlotIdSchema, shellSlotPolicy } from "../policy/shell-slot-policy"

/** Legacy: ordered slot descriptors from policy (runtime multiplicity + contributor rules). */
export const shellSlotRegistry = shellSlotPolicy.slots

export type ShellSlotRegistry = typeof shellSlotRegistry

export const shellSlotContractRecordSchema = z
  .record(
    shellSlotIdSchema,
    shellSlotContractSchema.describe("Governed slot contract definition for this slot id.")
  )
  .describe("Authoritative map of canonical slot ids to shell slot contracts (frame vs occupant doctrine).")

export type ShellSlotContractBySlotId = z.infer<typeof shellSlotContractRecordSchema>
export type ShellSlotContractBySlotIdInput = z.input<typeof shellSlotContractRecordSchema>

export const shellSlotContractBySlotId = defineConstMap(
  shellSlotContractRecordSchema.parse({
    "root.frame": defineShellSlotContract({
      key: "root.frame",
      zone: "root",
      slotRole: "frame",
      slotStatus: "active",
      parentFrameSlot: null,
      required: true,
      multiEntry: false,
      featureContributionsAllowed: false,
      priorityStrategy: "fixed",
      allowedComponentKinds: ["platform"],
    }),
    "header.frame": defineShellSlotContract({
      key: "header.frame",
      zone: "header",
      slotRole: "frame",
      slotStatus: "active",
      parentFrameSlot: null,
      required: true,
      multiEntry: false,
      featureContributionsAllowed: false,
      priorityStrategy: "fixed",
      allowedComponentKinds: ["platform"],
    }),
    "header.leading": defineShellSlotContract({
      key: "header.leading",
      zone: "header",
      slotRole: "occupant",
      slotStatus: "active",
      parentFrameSlot: "header.frame",
      required: false,
      multiEntry: false,
      featureContributionsAllowed: false,
      priorityStrategy: "fixed",
      allowedComponentKinds: ["platform"],
    }),
    "header.breadcrumbs": defineShellSlotContract({
      key: "header.breadcrumbs",
      zone: "header",
      slotRole: "occupant",
      slotStatus: "active",
      parentFrameSlot: "header.frame",
      required: false,
      multiEntry: true,
      featureContributionsAllowed: true,
      priorityStrategy: "priority_then_declaration_order",
      allowedComponentKinds: ["navigation", "platform"],
    }),
    "header.center": defineShellSlotContract({
      key: "header.center",
      zone: "header",
      slotRole: "occupant",
      slotStatus: "active",
      parentFrameSlot: "header.frame",
      required: false,
      multiEntry: true,
      featureContributionsAllowed: true,
      priorityStrategy: "priority_then_declaration_order",
      allowedComponentKinds: ["command", "platform"],
    }),
    "header.trailing": defineShellSlotContract({
      key: "header.trailing",
      zone: "header",
      slotRole: "occupant",
      slotStatus: "active",
      parentFrameSlot: "header.frame",
      required: false,
      multiEntry: true,
      featureContributionsAllowed: true,
      priorityStrategy: "priority_then_declaration_order",
      allowedComponentKinds: ["identity", "command", "platform", "supporting"],
    }),
    "sidebar.frame": defineShellSlotContract({
      key: "sidebar.frame",
      zone: "sidebar",
      slotRole: "frame",
      slotStatus: "active",
      parentFrameSlot: null,
      required: true,
      multiEntry: false,
      featureContributionsAllowed: false,
      priorityStrategy: "fixed",
      allowedComponentKinds: ["navigation"],
    }),
    "sidebar.primary": defineShellSlotContract({
      key: "sidebar.primary",
      zone: "sidebar",
      slotRole: "occupant",
      slotStatus: "active",
      parentFrameSlot: "sidebar.frame",
      required: false,
      multiEntry: true,
      featureContributionsAllowed: false,
      priorityStrategy: "declaration_order",
      allowedComponentKinds: ["navigation", "platform"],
    }),
    "sidebar.secondary": defineShellSlotContract({
      key: "sidebar.secondary",
      zone: "sidebar",
      slotRole: "occupant",
      slotStatus: "active",
      parentFrameSlot: "sidebar.frame",
      required: false,
      multiEntry: true,
      featureContributionsAllowed: true,
      priorityStrategy: "declaration_order",
      allowedComponentKinds: ["navigation", "platform"],
    }),
    "content.frame": defineShellSlotContract({
      key: "content.frame",
      zone: "content",
      slotRole: "frame",
      slotStatus: "active",
      parentFrameSlot: null,
      required: true,
      multiEntry: false,
      featureContributionsAllowed: false,
      priorityStrategy: "fixed",
      allowedComponentKinds: ["content"],
    }),
    "content.banner": defineShellSlotContract({
      key: "content.banner",
      zone: "content",
      slotRole: "occupant",
      slotStatus: "active",
      parentFrameSlot: "content.frame",
      required: false,
      multiEntry: true,
      featureContributionsAllowed: true,
      priorityStrategy: "priority_then_declaration_order",
      allowedComponentKinds: ["platform", "supporting", "notification"],
    }),
    "content.toolbar": defineShellSlotContract({
      key: "content.toolbar",
      zone: "content",
      slotRole: "occupant",
      slotStatus: "active",
      parentFrameSlot: "content.frame",
      required: false,
      multiEntry: true,
      featureContributionsAllowed: true,
      priorityStrategy: "priority_then_declaration_order",
      allowedComponentKinds: ["platform", "command"],
    }),
    "content.main": defineShellSlotContract({
      key: "content.main",
      zone: "content",
      slotRole: "occupant",
      slotStatus: "active",
      parentFrameSlot: "content.frame",
      required: false,
      multiEntry: true,
      featureContributionsAllowed: true,
      priorityStrategy: "declaration_order",
      allowedComponentKinds: ["platform", "content", "governance"],
    }),
    "overlay.frame": defineShellSlotContract({
      key: "overlay.frame",
      zone: "overlay",
      slotRole: "frame",
      slotStatus: "active",
      parentFrameSlot: null,
      required: true,
      multiEntry: false,
      featureContributionsAllowed: false,
      priorityStrategy: "fixed",
      allowedComponentKinds: ["overlay"],
    }),
    "overlay.global": defineShellSlotContract({
      key: "overlay.global",
      zone: "overlay",
      slotRole: "occupant",
      slotStatus: "active",
      parentFrameSlot: "overlay.frame",
      required: false,
      multiEntry: true,
      featureContributionsAllowed: false,
      priorityStrategy: "priority_then_declaration_order",
      allowedComponentKinds: ["overlay"],
    }),
    "overlay.command": defineShellSlotContract({
      key: "overlay.command",
      zone: "overlay",
      slotRole: "occupant",
      slotStatus: "reserved",
      parentFrameSlot: "overlay.frame",
      required: false,
      multiEntry: false,
      featureContributionsAllowed: false,
      priorityStrategy: "fixed",
      allowedComponentKinds: [],
    }),
  })
)

export function parseShellSlotContractBySlotId(value: unknown): ShellSlotContractBySlotId {
  return shellSlotContractRecordSchema.parse(value)
}

export function assertShellSlotContractBySlotId(input: unknown): ShellSlotContractBySlotId {
  try {
    return shellSlotContractRecordSchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid ShellSlotContractBySlotId map: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseShellSlotContractBySlotId(
  input: unknown
):
  | { success: true; data: ShellSlotContractBySlotId }
  | { success: false; error: string } {
  const result = shellSlotContractRecordSchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isShellSlotContractBySlotId(input: unknown): input is ShellSlotContractBySlotId {
  return shellSlotContractRecordSchema.safeParse(input).success
}

/** Optional namespace-style bundle (same behavior as named exports). */
export const ShellSlotRegistryUtils = Object.freeze({
  schema: shellSlotContractRecordSchema,
  assert: assertShellSlotContractBySlotId,
  is: isShellSlotContractBySlotId,
  parse: parseShellSlotContractBySlotId,
  safeParse: safeParseShellSlotContractBySlotId,
  defaults: shellSlotContractBySlotId,
})
