import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import {
  assertGlossarySnapshotMatchesYaml,
  assertTruthGovernanceSnapshotMatchesYaml,
} from "../build-studio-snapshots"

const here = dirname(fileURLToPath(import.meta.url))
const pkgRoot = join(here, "../../..")

describe("Studio YAML ↔ committed JSON snapshots", () => {
  it("business glossary snapshot matches business-technical-glossary.yaml", () => {
    expect(() =>
      assertGlossarySnapshotMatchesYaml({
        glossaryYamlUtf8: readFileSync(
          join(pkgRoot, "docs/data/business-technical-glossary.yaml"),
          "utf8"
        ),
        snapshotJsonUtf8: readFileSync(
          join(pkgRoot, "src/studio/business-glossary.snapshot.json"),
          "utf8"
        ),
      })
    ).not.toThrow()
  })

  it("truth governance snapshot matches database-truth-governance.yaml", () => {
    expect(() =>
      assertTruthGovernanceSnapshotMatchesYaml({
        governanceYamlUtf8: readFileSync(
          join(pkgRoot, "docs/data/database-truth-governance.yaml"),
          "utf8"
        ),
        snapshotJsonUtf8: readFileSync(
          join(pkgRoot, "src/studio/database-truth-governance.snapshot.json"),
          "utf8"
        ),
      })
    ).not.toThrow()
  })
})
