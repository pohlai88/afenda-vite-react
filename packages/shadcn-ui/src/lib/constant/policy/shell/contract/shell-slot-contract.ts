/**
 * CONTRACT — shell-slot
 * Normalized shape for authored shell slot definitions (complements shell-slot-policy runtime slots).
 * Scope: slot key, zone, multiplicity, contribution rules, and allowed component kinds for validators.
 * Authority: slot contract entries must align with shell-slot-policy.slots and shellSlotContractRegistry.
 * Purpose: deterministic slot doctrine for enterprise registry validation beyond raw descriptors.
 *
 * **Consumption patterns**
 *
 * - Named imports (tree-shaking friendly):
 *   `import { defineShellSlotContract, shellSlotContractSchema, parseShellSlotContract } from "@afenda/shadcn-ui/lib/constant"`
 * - Namespace (autocomplete):
 *   `import { ShellSlotUtils } from "@afenda/shadcn-ui/lib/constant"` then `ShellSlotUtils.define(...)`, `ShellSlotUtils.parse(...)`.
 */
import { z } from "zod/v4"

import {
  shellComponentKindSchema,
  type ShellComponentKind,
} from "./shell-component-contract"
import {
  shellSlotIdSchema,
  shellStructuralFrameSlotIdSchema,
} from "../policy/shell-slot-policy"
import { shellZoneSchema, type ShellZone } from "../policy/shell-policy"

export const shellSlotPriorityStrategyValues = [
  "fixed",
  "declaration_order",
  "priority_then_declaration_order",
] as const
export const shellSlotPriorityStrategySchema = z
  .enum(shellSlotPriorityStrategyValues)
  .describe("Ordering strategy for slot contributions when multiple components mount.")
export type ShellSlotPriorityStrategy = (typeof shellSlotPriorityStrategyValues)[number]

/** Structural frame vs occupant contribution surface (orthogonal to {@link shellSlotStatusSchema}). */
export const shellSlotRoleValues = ["frame", "occupant"] as const
export const shellSlotRoleSchema = z
  .enum(shellSlotRoleValues)
  .describe("Structural `*.frame` slot vs occupant region inside a frame.")
export type ShellSlotRole = z.infer<typeof shellSlotRoleSchema>

/** Whether the slot is live in doctrine now or held for a later phase (`docs/__idea__/working_ref.md` V3). */
export const shellSlotStatusValues = ["active", "reserved"] as const
export const shellSlotStatusSchema = z
  .enum(shellSlotStatusValues)
  .describe("Active = in registry/runtime; reserved = doctrine placeholder until composition is primary.")
export type ShellSlotStatus = z.infer<typeof shellSlotStatusSchema>

/** Parent structural frame for occupant slots; frame slots use `null` (flat shell tree). */
export const shellParentFrameSlotSchema = z.union([
  shellStructuralFrameSlotIdSchema,
  z.null(),
])
export type ShellParentFrameSlot = z.infer<typeof shellParentFrameSlotSchema>

type OccupantParentFrameId =
  | "header.frame"
  | "sidebar.frame"
  | "content.frame"
  | "overlay.frame"

function expectedParentFrameSlotForOccupantZone(
  zone: ShellZone
): OccupantParentFrameId | null {
  switch (zone) {
    case "header":
      return "header.frame"
    case "sidebar":
      return "sidebar.frame"
    case "content":
      return "content.frame"
    case "overlay":
      return "overlay.frame"
    default:
      return null
  }
}

type ShellSlotRefinementCtx = {
  addIssue: (issue: {
    code: typeof z.ZodIssueCode.custom
    path?: (string | number)[]
    message?: string
  }) => void
}

function refineRequiredSlotMustBeActive(
  val: { required: boolean; slotStatus: ShellSlotStatus },
  ctx: ShellSlotRefinementCtx
): void {
  if (val.required && val.slotStatus !== "active") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["required"],
      message: "Required slots must use slotStatus active.",
    })
  }
}

