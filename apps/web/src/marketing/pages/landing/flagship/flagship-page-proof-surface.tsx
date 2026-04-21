/**
 * Flagship page refactor boundary.
 * Owns only the proof surface section group for `apps/web` marketing flagship.
 * This file composes page-local proof blocks without becoming a mixed dump.
 * Page order lives in `flagship-page.tsx`.
 */
import { FlagshipPageBenchmarkPanel } from "./flagship-page-benchmark-panel"
import { FlagshipPageProofChamber } from "./flagship-page-proof-chamber"
import { FlagshipPageEnforcementScope } from "./flagship-page-enforcement-scope"

export interface FlagshipPageProofSurfaceProps {
  readonly reduceMotion: boolean
}

export function FlagshipPageProofSurface({
  reduceMotion,
}: FlagshipPageProofSurfaceProps) {
  return (
    <>
      <FlagshipPageBenchmarkPanel reduceMotion={reduceMotion} />
      <FlagshipPageEnforcementScope reduceMotion={reduceMotion} />
      <FlagshipPageProofChamber reduceMotion={reduceMotion} />
    </>
  )
}
