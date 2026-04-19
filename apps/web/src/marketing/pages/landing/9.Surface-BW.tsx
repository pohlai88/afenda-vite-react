import { memo, useEffect, useMemo, useState } from "react"
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"

/**
 * AFENDA // THE MACHINE
 *
 * Marketing-only monolith surface.
 * Black & white editorial architecture.
 * Doctrine-first, evidence-first, confrontation-first.
 * No product-grid behavior.
 * No dashboard feel.
 * No playful motion.
 * Motion is restrained, slow, and atmospheric.
 */

const doctrineCycle = [
  "ASSUME NOTHING",
  "PROVE IT",
  "SHOW SOURCE",
  "WHAT CHANGED IT",
  "BIND THE CAUSE",
] as const

const principles = [
  {
    id: "001",
    title: "Assume Nothing",
    statement:
      "Nothing is trusted. Nothing is implied. Nothing is carried forward without proof.",
    verdict: "UNPROVEN INPUT IS REJECTED",
    detail:
      "Every number must answer where it came from, why it exists, and what changed it. If it cannot, it does not belong.",
  },
  {
    id: "002",
    title: "Execution Is Free. Truth Is Not.",
    statement: "You execute. The system records.",
    verdict: "EVERY ACTION BECOMES EVIDENCE",
    detail:
      "Standard systems block users because their audit trails are weak. AFENDA does not interrupt execution. It binds execution to truth.",
  },
  {
    id: "003",
    title: "The NexusCanon",
    statement:
      "There is no log. There is no history table. There is only the Canon.",
    verdict: "SEPARATE RECORDS COLLAPSE INTO ONE SURFACE",
    detail:
      "Document, entity, event, and state transition are not treated as separate fragments. They are resolved into one truth surface.",
  },
  {
    id: "004",
    title: "The 7W1H Protocol",
    statement: "This is not metadata. This is forensic structure.",
    verdict: "REMOVE ONE DIMENSION, TRUTH COLLAPSES",
    detail:
      "Who. What. When. Where. Why. Which. Whose. How. The record is inseparable from all eight dimensions.",
  },
  {
    id: "007",
    title: "Forensic By Design",
    statement:
      "Audit is not a feature. Audit is the natural state of the system.",
    verdict: "PAST RECONSTRUCTABLE. PRESENT PROVABLE. FUTURE PREDICTABLE.",
    detail:
      "No spreadsheet archaeology. No narrative rescue. No external reconstruction layer. Truth remains operational under pressure.",
  },
] as const

const failureLogs = [
  {
    code: "FC-01",
    title: "UNATTRIBUTED NUMBER",
    body: "Value exists without causal origin. Reporting surface is contaminated.",
  },
  {
    code: "FC-02",
    title: "NARRATIVE RECONCILIATION",
    body: "Manual explanation required because system evidence is insufficient.",
  },
  {
    code: "FC-03",
    title: "ENTITY DRIFT",
    body: "Cross-border continuity broken by fragmented operational truth.",
  },
  {
    code: "FC-04",
    title: "AUDIT DEPENDENCY",
    body: "External tooling required to reconstruct what should already be provable.",
  },
] as const

const protocol = [
  "WHO EXECUTED",
  "WHAT CHANGED",
  "WHEN IT OCCURRED",
  "WHERE IT ORIGINATED",
  "WHY IT WAS JUSTIFIED",
  "WHICH PATH WAS TAKEN",
  "WHOSE CONTEXT IT BELONGS TO",
  "HOW THE TRANSITION HAPPENED",
] as const

const closingLines = [
  "AFENDA IS NOT SOFTWARE.",
  "IT IS AN ERP THAT DOES NOT APPROXIMATE.",
  "IT IS A MACHINE THAT BINDS TRUTH.",
  "IT IS A LEDGER THAT PRESERVES CAUSALITY.",
] as const

const slowEase: [number, number, number, number] = [0.16, 1, 0.3, 1]

const GrainOverlay = memo(function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[2] opacity-[0.045] mix-blend-difference"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  )
})