function refineFrameSlotDoctrine(
  val: {
    slotRole: ShellSlotRole
    slotStatus: ShellSlotStatus
    multiEntry: boolean
    allowedComponentKinds: readonly ShellComponentKind[]
    parentFrameSlot: ShellParentFrameSlot
  },
  ctx: ShellSlotRefinementCtx
): void {
  if (val.slotRole !== "frame") return
  if (val.slotStatus === "reserved") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["slotStatus"],
      message: "Structural frame slots must use slotStatus active.",
    })
  }
  if (val.multiEntry) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["multiEntry"],
      message: "Structural frame slots must not allow multiEntry.",
    })
  }
  if (val.allowedComponentKinds.length !== 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["allowedComponentKinds"],
      message: "Structural frame slots must declare exactly one allowed component kind.",
    })
  }
  if (val.parentFrameSlot !== null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["parentFrameSlot"],
      message: "Structural frame slots must use parentFrameSlot null.",
    })
  }
}

function refineOccupantParentFrame(
  val: { slotRole: ShellSlotRole; zone: ShellZone; parentFrameSlot: ShellParentFrameSlot },
  ctx: ShellSlotRefinementCtx
): void {
  if (val.slotRole !== "occupant") return
  const expected = expectedParentFrameSlotForOccupantZone(val.zone)
  if (expected === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["zone"],
      message: `Occupant slots cannot use zone "${val.zone}" without a parent frame mapping.`,
    })
    return
  }
  if (val.parentFrameSlot !== expected) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["parentFrameSlot"],
      message: `Occupant slot in zone "${val.zone}" must set parentFrameSlot to "${expected}".`,
    })
  }
}

export const shellSlotContractSchema = z
  .object({
    key: shellSlotIdSchema.describe("Stable slot id (matches shell-slot-policy keys)."),
    zone: shellZoneSchema.describe("Layout region for this slot."),
    slotRole: shellSlotRoleSchema,
    slotStatus: shellSlotStatusSchema.default("active"),
    parentFrameSlot: shellParentFrameSlotSchema.describe(
      "Structural frame parent; `null` for `*.frame` rows; occupant links to zone frame."
    ),
    required: z.boolean().default(false).describe("Whether this slot must mount for a healthy shell."),
    multiEntry: z
      .boolean()
      .default(false)
      .describe("Whether multiple components may contribute to this slot."),
    featureContributionsAllowed: z
      .boolean()
      .describe("Whether feature modules may contribute components beyond the core registry."),
    priorityStrategy: shellSlotPriorityStrategySchema,
    allowedComponentKinds: z
      .array(shellComponentKindSchema)
      .describe(
        "Allowed `ShellComponentKind` values; may be empty for reserved slots or pending occupants."
      ),
  })
  .strict()
  .describe("Canonical authored slot contract for registry validation and governance.")
  .superRefine((val, ctx) => {
    refineRequiredSlotMustBeActive(val, ctx)
    refineFrameSlotDoctrine(val, ctx)
    refineOccupantParentFrame(val, ctx)
  })

export type ShellSlotContract = z.infer<typeof shellSlotContractSchema>
export type ShellSlotContractInput = z.input<typeof shellSlotContractSchema>

export function defineShellSlotContract(
  input: ShellSlotContractInput
): ShellSlotContract {
  return shellSlotContractSchema.parse(input)
}

/** Validates unknown slot payloads; throws `ZodError` on failure. */
export function parseShellSlotContract(value: unknown): ShellSlotContract {
  return shellSlotContractSchema.parse(value)
}

export function assertShellSlotContract(input: unknown): ShellSlotContract {
  try {
    return shellSlotContractSchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid ShellSlotContract: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseShellSlotContract(
  input: unknown
):
  | { success: true; data: ShellSlotContract }
  | { success: false; error: string } {
  const result = shellSlotContractSchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isShellSlotContract(input: unknown): input is ShellSlotContract {
  return shellSlotContractSchema.safeParse(input).success
}

/**
 * Optional namespace-style bundle (same behavior as named exports).
 * Individual imports remain preferred for tree-shaking clarity.
 */
export const ShellSlotUtils = Object.freeze({
  schema: shellSlotContractSchema,
  assert: assertShellSlotContract,
  is: isShellSlotContract,
  parse: parseShellSlotContract,
  safeParse: safeParseShellSlotContract,
  define: defineShellSlotContract,
})
