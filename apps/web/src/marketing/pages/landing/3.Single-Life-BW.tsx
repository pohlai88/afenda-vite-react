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
 * AFENDA // BLACK & WHITE MARKETING PAGE
 * Single-file, low-maintenance, high-impact landing page.
 * No registry, no kernel, no over-architecture.
 * Just brutal composition, controlled motion, and clear art direction.
 */

const TYPE_SCALE = {
  hero: "clamp(4.3rem, 12vw, 13rem)",
  chamber: "clamp(2.8rem, 7vw, 8rem)",
  statement: "clamp(4rem, 11vw, 11rem)",
  terminal: "clamp(4rem, 13vw, 14rem)",
} as const

const SURFACE = {
  light: {
    base: "bg-white text-black",
    border: "border-black/10",
    subtext: "text-black/42",
    body: "text-black/68",
    ghost: "text-black/[0.04]",
  },
  dark: {
    base: "bg-black text-white",
    border: "border-white/10",
    subtext: "text-white/42",
    body: "text-white/72",
    ghost: "text-white/[0.04]",
  },
} as const

const MOTION = {
  duration: 0.8,
  ease: [0.22, 1, 0.36, 1] as const,
  maxY: 40,
  hoverLift: -3,
  scaleRange: [1, 1.08] as const,
} as const

type SurfaceMode = keyof typeof SURFACE

const DOCTRINE = [
  {
    id: "001",
    title: "ASSUME NOTHING",
    statement:
      "Nothing is trusted. Nothing is implied. Every number must prove its origin.",
  },
  {
    id: "002",
    title: "EXECUTION IS FREE",
    statement:
      "Standard systems restrict execution because they cannot prove truth. AFENDA lets you act, and binds every action to evidence.",
  },
  {
    id: "003",
    title: "THE NEXUSCANON",
    statement:
      "There is no separate log, history, and narrative. Documents, entities, events, and transitions are bound into one machine.",
  },
  {
    id: "004",
    title: "7W1H PROTOCOL",
    statement:
      "Who, What, When, Where, Why, Which, Whose, How. Remove one, and truth collapses into explanation.",
  },
  {
    id: "005",
    title: "CAUSALITY",
    statement:
      "AFENDA does not stop at what the number is. It shows how the number became inevitable.",
  },
  {
    id: "006",
    title: "NO DRIFT",
    statement:
      "There is one machine, one ledger, one truth surface. Drift is not reconciled after the fact. It is prevented.",
  },
  {
    id: "007",
    title: "FORENSIC BY DESIGN",
    statement:
      "Audit is not a feature bolted on later. It is the natural state of the system.",
  },
] as const

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
        <DoctrineFlow reduceMotion={!!reduceMotion} />
        <TerminalCall reduceMotion={!!reduceMotion} />
      </main>
    </div>
  )
}

function palette(mode: SurfaceMode) {
  return SURFACE[mode]
}

function SectionFrame({
  id,
  surface,
  className = "",
  children,
}: {
  id: string
  surface: SurfaceMode
  className?: string
  children: React.ReactNode
}) {
  const p = palette(surface)
  return (
    <section id={id} className={`relative ${p.base} ${className}`}>
      {children}
    </section>
  )
}

function SectionEyebrow({
  surface,
  className = "",
  children,
}: {
  surface: SurfaceMode
  className?: string
  children: React.ReactNode
}) {
  const p = palette(surface)
  return (
    <div
      className={`text-[11px] tracking-[0.4em] uppercase ${p.subtext} ${className}`}
    >
      {children}
    </div>
  )
}

