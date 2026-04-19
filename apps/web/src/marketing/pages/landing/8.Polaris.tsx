import { useRef } from "react"
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion"
import {
  ArrowRight,
  Fingerprint,
  Globe,
  Hexagon,
  Shield,
  FileText,
  Clock3,
  MapPin,
  ScanSearch,
  GitBranch,
  Layers3,
  Orbit,
} from "lucide-react"

/**
 * AFENDA — THE MACHINE
 * Polaris Singularity / 7W1H Directorship Cut
 *
 * Marketing-only cinematic page.
 * Scroll is the labor of reconstruction.
 * The center spine is the Canon.
 * 7W1H traces collapse from distributed evidence into one bound truth surface.
 *
 * Sequence:
 * 1. Fragmentation
 * 2. Attraction
 * 3. 7W1H forensic bind
 * 4. Canon lock
 * 5. Final inversion
 */
export default function PolarisSingularity7W1H() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    damping: 22,
    stiffness: 90,
    mass: 0.9,
  })

  return (
    <div
      ref={containerRef}
      className="relative h-[620vh] bg-black text-white selection:bg-blue-500/30"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        <AmbientEnvironment progress={smoothProgress} />
        <ForensicGrid progress={smoothProgress} />
        <OrbitingFragments progress={smoothProgress} />
        <NexusCanonSpine progress={smoothProgress} />
        <ForensicTraceField progress={smoothProgress} />
        <NarrativeOverlays progress={smoothProgress} />
        <FinalInversion progress={smoothProgress} />
        <div className="forensic-overlay pointer-events-none absolute inset-0 z-[60]" />
      </div>
    </div>
  )
}

function AmbientEnvironment({ progress }: { progress: MotionValue<number> }) {
  const blueBloomOpacity = useTransform(
    progress,
    [0.18, 0.52, 0.7],
    [0, 0.18, 0.08]
  )
  const blueBloomScale = useTransform(progress, [0, 0.55], [0.8, 1.15])
  const vignetteOpacity = useTransform(
    progress,
    [0, 0.4, 1],
    [0.55, 0.72, 0.94]
  )

  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),rgba(255,255,255,0)_35%),linear-gradient(to_bottom,rgba(255,255,255,0.02),rgba(255,255,255,0)_25%),linear-gradient(to_bottom,#040404,#000_40%,#000)]" />

      <motion.div
        className="absolute top-1/2 left-1/2 h-[110vmax] w-[110vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 mix-blend-screen"
        style={{
          opacity: blueBloomOpacity,
          scale: blueBloomScale,
          filter: "blur(140px)",
        }}
      />

      <motion.div
        className="absolute inset-0"
        style={{
          opacity: vignetteOpacity,
          background:
            "radial-gradient(circle at center, rgba(0,0,0,0) 28%, rgba(0,0,0,0.32) 62%, rgba(0,0,0,0.82) 100%)",
        }}
      />
    </>
  )
}

