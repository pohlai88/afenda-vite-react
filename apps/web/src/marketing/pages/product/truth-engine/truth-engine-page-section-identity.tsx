import { motion } from "framer-motion"

import {
  MarketingStructuralBaseline,
  MarketingStructuralGridBg,
  MarketingPageSection,
  MarketingSectionHeading,
  getMarketingReveal,
} from "../../../components"
import { truthEngineEditorial } from "./truth-engine-page-editorial"

export interface TruthEnginePageSectionIdentityProps {
  readonly reduceMotion: boolean
}

export function TruthEnginePageSectionIdentity({
  reduceMotion,
}: TruthEnginePageSectionIdentityProps) {
  const { opening } = truthEngineEditorial

  return (
    <MarketingPageSection
      className="relative overflow-hidden border-b border-border/70"
      containerClassName="pb-16 pt-28 md:pb-20 lg:pb-24 lg:pt-32"
      aria-labelledby="truth-engine-hero-heading"
    >
      <MarketingStructuralGridBg className="opacity-[0.05]" />
      <MarketingStructuralBaseline />

      <div className="relative z-[1] grid gap-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,22rem)] lg:items-start lg:gap-16">
        <div className="grid gap-10 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-14">
          <div
            className="relative hidden w-px shrink-0 lg:block"
            aria-hidden="true"
          >
            <div className="absolute inset-y-0 left-0 w-px bg-border/55" />
            <div className="absolute top-0 left-0 h-16 w-px bg-primary/45" />
          </div>

          <div>
            <motion.div {...getMarketingReveal(reduceMotion)}>
              <MarketingSectionHeading
                as="h1"
                id="truth-engine-hero-heading"
                kicker={opening.eyebrow}
                title={opening.headline}
                titleClassName="max-w-[14ch] text-[clamp(3rem,8vw,5.8rem)] leading-[0.9] tracking-[-0.07em] text-balance"
              />
              <p className="mt-8 max-w-3xl text-base leading-8 text-pretty text-muted-foreground">
                {opening.thesis}
              </p>
            </motion.div>

            <motion.p
              className="mt-12 max-w-xl border-l-2 border-primary/45 pl-5"
              {...getMarketingReveal(reduceMotion, 0.08)}
            >
              <span className="font-mono text-[10px] tracking-[0.28em] text-foreground/80 uppercase">
                Annotation
              </span>
              <span className="mt-2 block text-sm leading-7 text-foreground/90">
                {opening.annotation}
              </span>
            </motion.p>
          </div>
        </div>

        <motion.aside
          className="lg:sticky lg:top-28 lg:self-start"
          {...getMarketingReveal(reduceMotion, 0.06)}
        >
          <div className="border-l-2 border-border/70 pl-6 lg:pl-8">
            <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
              Identity lines
            </p>
            <ol className="mt-6 border-t border-border/70">
              {opening.identityLines.map((line, index) => (
                <li key={line} className="border-b border-border/60 py-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-mono text-xs text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-right text-sm leading-7 text-foreground/92">
                      {line}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </motion.aside>
      </div>
    </MarketingPageSection>
  )
}
