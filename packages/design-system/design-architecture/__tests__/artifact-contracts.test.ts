import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

import { GENERATED_THEME_ARTIFACT_CONTRACTS } from "../src/governance/artifact-contracts"

/** Monorepo root (…/afenda-react-vite), four levels up from this file. */
function monorepoRoot(): string {
  return path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "..",
    "..",
    "..",
  )
}

describe("artifact-contracts", () => {
  it("lists canonical generator paths that exist on disk", () => {
    const root = monorepoRoot()
    const { canonical } = GENERATED_THEME_ARTIFACT_CONTRACTS

    expect(
      existsSync(path.join(root, canonical.css.relativeFilePath)),
    ).toBe(true)
    expect(
      existsSync(path.join(root, canonical.manifest.relativeFilePath)),
    ).toBe(true)
  })

})
