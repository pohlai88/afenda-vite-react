import { motion } from "framer-motion"

import {
  MarketingPageSection,
  MarketingSectionHeading,
  MarketingStructuralGridBg,
  getMarketingReveal,
} from "../../../components"
import { aboutPageContent } from "./about-page-editorial"

export interface AboutSection02TruthPositioningProps {
  readonly reduceMotion: boolean
}

export function AboutSection02TruthPositioning({
  reduceMotion,
}: AboutSection02TruthPositioningProps) {
  const { truthPositioning } = aboutPageContent

  const latticeId = "about-page-section-02-lattice"

  return (
    <MarketingPageSection
      className="relative border-b border-border/70"
      aria-labelledby="about-page-section-02-heading"
    >
      <MarketingStructuralGridBg sizePx={48} className="opacity-[0.04]" />

      <div className="relative z-[1]">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-16">
          <motion.div {...getMarketingReveal(reduceMotion)}>
            <MarketingSectionHeading
              as="h2"
              id="about-page-section-02-heading"
              kicker="Section 02"
              title={truthPositioning.title}
              titleClassName="max-w-[32ch] tracking-[-0.045em] text-balance"
            />
            <div className="mt-8 max-w-3xl space-y-6 text-base leading-8 text-pretty text-muted-foreground">
              {truthPositioning.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="border-t border-l-0 border-border/70 pt-10 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10"
            {...getMarketingReveal(reduceMotion, 0.06)}
            role="region"
            aria-labelledby={latticeId}
          >
            <p
              id={latticeId}
              className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase"
            >
              Chaos → structured truth
            </p>
            <div className="mt-6">
              {truthPositioning.transformationLattice.map((row, rowIndex) => (
                <div
                  key={`${row.defaultMode.slice(0, 24)}-${String(rowIndex)}`}
                  className={`grid gap-3 border-t border-border/70 pt-6 md:grid-cols-2 md:gap-0 ${rowIndex === 0 ? "border-t-0 pt-0" : ""}`}
                >
                  <div className="border-b border-border/60 pb-4 md:border-r md:border-b-0 md:pr-6 md:pb-0">
                    <span className="font-mono text-[10px] tracking-[0.24em] text-muted-foreground/85 uppercase">
                      Default
                    </span>
                    <p className="mt-2 text-sm leading-7 text-pretty text-muted-foreground">
                      {row.defaultMode}
                    </p>
                  </div>
                  <div className="pt-4 md:pt-0 md:pl-6">
                    <span className="font-mono text-[10px] tracking-[0.24em] text-primary/90 uppercase">
                      AFENDA
                    </span>
                    <p className="mt-2 text-sm leading-7 text-pretty text-foreground/95">
                      {row.afendaMode}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.blockquote
          className="relative z-[1] mt-16 max-w-4xl border-l-2 border-primary/50 pl-6 md:mt-20 md:pl-8"
          {...getMarketingReveal(reduceMotion, 0.1)}
        >
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            Thesis line
          </p>
          <p className="mt-3 text-lg leading-8 text-pretty text-foreground/95">
            {truthPositioning.contrast}
          </p>
        </motion.blockquote>
      </div>
    </MarketingPageSection>
  )
}
