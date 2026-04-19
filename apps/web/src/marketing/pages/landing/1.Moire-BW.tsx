import { useMemo, useRef } from "react"
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion"
import { ArrowRight } from "lucide-react"

/**
 * AFENDA // BEASTMODE REFINED
 * Black and white as tension, structure, silence, and force.
 * This version removes visual noise and replaces it with architectural control.
 * No playful gimmicks. No decorative chaos. No motion for motion's sake.
 * The experience is editorial, monumental, and intentionally restrained.
 */

export default function App() {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ["start start", "end end"],
  })

  return (
    <div
      ref={rootRef}
      className="bg-white text-black selection:bg-black selection:text-white"
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
    >
      <ArchitecturalGrid />
      <main className="relative z-10">
        <HeroMonolith
          progress={scrollYProgress}
          reduceMotion={!!reduceMotion}
        />
        <DoctrineBand />
        <ChamberArchitecture reduceMotion={!!reduceMotion} />
        <EditorialInterruption
          progress={scrollYProgress}
          reduceMotion={!!reduceMotion}
        />
        <ContrastField reduceMotion={!!reduceMotion} />
        <TerminalCall reduceMotion={!!reduceMotion} />
      </main>
    </div>
  )
}

function ArchitecturalGrid() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.08]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, black 1px, transparent 1px),
            linear-gradient(to bottom, black 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,1) 18%, rgba(0,0,0,1) 82%, rgba(0,0,0,0.2))",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,1) 18%, rgba(0,0,0,1) 82%, rgba(0,0,0,0.2))",
        }}
      />
      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-black/50" />
      <div className="absolute inset-x-0 top-[14vh] h-px bg-black/40" />
      <div className="absolute inset-x-0 bottom-[14vh] h-px bg-black/40" />
    </div>
  )
}

