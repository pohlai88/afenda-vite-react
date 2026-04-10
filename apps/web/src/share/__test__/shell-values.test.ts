/**
 * `shell-values` barrel — each `z.enum` stays aligned with its canonical tuple (Zod v4 `.options`).
 * State keys are also covered in `shell-state-key-vocabulary.test.ts`.
 */
import { describe, expect, it } from "vitest"

import {
  ShellStateKeys,
  ShellVocabulary,
  shellOverlayKindSchema,
  shellOverlayKindValues,
  shellScopeSchema,
  shellScopeValues,
  shellSearchResultClassSchema,
  shellSearchResultClassValues,
  shellSearchScopeSchema,
  shellSearchScopeValues,
  shellSlotIdSchema,
  shellSlotIdValues,
  shellStateKeySchema,
  shellStateKeyValues,
  shellZoneSchema,
  shellZoneValues,
} from "@afenda/shadcn-ui/lib/constant/policy/shell/shell-values"

describe("shell-values barrel — schema ↔ tuple alignment", () => {
  it("keeps every enum schema aligned with its values tuple", () => {
    expect(shellStateKeySchema.options).toEqual([...shellStateKeyValues])
    expect(shellZoneSchema.options).toEqual([...shellZoneValues])
    expect(shellScopeSchema.options).toEqual([...shellScopeValues])
    expect(shellSlotIdSchema.options).toEqual([...shellSlotIdValues])
    expect(shellOverlayKindSchema.options).toEqual([...shellOverlayKindValues])
    expect(shellSearchScopeSchema.options).toEqual([...shellSearchScopeValues])
    expect(shellSearchResultClassSchema.options).toEqual([...shellSearchResultClassValues])
  })
})

describe("ShellVocabulary namespace", () => {
  it("mirrors the same value tuples as named exports", () => {
    expect(ShellVocabulary.StateKeys).toBe(ShellStateKeys)
    expect(ShellVocabulary.Zones).toBe(shellZoneValues)
    expect(ShellVocabulary.Scopes).toBe(shellScopeValues)
    expect(ShellVocabulary.Slots).toBe(shellSlotIdValues)
    expect(ShellVocabulary.OverlayKinds).toBe(shellOverlayKindValues)
    expect(ShellVocabulary.SearchScopes).toBe(shellSearchScopeValues)
    expect(ShellVocabulary.SearchResultClasses).toBe(shellSearchResultClassValues)
  })
})
