import { useReducedMotion } from "framer-motion"

import { MarketingPageShell } from "../../_components"
import {
  FlagshipBenchmarkSection,
  FlagshipCanonSection,
  FlagshipFinalSection,
  FlagshipHeroSection,
  FlagshipOperatingLawsSection,
  FlagshipProductScopeSection,
  FlagshipProofSection,
} from "./flagship-sections"

export default function AfendaFlagshipPage() {
  const reduceMotion = useReducedMotion()
  const isReducedMotion = !!reduceMotion

  return (
    <MarketingPageShell
      title="Afenda Truth Layer"
      tagline="Immutable law enforcement for business truth"
      hideHeader
    >
      <FlagshipHeroSection reduceMotion={isReducedMotion} />
      <FlagshipOperatingLawsSection reduceMotion={isReducedMotion} />
      <FlagshipBenchmarkSection reduceMotion={isReducedMotion} />
      <FlagshipProductScopeSection reduceMotion={isReducedMotion} />
      <FlagshipProofSection reduceMotion={isReducedMotion} />
      <FlagshipCanonSection reduceMotion={isReducedMotion} />
      <FlagshipFinalSection reduceMotion={isReducedMotion} />
    </MarketingPageShell>
  )
}