const ArchitecturalGrid = memo(function ArchitecturalGrid() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 opacity-20">
        <div className="mx-auto flex h-full max-w-[1800px] justify-between px-6 md:px-10 xl:px-14">
          <div className="h-full w-px bg-white/30" />
          <div className="hidden h-full w-px bg-white/18 md:block" />
          <div className="hidden h-full w-px bg-white/12 xl:block" />
          <div className="h-full w-px bg-white/30" />
          <div className="hidden h-full w-px bg-white/12 xl:block" />
          <div className="hidden h-full w-px bg-white/18 md:block" />
          <div className="h-full w-px bg-white/30" />
        </div>
      </div>

      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.08]">
        <div
          className="h-px w-full bg-white/40"
          style={{ marginTop: "16vh" }}
        />
        <div
          className="h-px w-full bg-white/20"
          style={{ marginTop: "26vh" }}
        />
        <div
          className="h-px w-full bg-white/20"
          style={{ marginTop: "24vh" }}
        />
        <div
          className="h-px w-full bg-white/20"
          style={{ marginTop: "18vh" }}
        />
      </div>
    </>
  )
})

function InvertedCursor() {
  const reduceMotion = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 240, damping: 30, mass: 0.9 })
  const sy = useSpring(y, { stiffness: 240, damping: 30, mass: 0.9 })

  useEffect(() => {
    if (reduceMotion) return
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX - 18)
      y.set(e.clientY - 18)
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [reduceMotion, x, y])

  if (reduceMotion) return null

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-[60] hidden h-9 w-9 rounded-full border border-white/30 bg-white mix-blend-difference md:block"
      style={{ x: sx, y: sy }}
    />
  )
}

function useDoctrineTicker() {
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduceMotion) return
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % doctrineCycle.length)
    }, 2400)
    return () => window.clearInterval(id)
  }, [reduceMotion])

  return doctrineCycle[index]
}

const TopRail = memo(function TopRail() {
  return (
    <div className="relative z-10 border-b border-white/12 px-6 py-5 md:px-10 xl:px-14">
      <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-6">
        <div className="font-mono text-[10px] tracking-[0.34em] text-white/72 uppercase">
          AFENDA
        </div>
        <div className="hidden font-mono text-[10px] tracking-[0.28em] text-white/34 uppercase md:block">
          THE.MACHINE / DOCTRINE.OF.ENTERPRISE.TRUTH
        </div>
      </div>
    </div>
  )
})

