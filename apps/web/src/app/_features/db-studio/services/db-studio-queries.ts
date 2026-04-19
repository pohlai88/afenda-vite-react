import type { QueryClient } from "@tanstack/react-query"

import {
  businessGlossarySnapshotSchema,
  studioEnumsResponseSchema,
  truthGovernanceSnapshotSchema,
} from "@afenda/database/studio/snapshots"

import {
  getSharedApiClient,
  resolveApiV1Path,
} from "../../../_platform/runtime"

export const DB_STUDIO_GLOSSARY_STALE_MS = 30 * 60 * 1000

export const studioQueryKeys = {
  glossary: ["studio", "glossary"] as const,
  enums: ["studio", "enums"] as const,
  truthGovernance: ["studio", "truth-governance"] as const,
}

export async function fetchStudioGlossary() {
  const client = getSharedApiClient()
  const raw = await client.get<unknown>(resolveApiV1Path("/studio/glossary"))
  return businessGlossarySnapshotSchema.parse(raw)
}

export async function fetchStudioEnums() {
  const client = getSharedApiClient()
  const raw = await client.get<unknown>(resolveApiV1Path("/studio/enums"))
  return studioEnumsResponseSchema.parse(raw)
}

export async function fetchStudioTruthGovernance() {
  const client = getSharedApiClient()
  const raw = await client.get<unknown>(
    resolveApiV1Path("/studio/truth-governance")
  )
  return truthGovernanceSnapshotSchema.parse(raw)
}

/**
 * Prefetch read-only Studio payloads (glossary, truth governance, enums) for snappier first paint.
 * Domain-module matrix is derived client-side from the glossary snapshot (no extra request).
 * Safe to call from rail hover/focus before navigation.
 */
export function prefetchDbStudioCatalog(
  queryClient: QueryClient
): Promise<void> {
  const stale = DB_STUDIO_GLOSSARY_STALE_MS
  return Promise.all([
    queryClient.prefetchQuery({
      queryKey: studioQueryKeys.glossary,
      staleTime: stale,
      gcTime: stale * 2,
      queryFn: fetchStudioGlossary,
    }),
    queryClient.prefetchQuery({
      queryKey: studioQueryKeys.enums,
      staleTime: stale,
      gcTime: stale * 2,
      queryFn: fetchStudioEnums,
    }),
    queryClient.prefetchQuery({
      queryKey: studioQueryKeys.truthGovernance,
      staleTime: stale,
      gcTime: stale * 2,
      queryFn: fetchStudioTruthGovernance,
    }),
  ]).then(() => undefined)
}
