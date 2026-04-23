/**
 * Flagship page refactor boundary.
 * Owns only the proof-surface chamber block for this page.
 * Keep this file page-local and free of unrelated section composition.
 */
import { motion } from "framer-motion"

import {
  MarketingPageSection,
  MarketingSectionHeading,
} from "../../../components"
import { FLAGSHIP_PAGE_CONTENT } from "./flagship-page-editorial"
import { getMarketingPageSectionReveal } from "./flagship-page-motion"

export interface FlagshipPageProofChamberProps {
  readonly reduceMotion: boolean
}

const { narrative, accountableRecordCards } = FLAGSHIP_PAGE_CONTENT

function AfendaBrand() {
  return <span translate="no">Afenda</span>
}

export function FlagshipPageProofChamber({
  reduceMotion,
}: FlagshipPageProofChamberProps) {
  return (
    <MarketingPageSection
      aria-labelledby="flagship-proof-title"
      className="border-b border-border/70 bg-[#070707] text-white"
    >
      <motion.div
        className="relative rounded-[2.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_120px_rgba(0,0,0,0.34)] md:p-8 lg:p-10"
        {...getMarketingPageSectionReveal(reduceMotion)}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.12),transparent_24%),radial-gradient(circle_at_84%_14%,rgba(255,255,255,0.06),transparent_22%),linear-gradient(140deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]"
        />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-10">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <MarketingSectionHeading
              kicker="Proof Chamber"
              id="flagship-proof-title"
              title="False state cannot survive forward motion."
              description={
                <>
                  <AfendaBrand /> {narrative.proofDescription}
                </>
              }
              titleClassName="max-w-3xl text-white"
              kickerClassName="text-white/50"
              descriptionClassName="max-w-xl text-white/68"
            />

            <motion.aside
              className="mt-8 rounded-[1.85rem] border border-white/10 bg-white/[0.04] p-6 shadow-sm backdrop-blur-sm md:p-7"
              {...getMarketingPageSectionReveal(reduceMotion, 0.08)}
            >
              <div className="font-mono text-[11px] tracking-[0.28em] text-white/44 uppercase">
                Evidence Rail
              </div>
              <h3 className="mt-3 text-[clamp(1.6rem,2.6vw,2.25rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-balance text-white">
                The record cannot pass if reality cannot carry it.
              </h3>

              <ul className="mt-6 grid gap-0">
                {[
                  "Origin must remain attributable.",
                  "Causality must survive the transition.",
                  "State must stay continuous across business consequence.",
                ].map((item, index) => (
                  <motion.li
                    key={item}
                    className="grid grid-cols-[auto_1fr] items-start gap-4 border-t border-white/10 py-4 first:border-t-0 first:pt-0"
                    {...getMarketingPageSectionReveal(
                      reduceMotion,
                      0.12 + index * 0.05
                    )}
                  >
                    <div className="mt-0.5 font-mono text-[10px] tracking-[0.24em] text-white/38 uppercase">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <p className="text-sm leading-7 text-white/68">{item}</p>
                  </motion.li>
                ))}
              </ul>
            </motion.aside>
          </div>

          <div className="space-y-4 lg:pt-16">
            <motion.div
              className="grid gap-3 rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:p-6"
              {...getMarketingPageSectionReveal(reduceMotion, 0.1)}
            >
              <div className="rounded-[1.5rem] border border-white/10 bg-black/22 p-5">
                <div className="border-b border-white/10 pb-3">
                  <div className="font-mono text-[10px] tracking-[0.24em] text-white/48 uppercase">
                    False state
                  </div>
                  <div className="mt-2 h-px w-14 bg-white/16" />
                </div>
                <div className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-white">
                  Fragmented record.
                </div>
                <p className="mt-3 text-sm leading-7 text-white/58">
                  Local systems disagree, manual repair starts, and truth leaks
                  into side process.
                </p>
              </div>

              <div className="flex items-center justify-center px-1">
                <div className="rounded-[1.4rem] border border-white/12 bg-white/8 px-4 py-3 text-center">
                  <div className="font-mono text-[10px] tracking-[0.24em] text-white/54 uppercase">
                    Law Engine
                  </div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    Enforce
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/12 bg-white/[0.08] p-5">
                <div className="border-b border-white/10 pb-3">
                  <div className="font-mono text-[10px] tracking-[0.24em] text-white/48 uppercase">
                    Verified continuity
                  </div>
                  <div className="mt-2 h-px w-14 bg-white/16" />
                </div>
                <div className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-white">
                  Trusted state.
                </div>
                <p className="mt-3 text-sm leading-7 text-white/62">
                  Origin, movement, evidence, and consequence still belong to
                  one accountable truth chain.
                </p>
              </div>
            </motion.div>

            <div className="grid gap-3 md:grid-cols-2">
              {accountableRecordCards.map(
                ({ title, body, icon: Icon }, index) => (
                  <motion.div
                    key={title}
                    className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 shadow-sm backdrop-blur-sm md:p-6"
                    {...getMarketingPageSectionReveal(
                      reduceMotion,
                      0.14 + index * 0.05
                    )}
                  >
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-white/8">
                      <Icon aria-hidden="true" className="size-5 text-white" />
                    </div>
                    <h3 className="mt-4 text-[1.12rem] font-semibold tracking-[-0.03em] text-white">
                      {title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-pretty text-white/62">
                      {body}
                    </p>
                  </motion.div>
                )
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </MarketingPageSection>
  )
}
