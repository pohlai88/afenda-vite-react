/**
 * Fails if committed JSON snapshots diverge from docs/data/*.yaml.
 * Run in CI: pnpm --filter @afenda/database run studio:check
 */
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import {
  assertGlossarySnapshotMatchesYaml,
  assertTruthGovernanceSnapshotMatchesYaml,
} from "../src/studio/build-studio-snapshots"

const root = dirname(fileURLToPath(import.meta.url))
const pkgRoot = join(root, "..")

const glossaryYamlPath = join(pkgRoot, "docs/data/business-technical-glossary.yaml")
const glossaryJsonPath = join(pkgRoot, "src/studio/business-glossary.snapshot.json")
const govYamlPath = join(pkgRoot, "docs/data/database-truth-governance.yaml")
const govJsonPath = join(pkgRoot, "src/studio/database-truth-governance.snapshot.json")

assertGlossarySnapshotMatchesYaml({
  glossaryYamlUtf8: readFileSync(glossaryYamlPath, "utf8"),
  snapshotJsonUtf8: readFileSync(glossaryJsonPath, "utf8"),
})
assertTruthGovernanceSnapshotMatchesYaml({
  governanceYamlUtf8: readFileSync(govYamlPath, "utf8"),
  snapshotJsonUtf8: readFileSync(govJsonPath, "utf8"),
})

console.log("Studio snapshots are in sync with YAML sources.")
