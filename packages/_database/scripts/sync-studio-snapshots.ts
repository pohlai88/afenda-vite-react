/**
 * Reads YAML sources under docs/data/, validates with Zod, writes JSON snapshots under src/studio/.
 *
 * - business-technical-glossary.yaml → business-glossary.snapshot.json
 * - database-truth-governance.yaml → database-truth-governance.snapshot.json
 *
 * Run: pnpm --filter @afenda/database run studio:sync
 * Alias: pnpm --filter @afenda/database run glossary:sync
 */
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import {
  buildBusinessGlossarySnapshotFromYaml,
  buildTruthGovernanceSnapshotFromYaml,
} from "../src/studio/build-studio-snapshots"

const root = dirname(fileURLToPath(import.meta.url))
const pkgRoot = join(root, "..")
const repoRoot = join(pkgRoot, "../..")

function writeSnapshot(path: string, data: unknown): void {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8")
  console.log(`Wrote ${path}`)
}

const glossaryYamlPath = join(pkgRoot, "docs/data/business-technical-glossary.yaml")
const glossaryOutPath = join(pkgRoot, "src/studio/business-glossary.snapshot.json")

const governanceYamlPath = join(pkgRoot, "docs/data/database-truth-governance.yaml")
const governanceOutPath = join(pkgRoot, "src/studio/database-truth-governance.snapshot.json")

const glossaryYaml = readFileSync(glossaryYamlPath, "utf8")
writeSnapshot(
  glossaryOutPath,
  buildBusinessGlossarySnapshotFromYaml(glossaryYaml, repoRoot)
)

const govYaml = readFileSync(governanceYamlPath, "utf8")
writeSnapshot(
  governanceOutPath,
  buildTruthGovernanceSnapshotFromYaml(govYaml, repoRoot)
)
