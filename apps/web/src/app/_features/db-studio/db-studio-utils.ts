import type { BusinessGlossaryTechnical } from "@afenda/database/studio/snapshots"

/**
 * Counts glossary entries per `domain_module` id (same logic as server
 * `buildDomainModuleMatrix`) so the UI can derive the matrix from one glossary payload.
 */
export function buildDomainModuleEntryCounts(
  entries: ReadonlyArray<{ readonly domain_module: string }>
): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const e of entries) {
    const k = e.domain_module
    counts[k] = (counts[k] ?? 0) + 1
  }
  return counts
}

/** One-line summary for glossary `technical` objects from the API snapshot. */
export function formatGlossaryTechnicalSummary(
  technical: BusinessGlossaryTechnical
): string {
  if (technical.artifact_kind === "table") {
    return technical.table
  }
  return `enum · ${technical.enum_name}`
}

export function shortContentHash(hex: string | undefined): string {
  if (!hex || hex.length < 9) {
    return "—"
  }
  return `${hex.slice(0, 8)}…`
}
