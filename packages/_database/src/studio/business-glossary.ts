import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import {
  businessGlossarySnapshotSchema,
  type BusinessGlossarySnapshot,
} from "./business-glossary.schema"

const here = dirname(fileURLToPath(import.meta.url))
const snapshotPath = join(here, "business-glossary.snapshot.json")

let cached: BusinessGlossarySnapshot | null = null

/** Validated business ↔ technical glossary snapshot (from YAML via `studio:sync`). */
export function getBusinessGlossarySnapshot(): BusinessGlossarySnapshot {
  if (!cached) {
    const raw = readFileSync(snapshotPath, "utf8")
    cached = businessGlossarySnapshotSchema.parse(JSON.parse(raw))
  }
  return cached
}

/** Entry counts keyed by `domain_module` id. */
export function buildDomainModuleMatrix(
  doc: BusinessGlossarySnapshot
): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const e of doc.entries) {
    const k = e.domain_module
    counts[k] = (counts[k] ?? 0) + 1
  }
  return counts
}

/** @deprecated Use {@link buildDomainModuleMatrix} */
export const buildSemanticClassMatrix = buildDomainModuleMatrix
