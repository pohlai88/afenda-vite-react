import { createHash } from "node:crypto"

import type { TruthRecordEnvelope } from "./truth-record.model.js"

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => canonicalize(item))
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, canonicalize(nested)])
    )
  }

  return value
}

export function hashTruthRecordEnvelope(input: TruthRecordEnvelope): string {
  const payload = {
    ...input,
    timestamp: input.timestamp.toISOString(),
    invariantRefs: [...(input.invariantRefs ?? [])].sort(),
    beforeState: canonicalize(input.beforeState),
    afterState: canonicalize(input.afterState),
    metadata: canonicalize(input.metadata ?? {}),
  }

  return createHash("sha256").update(JSON.stringify(payload)).digest("hex")
}
