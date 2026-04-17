import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import {
  truthGovernanceSnapshotSchema,
  type TruthGovernanceSnapshot,
} from "./truth-governance.schema"

const here = dirname(fileURLToPath(import.meta.url))
const snapshotPath = join(here, "database-truth-governance.snapshot.json")

let cached: TruthGovernanceSnapshot | null = null

/** Validated truth / scope / time governance snapshot (separate from business glossary). */
export function getTruthGovernanceSnapshot(): TruthGovernanceSnapshot {
  if (!cached) {
    const raw = readFileSync(snapshotPath, "utf8")
    cached = truthGovernanceSnapshotSchema.parse(JSON.parse(raw))
  }
  return cached
}
