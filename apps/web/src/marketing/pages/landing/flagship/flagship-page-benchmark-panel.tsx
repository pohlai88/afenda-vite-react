/**
 * Flagship page refactor boundary.
 * Owns only the proof-surface benchmark block for this flagship page.
 * Keep this file page-local and free of unrelated section composition.
 */
import { motion } from "framer-motion"

import { MarketingPageSection } from "../../../components"
import { FLAGSHIP_PAGE_CONTENT } from "./flagship-page-editorial"
import { getMarketingPageSectionReveal } from "./flagship-page-motion"

export interface FlagshipPageBenchmarkPanelProps {
  readonly reduceMotion: boolean
}

const { narrative, marketRealityCards } = FLAGSHIP_PAGE_CONTENT
const attribution = narrative.benchmarkThirdPartyAttribution

function AfendaBrand() {
  return <span translate="no">Afenda</span>
}

export function FlagshipPageBenchmarkPanel({
  reduceMotion,
}: FlagshipPageBenchmarkPanelProps) {
  return (
    <MarketingPageSection
      aria-labelledby="flagship-benchmark-title"
      className="border-b border-border/70 bg-foreground text-background"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-16">
        <motion.div {...getMarketingPageSectionReveal(reduceMotion)}>
          <div className="font-mono text-[11px] tracking-[0.28em] text-background/60 uppercase">
            Market Pain
          </div>
          <h2
            id="flagship-benchmark-title"
            className="mt-5 max-w-4xl text-[clamp(2.6rem,5.4vw,5rem)] leading-[0.92] font-semibold tracking-[-0.055em] text-balance"
          >
            Where enterprise records fail first.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 text-pretty text-background/70">
            <AfendaBrand /> {narrative.benchmarkDescription}
          </p>
        </motion.div>

        <div className="space-y-3">
          <p className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-[0.78rem] leading-5 text-pretty text-background/55 md:text-[0.82rem]">
            {attribution}
          </p>
          {marketRealityCards.map(({ title, body }, index) => (
            <motion.div
              key={title}
              className="rounded-[1.85rem] border border-white/12 bg-white/5 px-5 py-5 shadow-sm backdrop-blur-sm md:px-6 md:py-6"
              {...getMarketingPageSectionReveal(reduceMotion, index * 0.06)}
            >
              <div className="grid gap-4 md:grid-cols-[4.75rem_minmax(0,1fr)] md:items-start md:gap-5">
                <div className="text-[2.5rem] leading-none font-semibold tracking-[-0.08em] text-primary/70 md:text-[3rem]">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="grid gap-3 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:items-start lg:gap-6">
                  <h3 className="max-w-[16rem] text-[1.12rem] font-semibold tracking-[-0.03em] text-balance text-background">
                    {title}
                  </h3>
                  <p className="text-sm leading-6 text-pretty text-background/72 md:text-[0.96rem]">
                    {body}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </MarketingPageSection>
  )
}
