import { describe, expect, it } from "vitest"

import {
  validatePrimitiveManifest,
  type PrimitiveGovernanceManifest,
} from "../../../ui-primitives/manifest-contract"

describe("manifest contract", () => {
  it("accepts minimal required governance fields", () => {
    const manifest: PrimitiveGovernanceManifest = {
      owner: "design-system",
      lifecycle: "stable",
      purpose: "Canonical governance metadata for testing.",
    }

    expect(() => validatePrimitiveManifest(manifest, "test")).not.toThrow()
  })

  it("rejects duplicate implementation fields", () => {
    expect(() =>
      validatePrimitiveManifest(
        {
          owner: "design-system",
          lifecycle: "stable",
          purpose: "invalid",
          variants: ["default"],
        },
        "test"
      )
    ).toThrow(/not allowed in manifest/i)
  })

  it("rejects missing required fields", () => {
    expect(() =>
      validatePrimitiveManifest(
        {
          lifecycle: "stable",
          purpose: "invalid",
        },
        "test"
      )
    ).toThrow(/owner/i)

    expect(() =>
      validatePrimitiveManifest(
        {
          owner: "design-system",
          lifecycle: "stable",
        },
        "test"
      )
    ).toThrow(/purpose/i)
  })
})
