/**
 * GOVERNANCE CONTRACT — shell-component-contract
 * Canonical declaration contract for shell-aware component participation.
 * Scope: defines shell placement, shell-runtime dependencies, and provider-boundary behavior.
 * Authority: shell-aware components must declare participation through this contract.
 * Consumption: registries, AST rules, validation tooling, and CI checks read this as reviewed truth.
 * Changes: update deliberately; new participation semantics require migration review.
 * Constraints: declarations must remain explicit, deterministic, and statically enforceable.
 * Validation: schema-validated, strict, and cross-field checked against contradictory declarations.
 * Purpose: make shell participation auditable, non-implicit, and resistant to drift.
 */
import { z } from "zod/v4"

import {
  componentNameSchema,
  defineConstMap,
  defineTuple,
} from "../../../schema/shared"
import { shellZoneSchema, type ShellZone } from "../policy/shell-policy"

/** Enterprise matrix: surface scope (distinct from shell-context-policy runtime scope). */
export const shellSurfaceScopeValues = defineTuple([
  "platform",
  "tenant",
  "workspace",
  "user",
  "session",
  "environment",
])
export const shellSurfaceScopeSchema = z.enum(shellSurfaceScopeValues)
export type ShellSurfaceScope = z.infer<typeof shellSurfaceScopeSchema>

export const shellIsolationValues = defineTuple([
  "tenant_strict",
  "workspace_strict",
  "session_bound",
  "global_safe",
])
export const shellIsolationSchema = z.enum(shellIsolationValues)
export type ShellIsolation = z.infer<typeof shellIsolationSchema>

/**
 * Isolation × surfaceScope — cross-field rules
 *
 * `shellIsolationSchema` × `shellSurfaceScopeSchema` is allowed for every pair except one:
 * `shellComponentContractEntrySchema.superRefine` rejects **`workspace_strict` × `surfaceScope` `"platform"`**
 * (issue path `isolation`). All other cross-field rules live in the same `superRefine` (governance tier, `shellAware`).
 *
 * **Quick scan — allowed vs rejected** (`C` = allowed, `X` = rejected by `superRefine`).
 * Rows: `shellIsolationSchema`. Columns: `shellSurfaceScopeSchema` (left → right: platform … environment).
 *
 * ```
 * ┌──────────────────┬──────────┬────────┬───────────┬──────┬─────────┬──────────────┐
 * │ isolation        │ platform │ tenant │ workspace │ user │ session │ environment │
 * ├──────────────────┼──────────┼────────┼───────────┼──────┼─────────┼──────────────┤
 * │ global_safe      │    C     │   C    │     C     │  C   │    C    │      C       │
 * │ tenant_strict    │    C     │   C    │     C     │  C   │    C    │      C       │
 * │ workspace_strict │    X     │   C    │     C     │  C   │    C    │      C       │
 * │ session_bound    │    C     │   C    │     C     │  C   │    C    │      C       │
 * └──────────────────┴──────────┴────────┴───────────┴──────┴─────────┴──────────────┘
 * ```
 *
 * **Also enforced in `superRefine`** (orthogonal to the matrix):
 * - `kind` `"governance"` cannot use `priorityTier` `"foundation"` (see `shellPriorityTierValues`).
 * - Any non-`"none"` value under `participation` requires `shellAware === true`.
 * - `surfaceScope` `"user"` with `isolation` `"tenant_strict"` is rejected (tenant boundary vs user surface).
 * - `kind` `"overlay"` with `priorityTier` `"operational_governance"` is rejected (overlay is product chrome, not ops-governance tier).
 *
 * **Canon usage matrix** (registry precedent — not the same legend as the quick scan above)
 *
 * **Legend**
 * - `C` — pair appears in `shellComponentContract` (canonical precedent).
 * - `.` — allowed by schema; not used in canon yet — justify in review when first introduced.
 * - `X` — invalid (`superRefine`: `workspace_strict` × `"platform"`).
 *
 * Columns: surfaceScope →
 *
 * ```
 *                    │ platform │ tenant │ workspace │ user │ session │ environment │
 * ────────────────────┼──────────┼────────┼───────────┼──────┼─────────┼───────────────┤
 * global_safe         │    C     │   .    │     .     │  .   │    .    │       .       │
 * tenant_strict       │    C     │   C    │     C     │  .   │    .    │       .       │
 * workspace_strict    │    X     │   .    │     C     │  .   │    .    │       .       │
 * session_bound       │    C     │   .    │     .     │  .   │    .    │       .       │
 * ```
 */