const Hero = memo(function Hero() {
  const activeDoctrine = useDoctrineTicker()
  const reduceMotion = useReducedMotion()

  return (
    <section className="relative px-6 pt-10 pb-20 md:px-10 md:pt-14 md:pb-28 xl:px-14">
      <div className="mx-auto max-w-[1800px]">
        <div className="grid gap-14 xl:grid-cols-[1.45fr_0.75fr] xl:gap-10">
          <div className="relative z-10">
            <div className="mb-10 border-b border-white/12 pb-6">
              <p className="font-mono text-[10px] tracking-[0.34em] text-white/46 uppercase">
                PRINCIPLE 001 — ASSUME NOTHING
              </p>
            </div>

            <div className="min-h-[19rem] md:min-h-[24rem] xl:min-h-[28rem]">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={activeDoctrine}
                  initial={
                    reduceMotion ? { opacity: 1 } : { opacity: 0, y: 28 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -18 }}
                  transition={{ duration: 1.15, ease: slowEase }}
                  className="text-[16vw] leading-[0.78] font-semibold tracking-[-0.1em] text-white uppercase md:text-[12vw] xl:text-[10.6rem]"
                >
                  {activeDoctrine.split(" ").map((word, i) => (
                    <span
                      key={`${activeDoctrine}-${i}`}
                      className={
                        i === activeDoctrine.split(" ").length - 1
                          ? "text-transparent"
                          : ""
                      }
                      style={
                        i === activeDoctrine.split(" ").length - 1
                          ? { WebkitTextStroke: "1px white" }
                          : undefined
                      }
                    >
                      {word}
                      {i < activeDoctrine.split(" ").length - 1 ? " " : ""}
                    </span>
                  ))}
                </motion.h1>
              </AnimatePresence>
            </div>

            <div className="mt-8 grid gap-8 border-t border-white/12 pt-8 md:grid-cols-[1.2fr_0.9fr] md:gap-12">
              <div>
                <p className="max-w-3xl text-base leading-8 text-white/70 md:text-lg">
                  AFENDA is not built to decorate execution. It is built to bind
                  execution to proof. In a world of approximated enterprise
                  systems, this machine refuses unproven reality.
                </p>
              </div>

              <div className="space-y-5">
                <p className="font-mono text-[11px] tracking-[0.28em] text-white/42 uppercase">
                  Every number must answer
                </p>
                <div className="space-y-2 text-sm tracking-[0.14em] text-white/74 uppercase md:text-[0.95rem]">
                  <div>Where it came from</div>
                  <div>Why it exists</div>
                  <div>What changed it</div>
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap gap-4">
              <a
                href="#principles"
                className="group relative inline-flex overflow-hidden rounded-full border border-white px-7 py-4 font-mono text-[11px] tracking-[0.24em] text-white uppercase transition-colors hover:text-black"
              >
                <span className="absolute inset-0 translate-y-full bg-white transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:translate-y-0" />
                <span className="relative z-10 inline-flex items-center gap-3">
                  Enter the Canon <ArrowUpRight className="h-4 w-4" />
                </span>
              </a>

              <Link
                to="/auth/register"
                className="inline-flex rounded-full border border-white/12 bg-white/[0.03] px-7 py-4 font-mono text-[11px] tracking-[0.24em] text-white/82 uppercase backdrop-blur transition hover:bg-white/[0.08]"
              >
                Start now
              </Link>
            </div>
          </div>

          <div className="relative z-10 xl:pl-6">
            <div className="rounded-[1.8rem] border border-white/12 bg-white/[0.02] p-6 backdrop-blur-sm md:p-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <p className="font-mono text-[10px] tracking-[0.28em] text-white/48 uppercase">
                  Doctrine of Enterprise Truth
                </p>
                <p className="font-mono text-[10px] tracking-[0.28em] text-white/28 uppercase">
                  LIVE SURFACE
                </p>
              </div>

              <div className="mt-6 space-y-5">
                {protocol.map((item, index) => (
                  <motion.div
                    key={item}
                    initial={
                      reduceMotion ? { opacity: 1 } : { opacity: 0, x: 18 }
                    }
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-12%" }}
                    transition={{
                      duration: 0.75,
                      delay: index * 0.05,
                      ease: slowEase,
                    }}
                    className="grid grid-cols-[48px_1fr] gap-4 border-b border-white/8 pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="font-mono text-[11px] tracking-[0.18em] text-white/34">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="text-sm tracking-[0.14em] text-white/76 uppercase">
                      {item}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})

const PrinciplesSection = memo(function PrinciplesSection() {
  const reduceMotion = useReducedMotion()
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <section
      id="principles"
      className="border-t border-white/12 px-6 py-20 md:px-10 md:py-28 xl:px-14"
    >
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-14 grid gap-6 md:grid-cols-[0.8fr_1.5fr]">
          <div>
            <p className="font-mono text-[10px] tracking-[0.34em] text-white/42 uppercase">
              // Principles
            </p>
          </div>
          <div>
            <h2 className="text-4xl leading-[0.92] font-semibold tracking-[-0.08em] uppercase md:text-6xl xl:text-[5.25rem]">
              The page does not explain truth. <br />
              <span
                className="text-transparent"
                style={{ WebkitTextStroke: "1px white" }}
              >
                It enforces it.
              </span>
            </h2>
          </div>
        </div>

        <div className="border-y border-white/12">
          {principles.map((item, index) => {
            const active = hoveredId === item.id
            return (
              <motion.div
                key={item.id}
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-8%" }}
                transition={{
                  duration: 0.9,
                  delay: index * 0.06,
                  ease: slowEase,
                }}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="group relative overflow-hidden border-b border-white/12 last:border-b-0"
              >
                <div className="grid gap-8 px-0 py-0 md:grid-cols-[0.22fr_1fr_0.55fr]">
                  <div className="border-b border-white/12 px-6 py-6 md:border-r md:border-b-0 md:px-8 md:py-10">
                    <div className="font-mono text-xs tracking-[0.28em] text-white/38">
                      {item.id}
                    </div>
                  </div>

                  <div className="px-6 py-8 md:px-8 md:py-10">
                    <h3 className="text-3xl leading-[0.95] font-medium tracking-[-0.07em] uppercase md:text-5xl xl:text-6xl">
                      {item.title}
                    </h3>
                    <p className="mt-5 max-w-3xl text-base leading-8 text-white/70 md:text-lg">
                      {item.statement}
                    </p>
                  </div>

                  <div className="border-t border-white/12 px-6 py-8 md:border-t-0 md:border-l md:px-8 md:py-10">
                    <p className="font-mono text-[11px] tracking-[0.22em] text-white/42 uppercase">
                      Verdict
                    </p>
                    <p className="mt-4 text-sm tracking-[0.14em] text-white/86 uppercase">
                      {item.verdict}
                    </p>
                    <p className="mt-5 text-sm leading-7 text-white/58">
                      {item.detail}
                    </p>
                  </div>
                </div>

                <motion.div
                  aria-hidden
                  animate={active ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.55, ease: slowEase }}
                  className="pointer-events-none absolute inset-0 hidden md:block"
                >
                  <div className="absolute inset-0 bg-white" />
                  <div className="relative z-10 grid h-full md:grid-cols-[0.22fr_1fr_0.55fr]">
                    <div className="border-r border-black/10 px-8 py-10">
                      <div className="font-mono text-xs tracking-[0.28em] text-black/34">
                        {item.id}
                      </div>
                    </div>

                    <div className="px-8 py-10">
                      <p className="font-mono text-[11px] tracking-[0.24em] text-black/32 uppercase">
                        Judgment
                      </p>
                      <h4 className="mt-4 text-4xl leading-[0.92] font-semibold tracking-[-0.08em] text-black uppercase xl:text-6xl">
                        {item.verdict}
                      </h4>
                    </div>

                    <div className="border-l border-black/10 px-8 py-10">
                      <p className="font-mono text-[11px] tracking-[0.22em] text-black/34 uppercase">
                        Consequence
                      </p>
                      <p className="mt-4 text-sm leading-7 text-black/68">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
})

const FailureConditions = memo(function FailureConditions() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="border-t border-white/12 px-6 py-20 md:px-10 md:py-28 xl:px-14">
      <div className="mx-auto max-w-[1800px]">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.5fr]">
          <div>
            <p className="font-mono text-[10px] tracking-[0.34em] text-white/42 uppercase">
              // Failure conditions
            </p>
          </div>

          <div>
            <h2 className="text-4xl leading-[0.92] font-semibold tracking-[-0.08em] uppercase md:text-6xl xl:text-[5rem]">
              Global operations fail <br />
              when truth becomes narrative.
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/66 md:text-lg">
              Multi-entity complexity is not the problem. Broken causality is
              the problem. Broken attribution is the problem. Broken proof is
              the problem.
            </p>

            <div className="mt-12 border-y border-white/12">
              {failureLogs.map((item, index) => (
                <motion.div
                  key={item.code}
                  initial={
                    reduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }
                  }
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.07,
                    ease: slowEase,
                  }}
                  className="grid gap-4 border-b border-white/12 px-0 py-6 last:border-b-0 md:grid-cols-[120px_1fr_1.2fr]"
                >
                  <div className="font-mono text-[11px] tracking-[0.22em] text-white/34 uppercase">
                    {item.code}
                  </div>
                  <div className="text-lg font-medium tracking-[0.08em] text-white/92 uppercase">
                    {item.title}
                  </div>
                  <div className="text-sm leading-7 text-white/58">
                    {item.body}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})

const CanonStatement = memo(function CanonStatement() {
  const stackedText = useMemo(
    () => [
      "ASSUME NOTHING",
      "ASSUME NOTHING",
      "ASSUME NOTHING",
      "ASSUME NOTHING",
    ],
    []
  )

  return (
    <section className="relative overflow-hidden border-t border-b border-white/12 px-6 py-20 md:px-10 md:py-28 xl:px-14">
      <div className="mx-auto max-w-[1800px]">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.4fr]">
          <div>
            <p className="font-mono text-[10px] tracking-[0.34em] text-white/42 uppercase">
              // Canon statement
            </p>
          </div>

          <div className="space-y-2">
            {stackedText.map((line, index) => (
              <motion.div
                key={`${line}-${index}`}
                animate={{ opacity: [0.82, 1, 0.86] }}
                transition={{
                  duration: 6 + index,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-[12vw] leading-[0.82] font-semibold tracking-[-0.1em] text-white uppercase md:text-[8vw] xl:text-[6.5rem]"
                style={{ marginLeft: `${index * 1.75}vw` }}
              >
                {line}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
})

const Closing = memo(function Closing() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="final" className="px-6 py-20 md:px-10 md:py-28 xl:px-14">
      <div className="mx-auto max-w-[1800px]">
        <div className="rounded-[2rem] border border-white/12 bg-white/[0.025] p-7 backdrop-blur-sm md:p-10 xl:p-14">
          <div className="grid gap-12 xl:grid-cols-[1.2fr_0.75fr] xl:gap-16">
            <div>
              <p className="font-mono text-[10px] tracking-[0.34em] text-white/42 uppercase">
                // Final statement
              </p>

              <h2 className="mt-6 text-4xl leading-[0.92] font-semibold tracking-[-0.08em] uppercase md:text-6xl xl:text-[5.5rem]">
                This system <br />
                does not forget.
              </h2>

              <div className="mt-8 max-w-4xl space-y-4">
                {closingLines.map((line, index) => (
                  <motion.p
                    key={line}
                    initial={
                      reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }
                    }
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.06,
                      ease: slowEase,
                    }}
                    className="text-base tracking-[0.12em] text-white/80 uppercase md:text-lg"
                  >
                    {line}
                  </motion.p>
                ))}
              </div>

              <div className="mt-12 border-l border-white/20 pl-5 md:pl-7">
                <p className="text-2xl leading-[1.05] font-medium tracking-[-0.05em] text-white uppercase md:text-4xl xl:text-5xl">
                  You are free to execute.
                  <br />
                  <span
                    className="text-transparent"
                    style={{ WebkitTextStroke: "1px white" }}
                  >
                    But every execution becomes truth.
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-10 border-t border-white/12 pt-8 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-12">
              <div>
                <p className="font-mono text-[10px] tracking-[0.34em] text-white/38 uppercase">
                  Operational outcome
                </p>
                <div className="mt-5 space-y-3 text-sm tracking-[0.16em] text-white/82 uppercase">
                  <div>Past is reconstructable</div>
                  <div>Present is provable</div>
                  <div>Future is predictable</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/auth/register"
                  className="inline-flex items-center rounded-full bg-white px-7 py-4 font-mono text-[11px] tracking-[0.24em] text-black uppercase transition hover:scale-[1.02]"
                >
                  Start now
                </Link>

                <Link
                  to="/auth/login"
                  className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.03] px-7 py-4 font-mono text-[11px] tracking-[0.24em] text-white/82 uppercase transition hover:bg-white/[0.08]"
                >
                  Sign in
                </Link>

                <a
                  href="#principles"
                  className="inline-flex items-center rounded-full border border-white/12 px-7 py-4 font-mono text-[11px] tracking-[0.24em] text-white/58 uppercase transition hover:text-white/82"
                >
                  Back to Canon
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})

export default function AfendaBeastmodeFinal() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black font-sans text-white selection:bg-white selection:text-black">
      <ArchitecturalGrid />
      <GrainOverlay />
      <InvertedCursor />

      <div className="relative z-10">
        <TopRail />
        <main>
          <Hero />
          <PrinciplesSection />
          <FailureConditions />
          <CanonStatement />
          <Closing />
        </main>
      </div>
    </div>
  )
}
