import { describe, expect, it } from "vitest"

import { GENERATED_THEME_ARTIFACT_CONTRACTS } from "../src/governance/artifact-contracts"
import {
  TOKEN_PIPELINE_CONTRACT,
  TOKEN_PIPELINE_MANIFEST_SCHEMA_VERSION,
} from "../src/governance/token-pipeline-version"
import { THEME_ARTIFACT_MANIFEST_SCHEMA_VERSION } from "../src/tokenization/token-manifest"

describe("token-pipeline-version", () => {
  it("keeps governance manifest schema aligned with token-manifest", () => {
    expect(TOKEN_PIPELINE_MANIFEST_SCHEMA_VERSION).toBe(
      THEME_ARTIFACT_MANIFEST_SCHEMA_VERSION,
    )
  })

  it("matches canonical artifact contract paths", () => {
    expect(TOKEN_PIPELINE_CONTRACT.canonicalArtifactCss).toBe(
      GENERATED_THEME_ARTIFACT_CONTRACTS.canonical.css.relativeFilePath,
    )
    expect(TOKEN_PIPELINE_CONTRACT.canonicalArtifactManifest).toBe(
      GENERATED_THEME_ARTIFACT_CONTRACTS.canonical.manifest.relativeFilePath,
    )
  })
})
