import { motion } from "framer-motion"

import {
  MarketingPageSection,
  MarketingSectionHeading,
  MarketingStructuralBaseline,
  MarketingStructuralGridBg,
  getMarketingReveal,
} from "../../../components"
import { aboutPageContent } from "./about-page-editorial"

export interface AboutHeroProps {
  readonly reduceMotion: boolean
}

export function AboutHero({ reduceMotion }: AboutHeroProps) {
  const { hero } = aboutPageContent

  return (
    <MarketingPageSection
      className="relative overflow-hidden border-b border-border/70"
      containerClassName="pb-16 pt-28 md:pb-20 lg:pb-24 lg:pt-32"
      aria-labelledby="about-page-hero-heading"
    >
      <MarketingStructuralGridBg />
      <MarketingStructuralBaseline />

      <div className="relative z-[1] grid gap-12 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16">
        <div
          className="relative hidden w-px shrink-0 lg:block"
          aria-hidden="true"
        >
          <div className="absolute inset-y-0 left-0 w-px bg-border/55" />
          <div className="absolute top-0 left-0 h-16 w-px bg-primary/45" />
        </div>

        <div>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-14">
            <motion.div {...getMarketingReveal(reduceMotion)}>
              <MarketingSectionHeading
                as="h1"
                id="about-page-hero-heading"
                kicker={hero.eyebrow}
                title={hero.headline}
                titleClassName="max-w-[22ch] text-[clamp(2.5rem,6.5vw,4.5rem)] leading-[0.93] tracking-[-0.07em] text-balance"
              />
              <p className="mt-8 max-w-3xl text-base leading-8 text-pretty text-muted-foreground">
                {hero.thesis}
              </p>
            </motion.div>

            <motion.div
              className="font-mono text-[10px] leading-none tracking-[0.35em] text-muted-foreground/90 [writing-mode:vertical-rl] max-lg:hidden"
              aria-hidden="true"
              {...getMarketingReveal(reduceMotion, 0.06)}
            >
              AFENDA · COMPANY
            </motion.div>
          </div>

          <motion.p
            className="mt-12 max-w-xl border-l-2 border-primary/45 pl-5"
            {...getMarketingReveal(reduceMotion, 0.08)}
          >
            <span className="font-mono text-[10px] tracking-[0.28em] text-foreground/80 uppercase">
              Annotation
            </span>
            <span className="mt-2 block text-sm leading-7 text-foreground/90">
              {hero.annotation}
            </span>
          </motion.p>
        </div>
      </div>
    </MarketingPageSection>
  )
}
