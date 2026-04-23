/**
 * Flagship page refactor boundary.
 * Owns only the proof-surface enforcement scope block for this page.
 * Keep this file page-local and free of unrelated section composition.
 */
import { motion } from "framer-motion"

import {
  MarketingPageSection,
  MarketingSectionHeading,
} from "../../../components"
import { FLAGSHIP_PAGE_CONTENT } from "./flagship-page-editorial"
import { getMarketingPageSectionReveal } from "./flagship-page-motion"

export interface FlagshipPageEnforcementScopeProps {
  readonly reduceMotion: boolean
}

const { narrative, continuityScopeCards, fieldPracticeLines } =
  FLAGSHIP_PAGE_CONTENT

function AfendaBrand() {
  return <span translate="no">Afenda</span>
}

export function FlagshipPageEnforcementScope({
  reduceMotion,
}: FlagshipPageEnforcementScopeProps) {
  return (
    <MarketingPageSection
      aria-labelledby="flagship-scope-title"
      className="border-b border-border/70 bg-background"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
        <motion.div {...getMarketingPageSectionReveal(reduceMotion)}>
          <MarketingSectionHeading
            kicker="Enforcement Surface"
            id="flagship-scope-title"
            title="Enforce truth where activity becomes consequence."
            description={
              <>
                <AfendaBrand /> {narrative.scopeDescription}
              </>
            }
          />
        </motion.div>

        <div className="space-y-4">
          {continuityScopeCards.map(({ title, body, icon: Icon }, index) => (
            <motion.div
              key={title}
              className="overflow-hidden rounded-[2rem] border border-border/60 bg-background/88 shadow-sm"
              {...getMarketingPageSectionReveal(reduceMotion, index * 0.06)}
            >
              <div className="h-1 w-full bg-gradient-to-r from-primary/70 via-primary/20 to-transparent" />
              <div className="grid gap-4 px-5 py-5 md:grid-cols-[3.5rem_minmax(0,10rem)_minmax(0,1fr)] md:items-start md:gap-6 md:px-6 md:py-6">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon aria-hidden="true" className="size-5 text-primary" />
                </div>
                <h3 className="text-[1.15rem] font-semibold tracking-[-0.03em] text-foreground">
                  {title}
                </h3>
                <p className="max-w-xl text-sm leading-7 text-pretty text-muted-foreground">
                  {body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        className="mt-8 border-t border-border/60 pt-8"
        {...getMarketingPageSectionReveal(reduceMotion, 0.12)}
      >
        <div className="grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-8">
          <div>
            <div className="font-mono text-[11px] tracking-[0.24em] text-muted-foreground uppercase">
              In Practice
            </div>
            <div className="mt-3 text-xl font-semibold tracking-[-0.03em] text-foreground">
              Immutable truth in operational motion.
            </div>
          </div>

          <ul className="grid gap-3 text-sm leading-7 text-muted-foreground md:grid-cols-2">
            {fieldPracticeLines.map((point) => (
              <li
                key={point}
                className="min-w-0 rounded-2xl border border-border/60 bg-background/72 px-4 py-4"
              >
                {point}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </MarketingPageSection>
  )
}
