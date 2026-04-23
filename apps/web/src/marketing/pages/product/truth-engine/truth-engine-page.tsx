import { useReducedMotion } from "framer-motion"

import { MarketingPageShell } from "../../../components"
import { truthEngineEditorial } from "./truth-engine-page-editorial"
import { TruthEnginePageSectionClosingCta } from "./truth-engine-page-section-closing-cta"
import { TruthEnginePageSectionContinuityModel } from "./truth-engine-page-section-continuity-model"
import { TruthEnginePageSectionIdentity } from "./truth-engine-page-section-identity"
import { TruthEnginePageSectionOperatingLaw } from "./truth-engine-page-section-operating-law"
import { TruthEnginePageSectionProofSurface } from "./truth-engine-page-section-proof-surface"

export default function TruthEnginePage() {
  const reduceMotion = !!useReducedMotion()
  const { shell } = truthEngineEditorial

  return (
    <MarketingPageShell title={shell.title} tagline={shell.tagline}>
      <TruthEnginePageSectionIdentity reduceMotion={reduceMotion} />
      <TruthEnginePageSectionOperatingLaw reduceMotion={reduceMotion} />
      <TruthEnginePageSectionContinuityModel reduceMotion={reduceMotion} />
      <TruthEnginePageSectionProofSurface reduceMotion={reduceMotion} />
      <TruthEnginePageSectionClosingCta reduceMotion={reduceMotion} />
    </MarketingPageShell>
  )
}
