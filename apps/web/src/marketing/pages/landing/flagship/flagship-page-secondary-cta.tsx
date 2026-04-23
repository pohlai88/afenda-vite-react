/**
 * Flagship page refactor boundary.
 * Owns only the secondary CTA section for `apps/web` marketing flagship.
 * Do not mix page composition, editorial source, or shared motion here.
 * Page order lives in `flagship-page.tsx`.
 * Copy contract lives in `flagship-page-editorial.ts`.
 * Motion helpers live in `flagship-page-motion.ts`.
 */
import { Button } from "@afenda/design-system/ui-primitives"
import { motion } from "framer-motion"
import { ArrowRight, ShieldCheck } from "lucide-react"
import { Link } from "react-router-dom"

import {
  MARKETING_EASE_OUT,
  MarketingSectionHeading,
} from "../../../components"
import { MARKETING_PAGE_HREFS } from "../../../marketing-page-registry"
import { FLAGSHIP_PAGE_CONTENT } from "./flagship-page-editorial"
import { getMarketingPageSectionReveal } from "./flagship-page-motion"

export interface FlagshipPageSecondaryCtaProps {
  readonly reduceMotion: boolean
}

const BINDING_CORNER_DESKTOP_PLACEMENT = [
  "left-[4%] top-[8%]",
  "right-[6%] top-[18%]",
  "left-[10%] bottom-[18%]",
  "right-[3%] bottom-[8%]",
] as const

const { narrative, bindingStructure, closingActionLinks } =
  FLAGSHIP_PAGE_CONTENT

export function FlagshipPageSecondaryCta({
  reduceMotion,
}: FlagshipPageSecondaryCtaProps) {
  return (
    <section
      aria-labelledby="flagship-canon-title"
      className="border-b border-border/70 bg-background"
    >
      <div className="marketing-container py-12 md:py-14 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-center">
          <motion.div {...getMarketingPageSectionReveal(reduceMotion)}>
            <div className="flagship-canon-field relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#060606] p-5 text-white shadow-[0_28px_120px_rgba(0,0,0,0.3)] md:p-7">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.1),transparent_24%),radial-gradient(circle_at_78%_16%,rgba(255,255,255,0.06),transparent_22%),linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))]" />
              <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:52px_52px] opacity-[0.16]" />

              <div className="relative grid gap-4 md:hidden">
                {bindingStructure.cornerNotes.map((corner, index) => (
                  <motion.div
                    key={corner.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4"
                    {...getMarketingPageSectionReveal(
                      reduceMotion,
                      index * 0.05
                    )}
                  >
                    <div className="font-mono text-[10px] tracking-[0.24em] text-white/44 uppercase">
                      {corner.label}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-white/62">
                      {corner.note}
                    </p>
                  </motion.div>
                ))}

                <div className="rounded-[1.75rem] border border-white/12 bg-white/[0.07] px-6 py-8 text-center shadow-xl backdrop-blur-sm">
                  <div className="font-mono text-[10px] tracking-[0.28em] text-white/44 uppercase">
                    <span translate="no">NexusCanon</span>
                  </div>
                  <div className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white">
                    One Record.
                    <br />
                    No Parallel Story.
                  </div>
                </div>
              </div>

              <div className="relative hidden min-h-[38rem] md:block">
                <div className="absolute inset-y-10 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/24 to-transparent" />

                {bindingStructure.cornerNotes.map((corner, index) => (
                  <motion.div
                    key={corner.label}
                    className={`absolute max-w-[13.5rem] rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 shadow-lg backdrop-blur-sm ${BINDING_CORNER_DESKTOP_PLACEMENT[index]}`}
                    initial={{
                      opacity: 0,
                      x: reduceMotion ? 0 : index < 2 ? -18 : 18,
                      y: reduceMotion ? 0 : index % 2 === 0 ? -10 : 10,
                    }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.74,
                      delay: index * 0.06,
                      ease: MARKETING_EASE_OUT,
                    }}
                  >
                    <div className="font-mono text-[10px] tracking-[0.24em] text-white/42 uppercase">
                      {corner.label}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-white/62">
                      {corner.note}
                    </p>
                  </motion.div>
                ))}

                <motion.div
                  className="absolute top-1/2 left-1/2 w-[min(28rem,78%)] -translate-x-1/2 -translate-y-1/2 rounded-[2.2rem] border border-white/12 bg-white/[0.07] px-8 py-10 text-center shadow-2xl backdrop-blur-md"
                  initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.82,
                    delay: 0.12,
                    ease: MARKETING_EASE_OUT,
                  }}
                >
                  <div className="font-mono text-[10px] tracking-[0.28em] text-white/44 uppercase">
                    <span translate="no">NexusCanon</span>
                  </div>

                  <div className="mt-4 text-[clamp(2.5rem,4.4vw,3.8rem)] leading-[0.88] font-semibold tracking-[-0.07em] text-white">
                    One accountable field.
                    <br />
                    No parallel story.
                  </div>

                  <p className="mt-5 text-base leading-7 text-pretty text-white/64">
                    Document, entity, event, and transition stay bound until the
                    business record can stand on its own without narrative
                    repair.
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div {...getMarketingPageSectionReveal(reduceMotion, 0.08)}>
            <MarketingSectionHeading
              kicker="Canonical Record"
              id="flagship-canon-title"
              title="This is where the record stops fragmenting."
              description={narrative.canonDescription}
              descriptionClassName="max-w-xl"
              titleClassName="max-w-2xl"
            />

            <div className="mt-6 grid gap-0 border-y border-border/60">
              {bindingStructure.evidenceLines.map((item, index) => (
                <motion.div
                  key={item}
                  className={`flex items-start gap-4 px-0 py-4 ${index > 0 ? "border-t border-border/60" : ""}`}
                  {...getMarketingPageSectionReveal(
                    reduceMotion,
                    0.12 + index * 0.05
                  )}
                >
                  <div className="mt-1 flex size-7 items-center justify-center rounded-full bg-primary/10">
                    <ShieldCheck
                      aria-hidden="true"
                      className="size-4 text-primary"
                    />
                  </div>
                  <p className="text-sm leading-7 text-pretty text-muted-foreground">
                    {item}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
              {...getMarketingPageSectionReveal(reduceMotion, 0.18)}
            >
              {closingActionLinks.map((item) => (
                <Button
                  key={`${item.label}:${item.to}`}
                  asChild
                  size="sm"
                  variant="outline"
                  className="touch-manipulation border-border/70 bg-background/75"
                >
                  <Link to={item.to}>
                    {item.label}
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </Button>
              ))}
              <Button asChild size="sm" className="touch-manipulation">
                <Link to={MARKETING_PAGE_HREFS.truthEngine}>
                  Inspect the truth engine
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