function HeroMonolith({
  progress,
  reduceMotion,
}: {
  progress: MotionValue<number>
  reduceMotion: boolean
}) {
  const y = useTransform(progress, [0, 0.18], [0, reduceMotion ? 0 : 120])
  const scale = useTransform(progress, [0, 0.18], [1, reduceMotion ? 1 : 0.92])
  const opacity = useTransform(progress, [0, 0.2], [1, 0.3])
  const panelY = useTransform(progress, [0, 0.15], [0, reduceMotion ? 0 : -50])

  return (
    <section className="relative min-h-screen overflow-hidden border-b border-black/10">
      <div className="mx-auto grid min-h-screen max-w-[1800px] grid-cols-1 px-6 md:px-10 xl:grid-cols-[1.2fr_0.8fr] xl:px-16">
        <motion.div
          className="relative flex min-h-[68vh] flex-col justify-between py-10 md:py-12 xl:min-h-screen xl:py-16"
          style={{ y, scale, opacity }}
        >
          <div className="flex items-center justify-between text-[10px] tracking-[0.42em] text-black/45 uppercase md:text-xs">
            <span>AFENDA</span>
            <span>Black / White / Truth</span>
          </div>

          <div className="relative py-12 md:py-16 xl:py-0">
            <div className="mb-5 max-w-[14rem] border-t border-black/25 pt-4 text-[10px] tracking-[0.38em] text-black/45 uppercase md:max-w-xs md:text-xs">
              State of the art enterprise art architecture
            </div>

            <div className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute top-[-0.12em] -left-[0.04em] text-[20vw] leading-none font-black tracking-[-0.09em] text-black/[0.03] xl:text-[17rem]"
              >
                A
              </div>

              <h1 className="max-w-5xl text-[clamp(4.3rem,12vw,13rem)] leading-[0.84] font-black tracking-[-0.08em] uppercase">
                Black
                <br />
                White
                <br />
                Truth
              </h1>
            </div>

            <div className="mt-8 grid max-w-4xl grid-cols-1 gap-8 border-t border-black/15 pt-8 md:grid-cols-[1.1fr_0.9fr] md:gap-12 md:pt-10">
              <p className="max-w-xl text-base leading-8 text-black/72 md:text-lg">
                Not decoration. Not style theatre. A composed system of
                contrast, weight, silence, alignment, and evidence. Black and
                white pushed to a monumental architectural language.
              </p>
              <div className="space-y-3 text-[11px] tracking-[0.35em] text-black/42 uppercase md:text-xs">
                <div className="flex items-center justify-between border-b border-black/10 pb-3">
                  <span>Mode</span>
                  <span>Beastmode</span>
                </div>
                <div className="flex items-center justify-between border-b border-black/10 pb-3">
                  <span>Surface</span>
                  <span>Editorial Monument</span>
                </div>
                <div className="flex items-center justify-between border-b border-black/10 pb-3">
                  <span>Principle</span>
                  <span>Assume Nothing</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-black/15 pt-5 text-[10px] tracking-[0.42em] text-black/45 uppercase md:text-xs">
            <span>Scroll for structure</span>
            <span>Beyond borders</span>
          </div>
        </motion.div>

        <motion.div
          className="relative hidden min-h-screen border-l border-black/12 xl:block"
          style={{ y: panelY }}
        >
          <div className="absolute inset-0 grid grid-rows-[1fr_auto_auto] p-10">
            <div className="relative overflow-hidden border border-black/12 bg-black text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_30%)]" />
              <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
              <div className="absolute inset-y-0 left-0 w-px bg-white/20" />
              <div className="absolute right-6 bottom-6 text-[15rem] leading-none font-black tracking-[-0.08em] text-white/[0.05]">
                01
              </div>
              <div className="relative flex h-full flex-col justify-between p-8">
                <div className="text-[10px] tracking-[0.38em] text-white/45 uppercase">
                  System statement
                </div>
                <div>
                  <div className="max-w-sm text-5xl leading-[0.9] font-black tracking-[-0.06em] uppercase">
                    Form as
                    <br />
                    proof
                  </div>
                  <p className="mt-6 max-w-md text-base leading-7 text-white/68">
                    Every line earns its place. Every contrast has a job. Every
                    mass establishes authority.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 border-x border-b border-black/12">
              {[
                ["Zero", "Assumptions"],
                ["One", "Machine"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="border-r border-black/12 p-6 last:border-r-0"
                >
                  <div className="text-4xl font-black tracking-[-0.06em]">
                    {value}
                  </div>
                  <div className="mt-2 text-[10px] tracking-[0.34em] text-black/45 uppercase">
                    {label}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-x border-b border-black/12 px-6 py-5 text-[10px] tracking-[0.34em] text-black/42 uppercase">
              The machine does not decorate truth. It renders it legible.
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function DoctrineBand() {
  const items = useMemo(
    () => [
      "Assume Nothing",
      "Single Source",
      "Evidence First",
      "Continuity Over Drift",
      "Structure Before Ornament",
    ],
    []
  )

  return (
    <section className="relative border-t border-b border-black bg-black py-5 text-white md:py-6">
      <div className="overflow-hidden whitespace-nowrap">
        <div className="animate-[doctrine-marquee_24s_linear_infinite] text-[11px] tracking-[0.46em] uppercase md:text-xs">
          {Array.from({ length: 2 }).map((_, idx) => (
            <span key={idx}>
              {items.map((item) => (
                <span
                  key={`${idx}-${item}`}
                  className="mr-10 inline-flex items-center gap-10"
                >
                  <span>{item}</span>
                  <span className="inline-block h-px w-10 bg-white/35" />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes doctrine-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}

function ChamberArchitecture({ reduceMotion }: { reduceMotion: boolean }) {
  const chambers = [
    {
      index: "01",
      name: "Transaction",
      body: "Reality over system artefact. Precision anchored to the event itself.",
      invert: false,
    },
    {
      index: "02",
      name: "Reporting",
      body: "Evidence over narrative. Every number prepared to survive scrutiny.",
      invert: true,
    },
    {
      index: "03",
      name: "Enterprise",
      body: "Continuity over drift. One machine across entities, periods, and pressure.",
      invert: false,
    },
  ]

  return (
    <section className="relative border-b border-black/10 bg-white">
      {chambers.map((chamber, idx) => (
        <motion.article
          key={chamber.index}
          initial={reduceMotion ? false : { opacity: 0, y: 36 }}
          whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.85,
            ease: [0.22, 1, 0.36, 1],
            delay: idx * 0.06,
          }}
          className={
            chamber.invert ? "bg-black text-white" : "bg-white text-black"
          }
        >
          <div className="mx-auto grid max-w-[1800px] grid-cols-1 border-x border-black/10 md:grid-cols-[220px_1fr_320px]">
            <div className="border-b border-black/10 px-6 py-8 md:border-r md:border-b-0 md:px-8 md:py-12">
              <div
                className={chamber.invert ? "text-white/38" : "text-black/35"}
              >
                <div className="text-[11px] tracking-[0.38em] uppercase">
                  Chamber
                </div>
                <div className="mt-2 text-6xl leading-none font-black tracking-[-0.08em]">
                  {chamber.index}
                </div>
              </div>
            </div>

            <div className="px-6 py-10 md:px-10 md:py-14 xl:px-14 xl:py-16">
              <div
                className={chamber.invert ? "text-white/40" : "text-black/35"}
              >
                <div className="mb-4 text-[11px] tracking-[0.4em] uppercase">
                  Architectural truth layer
                </div>
              </div>
              <h2 className="max-w-4xl text-[clamp(2.8rem,7vw,8rem)] leading-[0.88] font-black tracking-[-0.08em] uppercase">
                {chamber.name}
              </h2>
              <p
                className={
                  chamber.invert
                    ? "mt-6 max-w-2xl text-lg leading-8 text-white/72"
                    : "mt-6 max-w-2xl text-lg leading-8 text-black/68"
                }
              >
                {chamber.body}
              </p>
            </div>

            <div className="border-t border-black/10 px-6 py-8 md:border-t-0 md:border-l md:px-8 md:py-12">
              <div className="space-y-4">
                {["Mass", "Rhythm", "Evidence"].map((tag) => (
                  <div
                    key={tag}
                    className={
                      chamber.invert
                        ? "border-b border-white/12 pb-4 text-[11px] tracking-[0.35em] text-white/45 uppercase"
                        : "border-b border-black/10 pb-4 text-[11px] tracking-[0.35em] text-black/42 uppercase"
                    }
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.article>
      ))}
    </section>
  )
}

function EditorialInterruption({
  progress,
  reduceMotion,
}: {
  progress: MotionValue<number>
  reduceMotion: boolean
}) {
  const scale = useTransform(
    progress,
    [0.32, 0.52],
    [1, reduceMotion ? 1 : 1.08]
  )
  const x = useTransform(progress, [0.32, 0.52], [0, reduceMotion ? 0 : -80])

  return (
    <section className="relative overflow-hidden border-b border-black bg-black text-white">
      <div className="mx-auto grid max-w-[1800px] grid-cols-1 border-x border-white/10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="border-b border-white/10 px-6 py-12 md:px-10 md:py-16 lg:border-r lg:border-b-0 xl:px-16 xl:py-20">
          <div className="mb-6 text-[11px] tracking-[0.42em] text-white/40 uppercase">
            Interruption / declaration
          </div>
          <motion.div style={{ scale, x }}>
            <div className="text-[clamp(4rem,11vw,11rem)] leading-[0.84] font-black tracking-[-0.1em] uppercase">
              Break
              <br />
              the
              <br />
              frame
            </div>
          </motion.div>
        </div>
        <div className="flex items-end px-6 py-12 md:px-10 md:py-16 xl:px-16 xl:py-20">
          <div className="max-w-xl">
            <p className="text-xl leading-9 text-white/72 md:text-2xl">
              Black and white should not feel retro, sterile, or empty. It
              should feel sovereign. A system of pressure, release, compression,
              and exact visual judgment.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function ContrastField({ reduceMotion }: { reduceMotion: boolean }) {
  const panels = [
    {
      title: "Silence",
      copy: "Large white fields are not empty. They create authority and listening space.",
      dark: false,
    },
    {
      title: "Impact",
      copy: "Large black masses should feel like structural decisions, not decorative blocks.",
      dark: true,
    },
    {
      title: "Order",
      copy: "A visible grid creates the feeling of engineered confidence beneath expression.",
      dark: false,
    },
    {
      title: "Control",
      copy: "Motion remains slow, weighted, and directional so the page never loses its dignity.",
      dark: true,
    },
  ]

  return (
    <section className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {panels.map((panel, idx) => (
          <motion.div
            key={panel.title}
            initial={reduceMotion ? false : { opacity: 0, y: 30 }}
            whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{
              duration: 0.8,
              delay: idx * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={
              panel.dark ? "bg-black text-white" : "bg-white text-black"
            }
          >
            <div className="relative aspect-[1/1] overflow-hidden border border-black/10 p-8 md:p-10 xl:p-14">
              <div
                className={
                  panel.dark
                    ? "absolute top-3 right-5 text-[28vw] leading-none font-black tracking-[-0.1em] text-white/[0.04]"
                    : "absolute top-3 right-5 text-[28vw] leading-none font-black tracking-[-0.1em] text-black/[0.04]"
                }
              >
                0{idx + 1}
              </div>
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div
                  className={
                    panel.dark
                      ? "text-[11px] tracking-[0.38em] text-white/42 uppercase"
                      : "text-[11px] tracking-[0.38em] text-black/38 uppercase"
                  }
                >
                  Contrast principle
                </div>
                <div>
                  <h3 className="text-5xl font-black tracking-[-0.07em] uppercase md:text-6xl">
                    {panel.title}
                  </h3>
                  <p
                    className={
                      panel.dark
                        ? "mt-5 max-w-md text-lg leading-8 text-white/72"
                        : "mt-5 max-w-md text-lg leading-8 text-black/68"
                    }
                  >
                    {panel.copy}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function TerminalCall({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <section className="relative min-h-[88vh] overflow-hidden border-t border-black bg-white text-black">
      <div className="mx-auto flex min-h-[88vh] max-w-[1800px] flex-col justify-between border-x border-black/10 px-6 py-10 md:px-10 md:py-12 xl:px-16 xl:py-16">
        <div className="flex items-center justify-between text-[10px] tracking-[0.42em] text-black/42 uppercase md:text-xs">
          <span>Final protocol</span>
          <span>Architecture, not decoration</span>
        </div>

        <div className="py-12 md:py-16">
          <div className="max-w-6xl text-[clamp(4rem,13vw,14rem)] leading-[0.82] font-black tracking-[-0.1em] uppercase">
            Enter
            <br />
            the machine
          </div>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-black/66 md:text-xl">
            A black and white system sharpened into monument, contrast, and
            truth. Controlled enough for enterprise. Bold enough to be
            remembered.
          </p>
        </div>

        <motion.button
          type="button"
          whileHover={reduceMotion ? {} : { y: -3 }}
          whileTap={reduceMotion ? {} : { scale: 0.995 }}
          className="group inline-flex w-fit items-center gap-4 border-2 border-black px-8 py-5 text-sm tracking-[0.34em] uppercase transition-colors hover:bg-black hover:text-white md:px-10"
        >
          <span>Initialize AFENDA</span>
          <ArrowRight className="h-5 w-5" strokeWidth={2} />
        </motion.button>
      </div>
    </section>
  )
}
