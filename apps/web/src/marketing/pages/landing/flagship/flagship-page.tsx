/**
 * Flagship page composer.
 * Owns section order only (ADR-0006 `pages/landing/flagship/`, MARKETING_FRONTEND_CONTRACT).
 * Maps 1:1 to docs/marketing/FLAGSHIP_SECTION_MATRIX.md:
 *   Hero → Operating Laws → Benchmark → Product Scope → Proof → Canon → Final CTA.
 * Proof-surface child order is fixed in `flagship-page-proof-surface.tsx`.
 * Do not place section internals, copy definitions, or motion presets here.
 */
import { useReducedMotion } from "framer-motion"

import { MarketingPageShell } from "../../../components"
import { FLAGSHIP_PAGE_CONTENT } from "./flagship-page-editorial"
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
      title={FLAGSHIP_PAGE_CONTENT.hero.shellTitle}
      tagline={FLAGSHIP_PAGE_CONTENT.hero.shellTagline}
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
