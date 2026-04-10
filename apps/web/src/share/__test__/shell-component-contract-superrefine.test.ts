/**
 * Regression tests for `shellComponentContractEntrySchema` cross-field rules (`superRefine`).
 */
import { describe, expect, it } from "vitest"

import {
  shellComponentContract,
  shellComponentContractEntrySchema,
} from "@afenda/shadcn-ui/lib/constant"

describe("shellComponentContractEntrySchema superRefine", () => {
  it("accepts canonical shell-title entry", () => {
    const r = shellComponentContractEntrySchema.safeParse(
      shellComponentContract["shell-title"]
    )
    expect(r.success).toBe(true)
  })

  it("rejects workspace_strict isolation with platform surfaceScope", () => {
    const base = shellComponentContract["shell-title"]
    const r = shellComponentContractEntrySchema.safeParse({
      ...base,
      isolation: "workspace_strict",
      surfaceScope: "platform",
    })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(
        r.error.issues.some((i) => i.path[0] === "isolation")
      ).toBe(true)
    }
  })

  it("rejects governance kind with foundation priorityTier", () => {
    const base = shellComponentContract["shell-degraded-frame"]
    const r = shellComponentContractEntrySchema.safeParse({
      ...base,
      priorityTier: "foundation",
    })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(
        r.error.issues.some((i) => i.path[0] === "priorityTier")
      ).toBe(true)
    }
  })

  it("rejects tenant_strict isolation with user surfaceScope", () => {
    const base = shellComponentContract["shell-title"]
    const r = shellComponentContractEntrySchema.safeParse({
      ...base,
      surfaceScope: "user",
      isolation: "tenant_strict",
    })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(
        r.error.issues.some((i) => i.path[0] === "isolation")
      ).toBe(true)
    }
  })

  it("rejects overlay kind with operational_governance priorityTier", () => {
    const base = shellComponentContract["shell-overlay-container"]
    const r = shellComponentContractEntrySchema.safeParse({
      ...base,
      priorityTier: "operational_governance",
    })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(
        r.error.issues.some((i) => i.path[0] === "priorityTier")
      ).toBe(true)
    }
  })

  it("rejects non-none participation when shellAware is false", () => {
    const base = shellComponentContract["shell-title"]
    const r = shellComponentContractEntrySchema.safeParse({
      ...base,
      shellAware: false,
      zone: null,
      participation: {
        ...base.participation,
        shellMetadata: "optional",
      },
    })
    expect(r.success).toBe(false)
  })
})
