/**
 * Flagship page composer.
 * Owns section order only.
 * Do not place section internals, copy definitions, or motion presets here.
 */
import { useReducedMotion } from "framer-motion"

import { MarketingPageShell } from "../../_components"
import { FlagshipPageCloseCta } from "./flagship-page-close-cta"
import { FlagshipPageHero } from "./flagship-page-hero"
import { FlagshipPageImmutableLaws } from "./flagship-page-immutable-laws"
import { FlagshipPageProofSurface } from "./flagship-page-proof-surface"
import { FlagshipPageSecondaryCta } from "./flagship-page-secondary-cta"

export default function AfendaFlagshipPage() {
  const reduceMotion = useReducedMotion()
  const isReducedMotion = !!reduceMotion

  return (
    <MarketingPageShell
      title="Afenda Truth Layer"
      tagline="Immutable law enforcement for business truth"
      hideHeader
    >
      <FlagshipPageHero reduceMotion={isReducedMotion} />
      <FlagshipPageImmutableLaws reduceMotion={isReducedMotion} />
      <FlagshipPageProofSurface reduceMotion={isReducedMotion} />
      <FlagshipPageSecondaryCta reduceMotion={isReducedMotion} />
      <FlagshipPageCloseCta reduceMotion={isReducedMotion} />
    </MarketingPageShell>
  )
}
