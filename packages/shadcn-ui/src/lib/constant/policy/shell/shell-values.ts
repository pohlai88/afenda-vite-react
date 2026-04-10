/**
 * Shell vocabulary — source of truth entry for governed enums used across shell doctrine.
 * Policies **consume** vocabulary modules; they do not author duplicate tuples here.
 *
 * State *behavior* (reset triggers, persistence rules, declared key tables) lives in
 * `shell-state-policy.ts` — import those from there or from the shell package barrel.
 * Scope: zones, scopes, slots, overlay kinds, search scopes, state keys; import from here for cross-policy consistency.
 *
 * **Governance checklist (shell-values barrel)**
 * - Re-export vocabularies only; do not author tuples or schemas here.
 * - Keep tuple + schema + type aligned in leaf modules (`shell-state-key-vocabulary`, policy files).
 * - Update doctrine validators and tests when adding or renaming vocabulary entries.
 * - Prefer leaf imports for state keys when avoiding unrelated barrels; this file stays a vocabulary hub only.
 */
import { ShellStateKeys } from "./shell-state-key-vocabulary"
import { shellOverlayKindValues } from "./policy/shell-overlay-policy"
import { shellScopeValues } from "./policy/shell-context-policy"
import { shellSearchResultClassValues, shellSearchScopeValues } from "./policy/shell-search-policy"
import { shellSlotIdValues } from "./policy/shell-slot-policy"
import { shellZoneValues } from "./policy/shell-policy"

// --- State key vocabulary (authoritative tuple lives in `shell-state-key-vocabulary.ts`)

export {
  ShellStateKeys,
  shellStateKeySchema,
  shellStateKeyValues,
  type ShellStateKey,
} from "./shell-state-key-vocabulary"

// --- Other vocabulary (policy-owned tuples; re-exported here for a single import path)

export {
  shellZoneValues,
  shellZoneSchema,
  type ShellZone,
} from "./policy/shell-policy"
export {
  shellScopeValues,
  shellScopeSchema,
  type ShellScope,
} from "./policy/shell-context-policy"
export {
  shellSlotIdValues,
  shellSlotIdSchema,
  type ShellSlotId,
} from "./policy/shell-slot-policy"
export {
  shellOverlayKindValues,
  shellOverlayKindSchema,
  type ShellOverlayKind,
} from "./policy/shell-overlay-policy"
export {
  shellSearchScopeValues,
  shellSearchScopeSchema,
  type ShellSearchScope,
  shellSearchResultClassValues,
  shellSearchResultClassSchema,
  type ShellSearchResultClass,
} from "./policy/shell-search-policy"

/**
 * Discoverability alias for barrel vocabularies (`ShellVocabulary.Zones`, `ShellVocabulary.StateKeys`, …).
 * Named exports remain preferred for tree-shaking clarity.
 */
export const ShellVocabulary = Object.freeze({
  StateKeys: ShellStateKeys,
  Zones: shellZoneValues,
  Scopes: shellScopeValues,
  Slots: shellSlotIdValues,
  OverlayKinds: shellOverlayKindValues,
  SearchScopes: shellSearchScopeValues,
  SearchResultClasses: shellSearchResultClassValues,
})