export const shellPriorityTierValues = defineTuple([
  "foundation",
  "enterprise_core",
  "operational_governance",
  "expansion",
])
export const shellPriorityTierSchema = z.enum(shellPriorityTierValues)
export type ShellPriorityTier = z.infer<typeof shellPriorityTierSchema>

export const shellComponentKindValues = defineTuple([
  "platform",
  "navigation",
  "command",
  "overlay",
  "content",
  "supporting",
  "identity",
  "security",
  "notification",
  "governance",
])
export const shellComponentKindSchema = z.enum(shellComponentKindValues)
export type ShellComponentKind = z.infer<typeof shellComponentKindSchema>

export const shellParticipationModeValues = defineTuple([
  "required",
  "optional",
  "none",
])
export const shellParticipationModeSchema = z.enum(shellParticipationModeValues)
export type ShellParticipationMode = z.infer<typeof shellParticipationModeSchema>

export const shellParticipationSchema = z
  .object({
    shellMetadata: shellParticipationModeSchema,
    navigationContext: shellParticipationModeSchema,
    commandInfrastructure: shellParticipationModeSchema,
    layoutDensity: shellParticipationModeSchema,
    responsiveShell: shellParticipationModeSchema,
  })
  .strict()
export type ShellParticipation = z.infer<typeof shellParticipationSchema>

export const shellParticipationFieldKeys = [
  "shellMetadata",
  "navigationContext",
  "commandInfrastructure",
  "layoutDensity",
  "responsiveShell",
] as const satisfies ReadonlyArray<keyof ShellParticipation>
export type ShellParticipationFieldKey = (typeof shellParticipationFieldKeys)[number]

export const shellComponentContractEntrySchema = z
  .object({
    key: z.string().trim().min(1),
    componentName: componentNameSchema,
    shellAware: z.boolean(),
    zone: shellZoneSchema.nullable(),
    kind: shellComponentKindSchema,
    surfaceScope: shellSurfaceScopeSchema,
    isolation: shellIsolationSchema,
    priorityTier: shellPriorityTierSchema,
    participation: shellParticipationSchema,
    allowOutsideShellProvider: z.boolean(),
    allowFeatureLevelShellRebinding: z.boolean(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (!value.shellAware && value.zone !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["zone"],
        message: "zone must be null when shellAware is false",
      })
    }

    if (!value.shellAware) {
      for (const key of shellParticipationFieldKeys) {
        const mode = value.participation[key]
        if (mode !== "none") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["participation", key],
            message: `${key} must be "none" when shellAware is false`,
          })
        }
      }
    }

    if (
      value.participation.shellMetadata === "required" &&
      value.allowOutsideShellProvider
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["allowOutsideShellProvider"],
        message:
          "allowOutsideShellProvider cannot be true when shellMetadata is required",
      })
    }

    if (value.kind === "governance" && value.priorityTier === "foundation") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["priorityTier"],
        message:
          'governance components cannot use priorityTier "foundation" (use operational_governance or enterprise_core)',
      })
    }

    if (value.isolation === "workspace_strict" && value.surfaceScope === "platform") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["isolation"],
        message:
          'workspace_strict isolation is inconsistent with surfaceScope "platform" (use workspace scope or relax isolation)',
      })
    }

    if (value.surfaceScope === "user" && value.isolation === "tenant_strict") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["isolation"],
        message:
          'tenant_strict isolation is inconsistent with surfaceScope "user" (relax isolation or narrow surface scope)',
      })
    }

    if (value.kind === "overlay" && value.priorityTier === "operational_governance") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["priorityTier"],
        message:
          'overlay components cannot use priorityTier "operational_governance" (use foundation or enterprise_core)',
      })
    }
  })
export type ShellComponentContractEntry = z.infer<
  typeof shellComponentContractEntrySchema
>

