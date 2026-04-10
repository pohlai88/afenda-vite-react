/**
 * STATE KEY VOCABULARY — shell (leaf module)
 * Canonical tuple + schema for governed shell UI state keys. Policies import this module only
 * (not the `shell-values` barrel) to avoid pulling unrelated vocabulary and to keep types crisp.
 * Re-exported from `shell-values.ts` as the doctrine entry for consumers.
 *
 * **Governance checklist (shell state key vocabulary)**
 * - Add new keys in the tuple below only; keep `shellStateKeyValues` and `shellStateKeySchema` aligned (same source tuple).
 * - Update `shell-state-policy` declarations, doctrine tests, and governance scripts when adding keys.
 * - Do not fold unrelated vocabularies into this file; keep it a leaf module.
 */
import { z } from "zod/v4"

import { defineTuple } from "../../schema/shared"

export const shellStateKeyValues = defineTuple([
  "sidebar.collapsed",
  "overlay.stack",
  "command.palette.open",
])
export const shellStateKeySchema = z.enum(shellStateKeyValues)
export type ShellStateKey = z.infer<typeof shellStateKeySchema>

/**
 * Discoverability alias (`ShellStateKeys.values`, `ShellStateKeys.schema`). Named exports remain
 * preferred for tree-shaking clarity.
 */
export const ShellStateKeys = Object.freeze({
  values: shellStateKeyValues,
  schema: shellStateKeySchema,
})
