/**
 * GOVERNANCE POLICY — shell-slot-policy
 * Canonical shell slot doctrine: where shell-aware surfaces may mount and how contributors interact.
 * Scope: slot identifiers, singleton vs multi-entry rules, shell vs feature eligibility, component→slot mapping.
 * V2 model: structural `*.frame` slots (platform-owned hosts) are distinct from contribution / occupant slots.
 * Authority: shell composition must not bypass this policy; registry validation enforces mapping.
 * Consumption: shell layout, validators, and governance tooling.
 * Validation: schema-validated in validate-constants.
 *
 * **Consumption patterns**
 *
 * - Named imports: `import { shellSlotPolicy, parseShellSlotPolicy, shellSlotPolicySchema } from "@afenda/shadcn-ui/lib/constant"`
 * - Namespace: `import { ShellSlotPolicyUtils } from "@afenda/shadcn-ui/lib/constant"` → `ShellSlotPolicyUtils.defaults`, `ShellSlotPolicyUtils.parse(...)`.
 *   (Named `ShellSlotPolicyUtils` to avoid clashing with `ShellSlotUtils` in `shell-slot-contract`, which handles slot *contract* parsing.)
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple } from "../../../schema/shared"
import { shellComponentContractKeySchema } from "../contract/shell-component-contract"
import { shellZoneSchema } from "./shell-policy"

export const shellSlotIdValues = defineTuple([
  "root.frame",
  /** Structural header chrome (ShellHeader); distinct from contribution slots inside the header row. */
  "header.frame",
  "header.leading",
  /** Path / hierarchy crumbs (distinct from `header.leading` title chrome). */
  "header.breadcrumbs",
  "header.center",
  "header.trailing",
  /** Structural sidebar chrome (ShellSidebar); distinct from primary/secondary nav contribution slots. */
  "sidebar.frame",
  "sidebar.primary",
  "sidebar.secondary",
  /** Structural content host (ShellContent); route-level body typically targets `content.main` inside this frame. */
  "content.frame",
  "content.banner",
  "content.toolbar",
  "content.main",
  /** Structural overlay host (ShellOverlayContainer); portals / popovers use `overlay.global` inside this frame. */
  "overlay.frame",
  "overlay.global",
  "overlay.command",
])

export const shellSlotIdSchema = z
  .enum(shellSlotIdValues)
  .describe("Canonical slot identifier for shell composition and registry mapping.")
export type ShellSlotId = (typeof shellSlotIdValues)[number]

/** Canonical ids for structural `*.frame` hosts (single source for enums and validators). */
export const shellStructuralFrameSlotIdValues = defineTuple([
  "root.frame",
  "header.frame",
  "sidebar.frame",
  "content.frame",
  "overlay.frame",
])

export const shellStructuralFrameSlotIdSchema = z
  .enum(shellStructuralFrameSlotIdValues)
  .describe("Structural `*.frame` host slot id (platform-owned shell chrome host).")
export type ShellStructuralFrameSlotId = (typeof shellStructuralFrameSlotIdValues)[number]

/** Slots that must have exactly one registry owner (structural shell frames). */
export const shellStructuralFrameSlotIds =
  shellStructuralFrameSlotIdValues as unknown as readonly ShellSlotId[]

/**
 * Registry keys that own structural `*.frame` slots (not occupants like search or switchers).
 * Must map only to ids in {@link shellStructuralFrameSlotIds}.
 */
export const shellStructuralFrameOwnerComponentKeys = defineTuple([
  "shell-root",
  "shell-header",
  "shell-sidebar",
  "shell-content",
  "shell-overlay-container",
])

export type ShellStructuralFrameOwnerComponentKey =
  (typeof shellStructuralFrameOwnerComponentKeys)[number]

export function isShellStructuralFrameOwnerComponentKey(
  key: string
): key is ShellStructuralFrameOwnerComponentKey {
  return (shellStructuralFrameOwnerComponentKeys as readonly string[]).includes(key)
}

export const shellSlotEntryModeValues = defineTuple(["singleton", "multi"])
export const shellSlotEntryModeSchema = z
  .enum(shellSlotEntryModeValues)
  .describe("Whether a slot accepts a single primary owner or multiple entries.")
export type ShellSlotEntryMode = (typeof shellSlotEntryModeValues)[number]

export const shellSlotContributorValues = defineTuple([
  "shell_only",
  "feature_allowed",
])
export const shellSlotContributorSchema = z
  .enum(shellSlotContributorValues)
  .describe("Whether only shell primitives or also feature teams may contribute content.")
export type ShellSlotContributor = (typeof shellSlotContributorValues)[number]

export const shellSlotDescriptorSchema = z
  .object({
    slotId: shellSlotIdSchema.describe("Canonical slot identifier."),
    zone: shellZoneSchema.describe("Shell zone where this slot resides."),
    entryMode: shellSlotEntryModeSchema.describe("Singleton or multi-entry mode."),
    contributor: shellSlotContributorSchema.describe("Allowed contributor type."),
  })
  .strict()
  .describe("Governed descriptor for one canonical shell slot.")

