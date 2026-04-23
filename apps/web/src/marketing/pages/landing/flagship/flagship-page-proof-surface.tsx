/**
 * Flagship page refactor boundary.
 * Owns the middle band of FLAGSHIP_SECTION_MATRIX rows in order:
 * Benchmark → Product Scope (enforcement) → Proof.
 * Page order in `flagship-page.tsx`; do not reorder without updating the matrix doc.
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