function MonolithStatement({
  text,
  scale,
  className = "",
}: {
  text: string
  scale: keyof typeof TYPE_SCALE
  className?: string
}) {
  const lines = text.split("\n")

  return (
    <div
      className={`leading-[0.84] font-black tracking-[-0.1em] uppercase ${className}`}
      style={{ fontSize: TYPE_SCALE[scale] }}
    >
      {lines.map((line, index) => (
        <span key={`${line}-${index}`}>
          {line}
          {index < lines.length - 1 ? <br /> : null}
        </span>
      ))}
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
  const p = palette("light")
  const y = useTransform(progress, [0, 0.18], [0, reduceMotion ? 0 : 120])
  const scale = useTransform(progress, [0, 0.18], [1, reduceMotion ? 1 : 0.92])
  const opacity = useTransform(progress, [0, 0.2], [1, 0.3])
  const panelY = useTransform(progress, [0, 0.15], [0, reduceMotion ? 0 : -50])

  return (
    <SectionFrame
      id="hero"
      surface="light"
      className={`min-h-screen overflow-hidden border-b ${p.border}`}
    >
      <div className="mx-auto grid min-h-screen max-w-[1800px] grid-cols-1 px-6 md:px-10 xl:grid-cols-[1.2fr_0.8fr] xl:px-16">
        <motion.div
          className="relative flex min-h-[68vh] flex-col justify-between py-10 md:py-12 xl:min-h-screen xl:py-16"
          style={{ y, scale, opacity }}
        >
          <div
            className={`flex items-center justify-between text-[10px] tracking-[0.42em] uppercase ${p.subtext} md:text-xs`}
          >
            <span>AFENDA</span>
            <span>ERP / Truth / Forensic</span>
          </div>

          <div className="relative py-12 md:py-16 xl:py-0">
            <div
              className={`mb-5 max-w-[14rem] border-t ${p.border} pt-4 text-[10px] tracking-[0.38em] uppercase ${p.subtext} md:max-w-xs md:text-xs`}
            >
              AFENDA / The Machine / Enterprise Truth Infrastructure
            </div>

            <div className="relative">
              <div
                aria-hidden
                className={`pointer-events-none absolute top-[-0.12em] -left-[0.04em] text-[20vw] leading-none font-black tracking-[-0.09em] ${p.ghost} xl:text-[17rem]`}
              >
                A
              </div>

              <MonolithStatement
                text={`Black\nWhite\nTruth`}
                scale="hero"
                className="max-w-5xl"
              />
            </div>

            <div
              className={`mt-8 grid max-w-4xl grid-cols-1 gap-8 border-t ${p.border} pt-8 md:grid-cols-[1.1fr_0.9fr] md:gap-12 md:pt-10`}
            >
              <p
                className={`max-w-xl text-base leading-8 ${p.body} md:text-lg`}
              >
                AFENDA is not another ERP interface. It is the machine that
                binds transaction truth, reporting truth, and enterprise truth
                into one governed forensic surface. Every line, state, and
                transition is designed to be legible under pressure.
              </p>
              <div
                className={`space-y-3 text-[11px] tracking-[0.35em] uppercase ${p.subtext} md:text-xs`}
              >
                <div
                  className={`flex items-center justify-between border-b ${p.border} pb-3`}
                >
                  <span>System</span>
                  <span>AFENDA</span>
                </div>
                <div
                  className={`flex items-center justify-between border-b ${p.border} pb-3`}
                >
                  <span>Identity</span>
                  <span>The Machine</span>
                </div>
                <div
                  className={`flex items-center justify-between border-b ${p.border} pb-3`}
                >
                  <span>Doctrine</span>
                  <span>Assume Nothing</span>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`flex items-center justify-between border-t ${p.border} pt-5 text-[10px] tracking-[0.42em] uppercase ${p.subtext} md:text-xs`}
          >
            <span>Scroll for evidence</span>
            <span>Beyond drift</span>
          </div>
        </motion.div>

        <motion.div
          className={`relative hidden min-h-screen border-l ${p.border} xl:block`}
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
                  Machine statement
                </div>
                <div>
                  <div className="max-w-sm text-5xl leading-[0.9] font-black tracking-[-0.06em] uppercase">
                    ERP as
                    <br />
                    truth
                  </div>
                  <p className="mt-6 max-w-md text-base leading-7 text-white/68">
                    Every document, entity, event, and transition enters one
                    machine. Not for display. For truth, control, and forensic
                    reconstruction.
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
              AFENDA does not decorate operations. It renders business truth
              legible.
            </div>
          </div>
        </motion.div>
      </div>
    </SectionFrame>
  )
}