export const shellSlotPolicySchema = z
  .object({
    slots: z
      .array(shellSlotDescriptorSchema)
      .min(1)
      .describe("Declared canonical slots and their governance."),
    componentToSlot: z
      .record(shellComponentContractKeySchema, shellSlotIdSchema)
      .describe("Registry key → canonical slot (every governed shell component must map)."),
    singletonSlotIds: z
      .array(shellSlotIdSchema)
      .min(1)
      .describe("Slot ids that accept at most one primary owner (enforced by registry validator)."),
    allowFeatureSlotContribution: z
      .boolean()
      .default(true)
      .describe("Whether feature teams may register additional slot content beyond shell primitives."),
    enforceSingletonSlotUniqueness: z
      .boolean()
      .default(true)
      .describe("Reject duplicate primary assignment to the same singleton slot."),
    requireExplicitSlotRegistry: z
      .boolean()
      .default(true)
      .describe("Shell doctrine must use explicit slot registry and policy."),
    allowImplicitSlotCreationFromComponents: z
      .boolean()
      .default(false)
      .describe("Components may not imply new slot ids without policy updates."),
    forbidUnknownSlotKeysAtRuntime: z
      .boolean()
      .default(true)
      .describe("Runtime may not resolve unknown slot keys when true."),
  })
  .strict()
  .describe("Doctrine for shell slot ids, contributor rules, and component→slot mapping.")

export type ShellSlotPolicy = z.infer<typeof shellSlotPolicySchema>
export type ShellSlotPolicyInput = z.input<typeof shellSlotPolicySchema>

export const shellSlotPolicy = defineConstMap(
  shellSlotPolicySchema.parse({
    slots: [
      { slotId: "root.frame", zone: "root", entryMode: "singleton", contributor: "shell_only" },
      { slotId: "header.frame", zone: "header", entryMode: "singleton", contributor: "shell_only" },
      { slotId: "header.leading", zone: "header", entryMode: "singleton", contributor: "shell_only" },
      { slotId: "header.breadcrumbs", zone: "header", entryMode: "multi", contributor: "feature_allowed" },
      { slotId: "header.center", zone: "header", entryMode: "multi", contributor: "feature_allowed" },
      { slotId: "header.trailing", zone: "header", entryMode: "multi", contributor: "feature_allowed" },
      { slotId: "sidebar.frame", zone: "sidebar", entryMode: "singleton", contributor: "shell_only" },
      { slotId: "sidebar.primary", zone: "sidebar", entryMode: "singleton", contributor: "shell_only" },
      { slotId: "sidebar.secondary", zone: "sidebar", entryMode: "multi", contributor: "feature_allowed" },
      { slotId: "content.frame", zone: "content", entryMode: "singleton", contributor: "shell_only" },
      { slotId: "content.banner", zone: "content", entryMode: "multi", contributor: "feature_allowed" },
      { slotId: "content.toolbar", zone: "content", entryMode: "multi", contributor: "feature_allowed" },
      { slotId: "content.main", zone: "content", entryMode: "multi", contributor: "feature_allowed" },
      { slotId: "overlay.frame", zone: "overlay", entryMode: "singleton", contributor: "shell_only" },
      { slotId: "overlay.global", zone: "overlay", entryMode: "multi", contributor: "shell_only" },
      { slotId: "overlay.command", zone: "overlay", entryMode: "singleton", contributor: "shell_only" },
    ],
    componentToSlot: {
      "shell-root": "root.frame",
      "shell-header": "header.frame",
      "shell-title": "header.leading",
      "shell-breadcrumbs": "header.breadcrumbs",
      "shell-search-bar": "header.center",
      "shell-action-slot": "header.trailing",
      "shell-tenant-switcher": "header.trailing",
      "shell-workspace-switcher": "header.trailing",
      "shell-sidebar": "sidebar.frame",
      "shell-content": "content.frame",
      "shell-loading-frame": "content.main",
      "shell-empty-state-frame": "content.main",
      "shell-degraded-frame": "content.main",
      "shell-overlay-container": "overlay.frame",
      "shell-popover-content": "overlay.global",
    },
    singletonSlotIds: [
      "root.frame",
      "header.frame",
      "header.leading",
      "header.center",
      "sidebar.frame",
      "sidebar.primary",
      "content.frame",
      "overlay.frame",
      "overlay.command",
    ],
  })
)

export function parseShellSlotPolicy(value: unknown): ShellSlotPolicy {
  return shellSlotPolicySchema.parse(value)
}

export function assertShellSlotPolicy(input: unknown): ShellSlotPolicy {
  try {
    return shellSlotPolicySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid ShellSlotPolicy: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseShellSlotPolicy(
  input: unknown
): { success: true; data: ShellSlotPolicy } | { success: false; error: string } {
  const result = shellSlotPolicySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isShellSlotPolicy(input: unknown): input is ShellSlotPolicy {
  return shellSlotPolicySchema.safeParse(input).success
}

/** Optional namespace-style bundle (same behavior as named exports). */
export const ShellSlotPolicyUtils = Object.freeze({
  schema: shellSlotPolicySchema,
  assert: assertShellSlotPolicy,
  is: isShellSlotPolicy,
  parse: parseShellSlotPolicy,
  safeParse: safeParseShellSlotPolicy,
  defaults: shellSlotPolicy,
})