/**
 * Blueprint only — not wired to Zod validation until a contract version bump.
 * Structural grouping of {@link ShellComponentContractEntry}; same field semantics.
 */
export interface ShellParticipationContractV2Blueprint {
  /** Discriminant for forward-compatible parsers. */
  readonly contractVersion: 2

  identity: {
    key: string
    componentName: string
    kind: ShellComponentKind
    priorityTier: ShellPriorityTier
  }

  boundary: {
    surfaceScope: ShellSurfaceScope
    isolation: ShellIsolation
  }

  /** Mirrors {@link ShellComponentContractEntry} `participation`. */
  participation: ShellParticipation

  placement: {
    zone: ShellZone | null
    shellAware: boolean
  }

  policy: {
    allowOutsideShellProvider: boolean
    allowFeatureLevelShellRebinding: boolean
  }
}

/**
 * Pure v1 → v2 projection. Caller should pass values that already satisfy
 * {@link shellComponentContractEntrySchema} (including `superRefine`). No v2 schema yet.
 *
 * @example
 * ```ts
 * import {
 *   shellComponentContract,
 *   shellComponentContractEntryToV2Blueprint,
 * } from "@afenda/shadcn-ui/lib/constant"
 *
 * const entry = shellComponentContract["shell-title"]
 * const blueprint = shellComponentContractEntryToV2Blueprint(entry)
 * // blueprint.contractVersion === 2
 * // blueprint.identity.key === entry.key (structural groupings only; no extra validation)
 * ```
 */
export function shellComponentContractEntryToV2Blueprint(
  entry: ShellComponentContractEntry
): ShellParticipationContractV2Blueprint {
  return {
    contractVersion: 2,
    identity: {
      key: entry.key,
      componentName: entry.componentName,
      kind: entry.kind,
      priorityTier: entry.priorityTier,
    },
    boundary: {
      surfaceScope: entry.surfaceScope,
      isolation: entry.isolation,
    },
    participation: { ...entry.participation },
    placement: {
      zone: entry.zone,
      shellAware: entry.shellAware,
    },
    policy: {
      allowOutsideShellProvider: entry.allowOutsideShellProvider,
      allowFeatureLevelShellRebinding: entry.allowFeatureLevelShellRebinding,
    },
  }
}

/**
 * Stable registry / contract ids. Values in {@link shellComponentContract} must satisfy
 * {@link shellComponentContractEntrySchema} (including grouped `participation`).
 */
export const shellComponentContractKeyValues = defineTuple([
  "shell-action-slot",
  "shell-breadcrumbs",
  "shell-content",
  "shell-degraded-frame",
  "shell-empty-state-frame",
  "shell-header",
  "shell-loading-frame",
  "shell-overlay-container",
  "shell-popover-content",
  "shell-root",
  "shell-search-bar",
  "shell-sidebar",
  "shell-tenant-switcher",
  "shell-title",
  "shell-workspace-switcher",
])
export const shellComponentContractKeySchema = z.enum(
  shellComponentContractKeyValues
)
export type ShellComponentContractKey = z.infer<
  typeof shellComponentContractKeySchema
>

/** Full contract map: each entry uses `participation` from {@link shellParticipationSchema}. */
export const shellComponentContractSchema = z.record(
  shellComponentContractKeySchema,
  shellComponentContractEntrySchema
)
export type ShellComponentContract = z.infer<typeof shellComponentContractSchema>

/** Fallback entry for unknown keys; `participation` must match {@link shellParticipationSchema} (add modes there first). */
export const shellComponentContractDefaults = defineConstMap(
  shellComponentContractEntrySchema.parse({
    key: "unknown",
    componentName: "Unknown",
    shellAware: false,
    zone: null,
    kind: "supporting",
    surfaceScope: "platform",
    isolation: "global_safe",
    priorityTier: "expansion",
    participation: {
      shellMetadata: "none",
      navigationContext: "none",
      commandInfrastructure: "none",
      layoutDensity: "none",
      responsiveShell: "none",
    },
    allowOutsideShellProvider: true,
    allowFeatureLevelShellRebinding: false,
  })
)

