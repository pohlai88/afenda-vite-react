/**
 * Flagship page refactor boundary.
 * Owns only the immutable laws section for `apps/web` marketing flagship.
 * Do not mix page composition, editorial source, or shared motion here.
 * Page order lives in `flagship-page.tsx`.
 * Copy contract lives in `flagship-page-editorial.ts`.
 * Motion helpers live in `flagship-page-motion.ts`.
 */
import { cn } from "@afenda/design-system/utils"
import { motion } from "framer-motion"

import {
  MarketingPageSection,
  marketingGlassLightPanel,
} from "../../../components"
import { FLAGSHIP_PAGE_CONTENT } from "./flagship-page-editorial"
import { getMarketingPageSectionReveal } from "./flagship-page-motion"

export interface FlagshipPageImmutableLawsProps {
  readonly reduceMotion: boolean
}

const { narrative, operatingLaws } = FLAGSHIP_PAGE_CONTENT

export function FlagshipPageImmutableLaws({
  reduceMotion,
}: FlagshipPageImmutableLawsProps) {
  return (
    <MarketingPageSection
      aria-labelledby="flagship-operating-laws-title"
      className="border-b border-border/70"
      containerClassName="py-6 md:py-8 lg:py-10"
    >
      <motion.div
        className={cn(
          marketingGlassLightPanel,
          "overflow-hidden p-5 md:p-7 lg:p-9"
        )}
        {...getMarketingPageSectionReveal(reduceMotion)}
      >
        <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12">
          <div className="max-w-xs pt-1">
            <h2
              id="flagship-operating-laws-title"
              className="font-mono text-[11px] tracking-[0.28em] text-muted-foreground uppercase"
            >
              {narrative.immutableLawsHeading}
            </h2>
            <p className="mt-3 max-w-[14rem] text-sm leading-6 text-pretty text-muted-foreground">
              {narrative.operatingLawsLead}
            </p>
          </div>

          <div className="border-y border-border/60">
            {operatingLaws.map((law, index) => (
              <motion.div
                key={law.code}
                className={index > 0 ? "border-t border-border/60" : undefined}
                {...getMarketingPageSectionReveal(
                  reduceMotion,
                  0.06 + index * 0.05
                )}
              >
                <article className="grid gap-4 py-5 md:py-6 lg:grid-cols-[6rem_minmax(0,1fr)_minmax(0,16rem)] lg:items-start lg:gap-6">
                  <div className="space-y-2">
                    <div className="font-mono text-[10px] tracking-[0.24em] text-muted-foreground uppercase">
                      Law {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="font-mono text-[10px] tracking-[0.22em] text-foreground/70 uppercase">
                      {law.code}
                    </div>
                  </div>

                  <div className="max-w-[18rem] text-[1.1rem] leading-[1.08] font-semibold tracking-[-0.03em] text-foreground md:text-[1.18rem]">
                    {law.title}
                  </div>

                  <p className="max-w-[16rem] text-[0.82rem] leading-5 text-pretty text-muted-foreground md:justify-self-end md:text-[0.86rem]">
                    {law.body}
                  </p>
                </article>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </MarketingPageSection>
  )
}