function DoctrineBand() {
  const items = useMemo(
    () => [
      "Assume Nothing",
      "One Machine",
      "Evidence First",
      "Truth Over Drift",
      "Forensic Before Narrative",
    ],
    []
  )

  return (
    <SectionFrame
      id="doctrine-band"
      surface="dark"
      className="border-t border-b border-black py-5 md:py-6"
    >
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
    </SectionFrame>
  )
}

function DoctrineSection({
  item,
  index,
  reduceMotion,
}: {
  item: (typeof DOCTRINE)[number]
  index: number
  reduceMotion: boolean
}) {
  const dark = index % 2 === 1
  const p = palette(dark ? "dark" : "light")

  return (
    <motion.section
      className={`flex min-h-screen items-center border-b ${dark ? "bg-black text-white" : "bg-white text-black"}`}
      initial={reduceMotion ? false : { opacity: 0, y: 40 }}
      whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.02,
      }}
    >
      <div className="mx-auto w-full max-w-[1600px] px-6 md:px-12">
        <div className="grid gap-10 md:grid-cols-[180px_1fr] md:gap-16 xl:grid-cols-[220px_1fr]">
          <div
            className={`text-6xl font-black tracking-[-0.08em] ${p.subtext} md:text-7xl`}
          >
            {item.id}
          </div>

          <div className="border-l border-current/10 pl-0 md:pl-10">
            <SectionEyebrow surface={dark ? "dark" : "light"} className="mb-6">
              Principle
            </SectionEyebrow>
            <h2
              className="max-w-5xl leading-[0.88] font-black tracking-[-0.08em] uppercase"
              style={{ fontSize: TYPE_SCALE.chamber }}
            >
              {item.title}
            </h2>
            <p className={`mt-6 max-w-3xl text-xl leading-9 ${p.body}`}>
              {item.statement}
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

function DoctrineFlow({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <>
      {DOCTRINE.map((item, index) => (
        <DoctrineSection
          key={item.id}
          item={item}
          index={index}
          reduceMotion={reduceMotion}
        />
      ))}
    </>
  )
}

function TerminalCall({ reduceMotion }: { reduceMotion: boolean }) {
  const p = palette("light")

  return (
    <SectionFrame
      id="terminal"
      surface="light"
      className="min-h-[88vh] overflow-hidden border-t border-black"
    >
      <div className="mx-auto flex min-h-[88vh] max-w-[1800px] flex-col justify-between border-x border-black/10 px-6 py-10 md:px-10 md:py-12 xl:px-16 xl:py-16">
        <div
          className={`flex items-center justify-between text-[10px] tracking-[0.42em] uppercase ${p.subtext} md:text-xs`}
        >
          <span>Final statement</span>
          <span>Truth, not theatre</span>
        </div>

        <div className="py-12 md:py-16">
          <MonolithStatement
            text={`You are free
to execute`}
            scale="terminal"
            className="max-w-6xl leading-[0.82]"
          />
          <p
            className={`mt-8 max-w-2xl text-lg leading-8 ${p.body} md:text-xl`}
          >
            But every execution becomes truth. AFENDA is the machine for
            enterprise truth: an ERP built to preserve evidence, expose
            causality, and support forensic reconstruction under pressure.
          </p>
        </div>

        <motion.button
          type="button"
          whileHover={reduceMotion ? {} : { y: MOTION.hoverLift }}
          whileTap={reduceMotion ? {} : { scale: 0.995 }}
          className="group inline-flex w-fit items-center gap-4 border-2 border-black px-8 py-5 text-sm tracking-[0.34em] uppercase transition-colors hover:bg-black hover:text-white md:px-10"
        >
          <span>Enter AFENDA</span>
          <ArrowRight className="h-5 w-5" strokeWidth={2} />
        </motion.button>
      </div>
    </SectionFrame>
  )
}