function ForensicGrid({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(
    progress,
    [0, 0.15, 0.65, 0.8],
    [0.1, 0.18, 0.14, 0.05]
  )
  const y = useTransform(progress, [0, 1], [0, -90])

  return (
    <motion.div
      className="absolute inset-0 z-[2]"
      style={{
        opacity,
        y,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)
        `,
        backgroundSize: "84px 84px",
        maskImage:
          "radial-gradient(circle at center, black 42%, transparent 82%)",
      }}
    />
  )
}

type OrbitingRingSpec = {
  size: number
  rotate: number
  drift: number
}

function OrbitingRingFragment({
  ring,
  progress,
}: {
  ring: OrbitingRingSpec
  progress: MotionValue<number>
}) {
  const rotate = useTransform(progress, [0, 0.36], [ring.rotate, 0])
  const scale = useTransform(progress, [0, 0.36], [1.05, 0.95])
  const z = useTransform(progress, [0, 0.36], [ring.drift, 0])
  const borderOpacity = useTransform(
    progress,
    [0, 0.18, 0.36],
    [0.12, 0.34, 0.12]
  )
  const borderColor = useTransform(
    borderOpacity,
    (v) => `rgba(255,255,255,${v})`
  )

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 rounded-full border border-white/10"
      style={{
        width: ring.size,
        height: ring.size,
        marginLeft: -ring.size / 2,
        marginTop: -ring.size / 2,
        rotate,
        scale,
        z,
        borderColor,
        transformStyle: "preserve-3d",
      }}
    >
      <div className="absolute top-0 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 shadow-[0_0_18px_rgba(59,130,246,0.7)]" />
      <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-white/80 shadow-[0_0_18px_rgba(255,255,255,0.35)]" />
      <div className="absolute top-1/2 left-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60" />
      <div className="absolute top-1/2 right-0 h-2 w-2 translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/80" />
    </motion.div>
  )
}

function OrbitingFragments({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(
    progress,
    [0, 0.08, 0.28, 0.42],
    [0, 0.8, 0.8, 0]
  )

  const rings: OrbitingRingSpec[] = [
    { size: 700, rotate: 120, drift: -140 },
    { size: 520, rotate: -160, drift: 110 },
    { size: 360, rotate: 200, drift: -90 },
  ]

  return (
    <motion.div className="absolute inset-0 z-[6]" style={{ opacity }}>
      {rings.map((ring, i) => (
        <OrbitingRingFragment key={i} ring={ring} progress={progress} />
      ))}
    </motion.div>
  )
}

function NexusCanonSpine({ progress }: { progress: MotionValue<number> }) {
  const scaleY = useTransform(progress, [0.28, 0.46], [0, 1])
  const opacity = useTransform(progress, [0.25, 0.4], [0, 1])
  const glowOpacity = useTransform(
    progress,
    [0.4, 0.6, 0.86],
    [0.28, 0.85, 0.16]
  )

  return (
    <motion.div
      className="absolute top-0 left-1/2 z-[15] h-full w-px origin-top -translate-x-1/2 bg-white"
      style={{ scaleY, opacity }}
    >
      <motion.div
        className="absolute inset-0 bg-blue-500"
        style={{
          opacity: glowOpacity,
          boxShadow:
            "0 0 22px rgba(59,130,246,0.85), 0 0 70px rgba(59,130,246,0.45), 0 0 160px rgba(59,130,246,0.24)",
        }}
      />
    </motion.div>
  )
}

type TraceSpec = {
  key: string
  short: string
  value: string
  note: string
  side: "left" | "right"
  icon: React.ComponentType<{ className?: string }>
  y: number
  enterStart: number
  enterEnd: number
}

const TRACE_SPECS: TraceSpec[] = [
  {
    key: "who",
    short: "WHO",
    value: "ACTOR_ID::BOUND",
    note: "Identity resolved to accountable origin.",
    side: "left",
    icon: Fingerprint,
    y: -260,
    enterStart: 0.34,
    enterEnd: 0.46,
  },
  {
    key: "what",
    short: "WHAT",
    value: "DEED_VECTOR::POSTED",
    note: "The action is captured as an irreversible deed.",
    side: "right",
    icon: FileText,
    y: -190,
    enterStart: 0.37,
    enterEnd: 0.49,
  },
  {
    key: "when",
    short: "WHEN",
    value: "TIME_MARK::ATOMIC",
    note: "Temporal truth fixed to a non-repudiable moment.",
    side: "left",
    icon: Clock3,
    y: -110,
    enterStart: 0.4,
    enterEnd: 0.52,
  },
  {
    key: "where",
    short: "WHERE",
    value: "LOCUS::TENANT_SCOPE",
    note: "Jurisdiction, entity, and operating surface resolved.",
    side: "right",
    icon: MapPin,
    y: -30,
    enterStart: 0.43,
    enterEnd: 0.55,
  },
  {
    key: "why",
    short: "WHY",
    value: "DOCTRINE::CAUSAL",
    note: "Reason and mandate linked to governing doctrine.",
    side: "left",
    icon: ScanSearch,
    y: 50,
    enterStart: 0.46,
    enterEnd: 0.58,
  },
  {
    key: "which",
    short: "WHICH",
    value: "OBJECT_SET::RESOLVED",
    note: "Affected documents, entities, and state surfaces selected.",
    side: "right",
    icon: Layers3,
    y: 130,
    enterStart: 0.49,
    enterEnd: 0.61,
  },
  {
    key: "whose",
    short: "WHOSE",
    value: "OWNERSHIP::ATTRIBUTED",
    note: "Stewardship and legal responsibility assigned.",
    side: "left",
    icon: Shield,
    y: 210,
    enterStart: 0.52,
    enterEnd: 0.64,
  },
  {
    key: "how",
    short: "HOW",
    value: "METHOD::CHAINED",
    note: "Procedure, causality, and execution path preserved.",
    side: "right",
    icon: GitBranch,
    y: 290,
    enterStart: 0.55,
    enterEnd: 0.67,
  },
]

function ForensicTraceField({ progress }: { progress: MotionValue<number> }) {
  const fieldOpacity = useTransform(
    progress,
    [0.28, 0.36, 0.72, 0.82],
    [0, 1, 1, 0]
  )

  const canonOpacity = useTransform(progress, [0.64, 0.7], [0, 1])
  const canonScale = useTransform(progress, [0.64, 0.72], [0.92, 1])

  return (
    <motion.div
      className="absolute inset-0 z-[20]"
      style={{ opacity: fieldOpacity }}
    >
      {TRACE_SPECS.map((trace) => (
        <TraceNode key={trace.key} progress={progress} trace={trace} />
      ))}

      <motion.div
        className="absolute top-1/2 left-1/2 z-[30] flex w-[min(78vw,560px)] -translate-x-1/2 -translate-y-1/2 flex-col items-center border border-blue-500/35 bg-black/70 px-7 py-7 backdrop-blur-xl"
        style={{ opacity: canonOpacity, scale: canonScale }}
      >
        <div className="mb-3 flex items-center gap-3 text-blue-400">
          <Orbit className="h-4 w-4" />
          <span className="font-mono text-[10px] tracking-[0.42em]">
            NEXUSCANON_LOCK
          </span>
        </div>

        <div className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-blue-500/45 to-transparent" />

        <p className="text-center text-2xl font-semibold tracking-[0.08em] text-white uppercase md:text-3xl">
          The Canon is Bound.
        </p>

        <p className="mt-3 max-w-md text-center text-sm leading-relaxed text-white/50 md:text-[15px]">
          Document. Entity. Event. State transition. No longer separate.
          Resolved into one truth surface.
        </p>
      </motion.div>
    </motion.div>
  )
}

function TraceNode({
  progress,
  trace,
}: {
  progress: MotionValue<number>
  trace: TraceSpec
}) {
  const isLeft = trace.side === "left"
  const Icon = trace.icon

  const x = useTransform(
    progress,
    [trace.enterStart, trace.enterEnd],
    [isLeft ? -520 : 520, 0]
  )

  const opacity = useTransform(
    progress,
    [
      trace.enterStart - 0.03,
      trace.enterStart,
      trace.enterEnd,
      trace.enterEnd + 0.14,
    ],
    [0, 0.35, 1, 0.88]
  )

  const blur = useTransform(
    progress,
    [trace.enterStart, trace.enterEnd],
    [10, 0]
  )

  const scale = useTransform(
    progress,
    [trace.enterStart, trace.enterEnd],
    [0.92, 1]
  )

  const wireScaleX = useTransform(
    progress,
    [trace.enterStart + 0.03, trace.enterEnd],
    [0, 1]
  )

  const dotScale = useTransform(
    progress,
    [trace.enterEnd - 0.03, trace.enterEnd + 0.03],
    [0.7, 1]
  )

  return (
    <>
      <motion.div
        className="absolute top-1/2 left-1/2 z-[22]"
        style={{
          x: isLeft ? -220 : 0,
          y: trace.y,
          opacity,
        }}
      >
        <motion.div
          className={`absolute top-1/2 h-px w-[220px] origin-${isLeft ? "right" : "left"} bg-gradient-to-r ${
            isLeft
              ? "from-white/0 via-white/30 to-blue-500/70"
              : "from-blue-500/70 via-white/30 to-white/0"
          }`}
          style={{
            right: isLeft ? 0 : "auto",
            left: isLeft ? "auto" : 0,
            scaleX: wireScaleX,
            transformOrigin: isLeft ? "right center" : "left center",
          }}
        />

        <motion.div
          className={`absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-blue-500 shadow-[0_0_18px_rgba(59,130,246,0.9)] ${
            isLeft ? "-right-1.5" : "-left-1.5"
          }`}
          style={{ scale: dotScale }}
        />
      </motion.div>

      <motion.div
        className={`absolute top-1/2 left-1/2 z-[24] w-[min(36vw,360px)] ${
          isLeft ? "text-right" : "text-left"
        }`}
        style={{
          x,
          y: trace.y,
          opacity,
          scale,
          filter: useTransform(blur, (v) => `blur(${v}px)`),
          marginLeft: isLeft ? -620 : 260,
        }}
      >
        <div
          className={`inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3 py-2 backdrop-blur-md ${
            isLeft ? "ml-auto" : ""
          }`}
        >
          <Icon className="h-3.5 w-3.5 text-blue-400" />
          <span className="font-mono text-[10px] tracking-[0.35em] text-blue-400">
            {trace.short}
          </span>
        </div>

        <div className="mt-3">
          <h3 className="text-[clamp(20px,2.2vw,34px)] font-light tracking-[-0.04em] text-white">
            {trace.value}
          </h3>
          <p className="mt-2 text-[11px] tracking-[0.24em] text-white/32 uppercase">
            {trace.note}
          </p>
        </div>
      </motion.div>
    </>
  )
}

function NarrativeOverlays({ progress }: { progress: MotionValue<number> }) {
  const phase1 = useTransform(progress, [0.02, 0.1, 0.2, 0.28], [0, 1, 1, 0])
  const phase2 = useTransform(progress, [0.24, 0.34, 0.46, 0.56], [0, 1, 1, 0])
  const phase3 = useTransform(progress, [0.56, 0.66, 0.74, 0.82], [0, 1, 1, 0])
  const phase4 = useTransform(progress, [0.78, 0.88, 0.94], [0, 1, 1])

  return (
    <div className="pointer-events-none absolute inset-0 z-[40]">
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        style={{ opacity: phase1 }}
      >
        <p className="mb-5 font-mono text-[10px] tracking-[0.55em] text-white/40 uppercase">
          Phase 1 / Fragmentation
        </p>
        <h2 className="max-w-5xl text-5xl font-light tracking-[-0.06em] text-white md:text-7xl">
          Nothing can be proven.
          <br />
          <span className="text-red-500/80 italic">
            Because nothing is bound.
          </span>
        </h2>
      </motion.div>

      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        style={{ opacity: phase2 }}
      >
        <p className="mb-5 font-mono text-[10px] tracking-[0.55em] text-white/40 uppercase">
          Phase 2 / Attraction
        </p>
        <h2 className="max-w-5xl text-5xl font-light tracking-[-0.06em] text-white md:text-7xl">
          Events converge.
          <br />
          <span className="font-medium text-blue-400">
            Evidence is forced into alignment.
          </span>
        </h2>
      </motion.div>

      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-end px-6 pb-20 text-center md:pb-24"
        style={{ opacity: phase3 }}
      >
        <p className="mb-4 font-mono text-[10px] tracking-[0.55em] text-white/40 uppercase">
          Phase 3 / 7W1H Protocol
        </p>
        <h2 className="max-w-4xl text-4xl font-light tracking-[-0.05em] text-white md:text-6xl">
          Who. What. When. Where.
          <br />
          Why. Which. Whose. How.
        </h2>
        <p className="mt-5 max-w-2xl text-sm tracking-[0.25em] text-white/36 uppercase md:text-[13px]">
          Every number must answer. Every deed must remain reconstructable.
        </p>
      </motion.div>

      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        style={{ opacity: phase4, pointerEvents: "auto" }}
      >
        <div className="mb-10 flex gap-4 text-blue-400">
          <Fingerprint className="h-6 w-6" />
          <Hexagon className="h-6 w-6" />
          <Globe className="h-6 w-6" />
        </div>

        <h1 className="text-6xl font-medium tracking-[-0.08em] text-white md:text-8xl">
          Assume Nothing.
        </h1>

        <p className="mt-5 max-w-xl text-lg leading-relaxed font-light text-white/52 md:text-xl">
          Execution is free.
          <br />
          Truth is permanent.
        </p>

        <button className="group relative mt-12 overflow-hidden rounded-full border border-white/12 bg-white px-8 py-4 text-black transition-transform duration-500 hover:scale-[1.03]">
          <span className="relative z-10 flex items-center gap-3 text-sm font-bold tracking-[0.24em]">
            INITIALIZE WORKSPACE
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-white opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </button>
      </motion.div>
    </div>
  )
}

function FinalInversion({ progress }: { progress: MotionValue<number> }) {
  const sectionOpacity = useTransform(progress, [0.9, 0.95], [0, 1])
  const bg = useTransform(progress, [0.93, 0.985], ["#000000", "#ffffff"])
  const color = useTransform(progress, [0.93, 0.985], ["#ffffff", "#000000"])
  const lift = useTransform(progress, [0.9, 1], [40, 0])

  return (
    <motion.section
      className="absolute inset-0 z-[50] flex items-center justify-center px-8"
      style={{ opacity: sectionOpacity, backgroundColor: bg }}
    >
      <motion.div
        className="mx-auto max-w-5xl text-center"
        style={{ color, y: lift }}
      >
        <p className="mb-6 font-mono text-[10px] tracking-[0.55em] uppercase opacity-50">
          End of Protocol
        </p>

        <h2 className="text-[15vw] leading-[0.8] font-semibold tracking-[-0.08em] uppercase italic md:text-[10vw]">
          Assume
          <br />
          Nothing.
        </h2>

        <div className="mx-auto mt-12 max-w-2xl border-t border-current/20 pt-10">
          <p className="text-xl leading-relaxed font-light opacity-78 md:text-2xl">
            AFENDA is the machine that binds truth.
            <br />
            You are free to execute,
            <br />
            but every execution becomes history.
          </p>
        </div>
      </motion.div>
    </motion.section>
  )
}