export const shellComponentContract = defineConstMap(
  shellComponentContractSchema.parse({
    "shell-action-slot": {
      key: "shell-action-slot",
      componentName: "ShellActionSlot",
      shellAware: true,
      zone: "header",
      kind: "command",
      surfaceScope: "tenant",
      isolation: "tenant_strict",
      priorityTier: "foundation",
      participation: {
        shellMetadata: "required",
        navigationContext: "none",
        commandInfrastructure: "optional",
        layoutDensity: "optional",
        responsiveShell: "optional",
      },
      allowOutsideShellProvider: false,
      allowFeatureLevelShellRebinding: false,
    },
    "shell-breadcrumbs": {
      key: "shell-breadcrumbs",
      componentName: "ShellBreadcrumbs",
      shellAware: true,
      zone: "header",
      kind: "navigation",
      surfaceScope: "workspace",
      isolation: "tenant_strict",
      priorityTier: "enterprise_core",
      participation: {
        shellMetadata: "required",
        navigationContext: "required",
        commandInfrastructure: "none",
        layoutDensity: "optional",
        responsiveShell: "optional",
      },
      allowOutsideShellProvider: false,
      allowFeatureLevelShellRebinding: false,
    },
    "shell-content": {
      key: "shell-content",
      componentName: "ShellContent",
      shellAware: true,
      zone: "content",
      kind: "content",
      surfaceScope: "tenant",
      isolation: "tenant_strict",
      priorityTier: "foundation",
      participation: {
        shellMetadata: "required",
        navigationContext: "none",
        commandInfrastructure: "none",
        layoutDensity: "optional",
        responsiveShell: "optional",
      },
      allowOutsideShellProvider: false,
      allowFeatureLevelShellRebinding: false,
    },
    "shell-degraded-frame": {
      key: "shell-degraded-frame",
      componentName: "ShellDegradedFrame",
      shellAware: true,
      zone: "content",
      kind: "governance",
      surfaceScope: "platform",
      isolation: "global_safe",
      priorityTier: "operational_governance",
      participation: {
        shellMetadata: "required",
        navigationContext: "none",
        commandInfrastructure: "none",
        layoutDensity: "optional",
        responsiveShell: "optional",
      },
      allowOutsideShellProvider: false,
      allowFeatureLevelShellRebinding: false,
    },
    "shell-empty-state-frame": {
      key: "shell-empty-state-frame",
      componentName: "ShellEmptyStateFrame",
      shellAware: true,
      zone: "content",
      kind: "platform",
      surfaceScope: "tenant",
      isolation: "tenant_strict",
      priorityTier: "enterprise_core",
      participation: {
        shellMetadata: "required",
        navigationContext: "none",
        commandInfrastructure: "none",
        layoutDensity: "optional",
        responsiveShell: "optional",
      },
      allowOutsideShellProvider: false,
      allowFeatureLevelShellRebinding: false,
    },
    "shell-header": {
      key: "shell-header",
      componentName: "ShellHeader",
      shellAware: true,
      zone: "header",
      kind: "platform",
      surfaceScope: "platform",
      isolation: "tenant_strict",
      priorityTier: "foundation",
      participation: {
        shellMetadata: "required",
        navigationContext: "optional",
        commandInfrastructure: "optional",
        layoutDensity: "optional",
        responsiveShell: "optional",
      },
      allowOutsideShellProvider: false,
      allowFeatureLevelShellRebinding: false,
    },
    "shell-loading-frame": {
      key: "shell-loading-frame",
      componentName: "ShellLoadingFrame",
      shellAware: true,
      zone: "content",
      kind: "platform",
      surfaceScope: "platform",
      isolation: "global_safe",
      priorityTier: "operational_governance",
      participation: {
        shellMetadata: "required",
        navigationContext: "none",
        commandInfrastructure: "none",
        layoutDensity: "optional",
        responsiveShell: "optional",
      },
      allowOutsideShellProvider: false,
      allowFeatureLevelShellRebinding: false,
    },
    "shell-overlay-container": {
      key: "shell-overlay-container",
      componentName: "ShellOverlayContainer",
      shellAware: true,
      zone: "overlay",
      kind: "overlay",
      surfaceScope: "platform",
      isolation: "session_bound",
      priorityTier: "foundation",
      participation: {
        shellMetadata: "required",
        navigationContext: "none",
        commandInfrastructure: "none",
        layoutDensity: "optional",
        responsiveShell: "optional",
      },
      allowOutsideShellProvider: false,
      allowFeatureLevelShellRebinding: false,
    },
    "shell-popover-content": {
      key: "shell-popover-content",
      componentName: "ShellPopoverContent",
      shellAware: true,
      zone: "overlay",
      kind: "overlay",
      surfaceScope: "platform",
      isolation: "session_bound",
      priorityTier: "foundation",
      participation: {
        shellMetadata: "none",
        navigationContext: "none",
        commandInfrastructure: "none",
        layoutDensity: "optional",
        responsiveShell: "optional",
      },
      allowOutsideShellProvider: true,
      allowFeatureLevelShellRebinding: false,
    },
    "shell-root": {
      key: "shell-root",
      componentName: "ShellRoot",
      shellAware: true,
      zone: "root",
      kind: "platform",
      surfaceScope: "platform",
      isolation: "tenant_strict",
      priorityTier: "foundation",
      participation: {
        shellMetadata: "required",
        navigationContext: "optional",
        commandInfrastructure: "optional",
        layoutDensity: "optional",
        responsiveShell: "optional",
      },
      allowOutsideShellProvider: false,
      allowFeatureLevelShellRebinding: false,
    },
    "shell-search-bar": {
      key: "shell-search-bar",
      componentName: "ShellSearchBar",
      shellAware: true,
      zone: "header",
      kind: "command",
      surfaceScope: "tenant",
      isolation: "tenant_strict",
      priorityTier: "foundation",
      participation: {
        shellMetadata: "required",
        navigationContext: "optional",
        commandInfrastructure: "required",
        layoutDensity: "optional",
        responsiveShell: "optional",
      },
      allowOutsideShellProvider: false,
      allowFeatureLevelShellRebinding: false,
    },
    "shell-sidebar": {
      key: "shell-sidebar",
      componentName: "ShellSidebar",
      shellAware: true,
      zone: "sidebar",
      kind: "navigation",
      surfaceScope: "tenant",
      isolation: "tenant_strict",
      priorityTier: "foundation",
      participation: {
        shellMetadata: "required",
        navigationContext: "required",
        commandInfrastructure: "none",
        layoutDensity: "optional",
        responsiveShell: "optional",
      },
      allowOutsideShellProvider: false,
      allowFeatureLevelShellRebinding: false,
    },
    "shell-tenant-switcher": {
      key: "shell-tenant-switcher",
      componentName: "ShellTenantSwitcher",
      shellAware: true,
      zone: "header",
      kind: "identity",
      surfaceScope: "tenant",
      isolation: "tenant_strict",
      priorityTier: "foundation",
      participation: {
        shellMetadata: "required",
        navigationContext: "optional",
        commandInfrastructure: "none",
        layoutDensity: "optional",
        responsiveShell: "optional",
      },
      allowOutsideShellProvider: false,
      allowFeatureLevelShellRebinding: false,
    },
    "shell-title": {
      key: "shell-title",
      componentName: "ShellTitle",
      shellAware: true,
      zone: "header",
      kind: "platform",
      surfaceScope: "platform",
      isolation: "tenant_strict",
      priorityTier: "foundation",
      participation: {
        shellMetadata: "required",
        navigationContext: "none",
        commandInfrastructure: "none",
        layoutDensity: "optional",
        responsiveShell: "optional",
      },
      allowOutsideShellProvider: false,
      allowFeatureLevelShellRebinding: false,
    },
    "shell-workspace-switcher": {
      key: "shell-workspace-switcher",
      componentName: "ShellWorkspaceSwitcher",
      shellAware: true,
      zone: "header",
      kind: "identity",
      surfaceScope: "workspace",
      isolation: "workspace_strict",
      priorityTier: "foundation",
      participation: {
        shellMetadata: "required",
        navigationContext: "optional",
        commandInfrastructure: "none",
        layoutDensity: "optional",
        responsiveShell: "optional",
      },
      allowOutsideShellProvider: false,
      allowFeatureLevelShellRebinding: false,
    },
  })
)
