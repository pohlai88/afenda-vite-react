import { motion } from "framer-motion"

import {
  MarketingStructuralVerticalRulesBg,
  MarketingPageSection,
  MarketingSectionHeading,
  getMarketingReveal,
} from "../../../components"
import { erpBenchmarkEditorial } from "./erp-benchmark-page-editorial"

export interface ErpBenchmarkPageSectionPositioningProps {
  readonly reduceMotion: boolean
}

export function ErpBenchmarkPageSectionPositioning({
  reduceMotion,
}: ErpBenchmarkPageSectionPositioningProps) {
  const { positioning } = erpBenchmarkEditorial
  const latticeId = "erp-benchmark-reframe-lattice"
  const markerId = "erp-benchmark-position-markers"

  return (
    <MarketingPageSection
      className="relative border-b border-border/70"
      aria-labelledby="erp-benchmark-positioning-heading"
    >
      <MarketingStructuralVerticalRulesBg
        gapPx={108}
        className="opacity-[0.03]"
      />

      <div className="relative z-[1]">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-16">
          <motion.div {...getMarketingReveal(reduceMotion)}>
            <MarketingSectionHeading
              as="h2"
              id="erp-benchmark-positioning-heading"
              kicker="Afenda position"
              title={positioning.title}
              titleClassName="max-w-[32ch] tracking-[-0.045em] text-balance"
            />
            <div className="mt-8 max-w-3xl space-y-6 text-base leading-8 text-pretty text-muted-foreground">
              {positioning.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </motion.div>

          <motion.div
            {...getMarketingReveal(reduceMotion, 0.06)}
            role="region"
            aria-labelledby={latticeId}
          >
            <p
              id={latticeId}
              className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase"
            >
              Benchmark question → Afenda standard
            </p>
            <div className="mt-6">
              {positioning.reframes.map((row, rowIndex) => (
                <div
                  key={row.benchmarkQuestion}
                  className={`grid gap-3 border-t border-border/70 pt-6 md:grid-cols-2 md:gap-0 ${rowIndex === 0 ? "border-t-0 pt-0" : ""}`}
                >
                  <div className="border-b border-border/60 pb-4 md:border-r md:border-b-0 md:pr-6 md:pb-0">
                    <span className="font-mono text-[10px] tracking-[0.24em] text-muted-foreground/85 uppercase">
                      Room asks
                    </span>
                    <p className="mt-2 text-sm leading-7 text-pretty text-muted-foreground">
                      {row.benchmarkQuestion}
                    </p>
                  </div>
                  <div className="pt-4 md:pt-0 md:pl-6">
                    <span className="font-mono text-[10px] tracking-[0.24em] text-primary/90 uppercase">
                      Afenda tests
                    </span>
                    <p className="mt-2 text-sm leading-7 text-pretty text-foreground/95">
                      {row.afendaStandard}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mt-14"
          {...getMarketingReveal(reduceMotion, 0.08)}
          role="region"
          aria-labelledby={markerId}
        >
          <p
            id={markerId}
            className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase"
          >
            Position markers
          </p>
          <div className="mt-4 overflow-x-auto [-webkit-overflow-scrolling:touch]">
            <ol className="grid min-w-[44rem] grid-cols-4 border-y border-border/70 md:min-w-0">
              {positioning.markers.map((marker, index) => (
                <li
                  key={marker}
                  className="border-r border-border/60 px-5 py-4 last:border-r-0"
                >
                  <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-2 text-sm leading-7 text-pretty text-foreground/92">
                    {marker}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </motion.div>

        <motion.blockquote
          className="mt-12 max-w-4xl border-l-2 border-primary/45 pl-6"
          {...getMarketingReveal(reduceMotion, 0.1)}
        >
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            Closing line
          </p>
          <p className="mt-3 text-lg leading-8 text-pretty text-foreground/95">
            {positioning.closing}
          </p>
        </motion.blockquote>
      </div>
    </MarketingPageSection>
  )
}
