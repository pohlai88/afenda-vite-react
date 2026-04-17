import { memo, useEffect } from "react"
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowUpRight, Globe2, ShieldCheck } from "lucide-react"

/**
 * AFENDA // POLARIS MONOLITH
 *
 * Concept:
 * - Monolith owns the shell
 * - Singularity owns the event
 * - Tribunal rows own the doctrine
 *
 * Notes:
 * - Self-contained React surface
 * - Tailwind utility styling
 * - Framer Motion for accents and in-view rows (no singularity scroll runway)
 */

const chambers = [
  {
    id: "01",
    title: "Transaction Truth",
    detail: "Resolves to business reality, not a system code.",
    body: "Every posting, match, transfer, and correction must resolve to what actually happened in the business.",
  },
  {
    id: "02",
    title: "Reporting Truth",
    detail: "Defensible evidence under extreme pressure.",
    body: "Periods, reconciliations, disclosures, and IFRS-facing outputs must stand on governed evidence.",
  },
  {
    id: "03",
    title: "Enterprise Truth",
    detail: "Borderless continuity across all entities.",
    body: "Across jurisdictions, currencies, structures, and growth, the enterprise still needs one defensible truth surface.",
  },
] as const

const oath = "BEYOND BORDERS • ASSUME NOTHING • GOVERNED TRUTH • "

const borderlessPoints = [
  "Multi-entity without narrative drift",
  "Cross-border without losing local accountability",
  "Audit evidence without spreadsheet archaeology",
  "Reporting truth under operational pressure",
] as const

const GrainOverlay = memo(function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 opacity-[0.04] mix-blend-difference"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
      }}
    />
  )
})

const ArchitecturalLines = memo(function ArchitecturalLines() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 flex justify-between px-6 opacity-20 md:px-12">
      <div className="h-full w-px bg-white/30" />
      <div className="hidden h-full w-px bg-white/30 md:block" />
      <div className="h-full w-px bg-white/30" />
      <div className="hidden h-full w-px bg-white/30 md:block" />
      <div className="h-full w-px bg-white/30" />
    </div>
  )
})

/** Cursor follows pointer via MotionValues — avoids React re-rendering on every mousemove. */
function InvertedCursor() {
  const reduceMotion = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 500, damping: 28, mass: 0.5 })
  const springY = useSpring(y, { stiffness: 500, damping: 28, mass: 0.5 })

  useEffect(() => {
    if (reduceMotion) return
    const handler = (event: MouseEvent) => {
      x.set(event.clientX - 16)
      y.set(event.clientY - 16)
    }
    window.addEventListener("mousemove", handler)
    return () => window.removeEventListener("mousemove", handler)
  }, [reduceMotion, x, y])

  if (reduceMotion) return null

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-8 w-8 rounded-full bg-white mix-blend-difference md:block"
      style={{ x: springX, y: springY }}
    />
  )
}

const MonolithHero = memo(function MonolithHero() {
  return (
    <section className="relative flex min-h-[86vh] flex-col justify-end px-6 pb-20 pt-12 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        <div className="mb-10 flex items-center justify-between border-b border-white/15 pb-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/70">AFENDA</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/50">POLARIS.MONOLITH</span>
        </div>

        <h1 className="cursor-default text-[13vw] font-bold uppercase leading-[0.8] tracking-[-0.08em] md:text-[11vw]">
          Assume <br />
          <span className="text-transparent" style={{ WebkitTextStroke: "1px white" }}>
            Nothing.
          </span>
        </h1>

        <div className="mt-16 flex flex-col gap-10 border-t border-white/20 pt-8 md:flex-row md:items-end md:justify-between">
          <p className="max-w-xl text-lg font-light leading-relaxed text-white/70 md:text-xl">
            The business moves. The truth does not drift. A single, borderless engine for enterprises that cannot afford to guess.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="#verdict"
              className="group relative overflow-hidden rounded-full border border-white px-8 py-4 font-mono text-xs uppercase tracking-[0.2em] transition-colors hover:text-black"
            >
              <div className="absolute inset-0 z-0 h-full w-full origin-bottom translate-y-full bg-white transition-transform duration-500 ease-[0.16,1,0.3,1] group-hover:translate-y-0" />
              <span className="relative z-10 flex items-center gap-3">
                Enter the Truth Model <ArrowUpRight className="h-4 w-4" />
              </span>
            </a>

            <a
              href="#verdict"
              className="rounded-full border border-white/15 bg-white/[0.03] px-8 py-4 font-mono text-xs uppercase tracking-[0.2em] text-white/78 backdrop-blur transition hover:bg-white/[0.08]"
            >
              Open Polaris Surface
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  )
})

const TribunalRows = memo(function TribunalRows() {
  return (
    <section id="verdict" className="border-t border-white/20 px-6 py-32 md:px-12">
      <div className="grid gap-12 md:grid-cols-[1fr_2.5fr]">
        <div>
          <p className="sticky top-12 font-mono text-xs uppercase tracking-[0.3em] text-white/50 mix-blend-difference">
            // Verdict
          </p>
        </div>

        <div className="divide-y divide-white/20 border-y border-white/20">
          {chambers.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="group -mx-6 flex cursor-pointer flex-col justify-between px-6 py-12 transition-colors duration-500 hover:bg-white hover:text-black md:flex-row md:items-center"
            >
              <div className="mb-5 flex items-baseline gap-8 md:mb-0">
                <span className="font-mono text-sm opacity-50 group-hover:opacity-100">{item.id}</span>
                <div>
                  <h2 className="text-4xl font-medium uppercase tracking-[-0.06em] md:text-6xl">
                    {item.title}
                  </h2>
                  <p className="mt-4 max-w-xl text-base leading-8 text-white/55 group-hover:text-black/70 md:hidden">
                    {item.body}
                  </p>
                </div>
              </div>

              <div className="hidden max-w-[260px] text-right md:block">
                <p className="font-mono text-xs uppercase tracking-widest opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  {item.detail}
                </p>
                <p className="mt-4 text-sm leading-7 text-black/70 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  {item.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
})

const BorderlessPressure = memo(function BorderlessPressure() {
  return (
    <section className="border-t border-white/20 px-6 py-24 md:px-12 md:py-32">
      <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-start">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/45">// Beyond Borders</p>
          <h2 className="mt-6 max-w-3xl text-4xl font-medium uppercase leading-[0.95] tracking-[-0.06em] md:text-6xl">
            Global operations. <br /> Single perspective.
          </h2>
          <p className="mt-6 max-w-2xl text-lg font-light leading-8 text-white/62">
            Borders, currencies, entities, and reporting pressures move. The governing truth of the business must remain attributable, defensible, and intact.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70 backdrop-blur">
              <Globe2 className="h-4 w-4 text-blue-300" /> Borderless continuity
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70 backdrop-blur">
              <ShieldCheck className="h-4 w-4 text-blue-300" /> Audit resilience
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {borderlessPoints.map((point, index) => (
            <div
              key={point}
              className="grid grid-cols-[52px_1fr] gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur"
            >
              <div className="font-mono text-sm tracking-[0.2em] text-blue-300">{String(index + 1).padStart(2, "0")}</div>
              <p className="leading-8 text-white/62">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

const OathMarquee = memo(function OathMarquee() {
  const reduceMotion = useReducedMotion()
  return (
    <section className="overflow-hidden border-t border-white/20 bg-white py-20 text-black">
      <motion.div
        className="flex whitespace-nowrap"
        animate={
          reduceMotion ? { x: 0 } : { x: ["0%", "-50%"] }
        }
        transition={
          reduceMotion
            ? { duration: 0 }
            : { ease: "linear", duration: 22, repeat: Infinity }
        }
      >
        {Array.from({ length: 2 }, (_, index) => (
          <h2 key={index} className="pr-16 text-[10vw] font-bold uppercase tracking-[-0.08em]">
            {oath}
          </h2>
        ))}
      </motion.div>
    </section>
  )
})

const FinalCommit = memo(function FinalCommit() {
  return (
    <section id="final" className="border-t border-white/20 px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/[0.035] p-8 text-center backdrop-blur md:p-12">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/45">// Final Commit</p>
        <h2 className="mt-6 text-4xl font-medium uppercase leading-[0.95] tracking-[-0.06em] md:text-7xl">
          Working the impossible <br /> into possible.
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-lg font-light leading-8 text-white/60">
          Built for enterprises that cannot guess, cannot drift, and cannot lose the business truth when scale, borders, and pressure collide.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/auth/register"
            className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-bold tracking-[0.2em] text-black transition hover:scale-[1.03]"
          >
            START NOW
          </Link>
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.04] px-8 py-4 text-sm tracking-[0.18em] text-white/76 backdrop-blur transition hover:bg-white/[0.08]"
          >
            SIGN IN
          </Link>
          <a
            href="#verdict"
            className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-transparent px-8 py-4 text-sm tracking-[0.18em] text-white/55 transition hover:text-white/80"
          >
            BACK TO VERDICT
          </a>
        </div>
      </div>
    </section>
  )
})

export default function AfendaPolarisMonolith() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black font-sans text-white selection:bg-white selection:text-black">
      <GrainOverlay />
      <InvertedCursor />
      <ArchitecturalLines />

      <main className="relative z-10">
        <MonolithHero />
        <TribunalRows />
        <BorderlessPressure />
        <OathMarquee />
        <FinalCommit />
      </main>
    </div>
  )
}
