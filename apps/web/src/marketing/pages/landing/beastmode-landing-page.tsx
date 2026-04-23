import React, { useEffect, useRef, useState } from "react"
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  type MotionValue,
} from "framer-motion"
import { ArrowRight, Crosshair, Scan, Eye } from "lucide-react"

// --- CORE PHYSICS & CONSTANTS ---
const EASE_SNAP: [number, number, number, number] = [0.85, 0, 0.15, 1]
const EASE_DRIFT: [number, number, number, number] = [0.16, 1, 0.3, 1]

const FAILURE_MODES = [
  { id: "F-01", title: "UNATTRIBUTED", truth: "Contaminated Origin" },
  { id: "F-02", title: "NARRATIVE", truth: "Insufficient Evidence" },
  { id: "F-03", title: "DRIFT", truth: "Fractured Continuity" },
  { id: "F-04", title: "DEPENDENCY", truth: "Manual Reconstruction" },
] as const

// --- 0. KINETIC INFRASTRUCTURE ---

function NoiseAndTelemetry() {
  const [mem, setMem] = useState("0x0000")

  useEffect(() => {
    const interval = setInterval(() => {
      setMem(
        `0x${Math.floor(Math.random() * 65535)
          .toString(16)
          .toUpperCase()
          .padStart(4, "0")}`
      )
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <svg className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.25] mix-blend-difference">
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>

      <div className="pointer-events-none fixed inset-0 z-50 flex flex-col justify-between p-6 text-white mix-blend-difference">
        <div className="flex justify-between font-mono text-[10px] font-bold tracking-[0.4em] uppercase">
          <span className="flex items-center gap-2">
            <Crosshair className="h-3 w-3" /> AFENDA // BEASTMODE
          </span>
          <span className="opacity-50">MEM: {mem}</span>
        </div>
      </div>
    </>
  )
}

function InvertedCursor() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.5 })
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.5 })

  useEffect(() => {
    const updateMouse = (e: MouseEvent) => {
      x.set(e.clientX - window.innerWidth * 0.15)
      y.set(e.clientY - window.innerWidth * 0.15)
    }
    window.addEventListener("mousemove", updateMouse)
    return () => window.removeEventListener("mousemove", updateMouse)
  }, [x, y])

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-40 h-[30vw] w-[30vw] rounded-full bg-white mix-blend-difference"
      style={{ x: springX, y: springY, filter: "blur(40px)", opacity: 0.9 }}
    />
  )
}

// --- ACT 1: JUDGMENT (System Activation) ---

function ActOneJudgment({ scroll }: { scroll: MotionValue<number> }) {
  const yLeft = useTransform(scroll, [0, 0.2], ["0vh", "-40vh"])
  const yRight = useTransform(scroll, [0, 0.2], ["0vh", "40vh"])
  const blur = useTransform(scroll, [0, 0.2], [0, 20])
  const scale = useTransform(scroll, [0, 0.2], [1, 1.2])

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">
      <motion.div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03]"
        style={{ scale: useTransform(scroll, [0, 0.5], [1, 5]) }}
      >
        <div className="text-[150vw] leading-none font-black tracking-tighter">
          ?
        </div>
      </motion.div>

      <motion.div
        className="relative z-10 flex w-full flex-col items-center px-6"
        style={{ scale, filter: useTransform(blur, (v) => `blur(${v}px)`) }}
      >
        <div className="mb-12 flex items-center gap-4 font-mono text-[10px] tracking-[0.5em] uppercase opacity-40">
          <Scan className="h-4 w-4 animate-pulse" /> SCANNING FRAGMENTS
        </div>

        <div className="flex overflow-hidden mix-blend-difference">
          <motion.h1
            style={{ y: yLeft }}
            className="text-[clamp(4rem,15vw,20rem)] leading-[0.75] font-black tracking-tighter uppercase"
          >
            UNVER
          </motion.h1>
          <motion.h1
            style={{ y: yRight }}
            className="text-[clamp(4rem,15vw,20rem)] leading-[0.75] font-black tracking-tighter uppercase"
          >
            IFIED
          </motion.h1>
        </div>
        <h2 className="mt-[-2vw] text-[clamp(4rem,15vw,20rem)] leading-[0.75] font-black tracking-tighter uppercase">
          INPUT
        </h2>

        <p className="mt-16 max-w-xl border-t border-white/20 pt-8 text-center text-xl leading-relaxed font-light opacity-60">
          The system does not accept narrative. It does not welcome
          approximation. You are currently outside the boundary of truth.
        </p>
      </motion.div>
    </section>
  )
}

// --- ACT 2: INTERROGATION (Physical Viewport Displacement) ---

function ActTwoInterrogation() {
  const checks = [
    {
      id: "CHK_01",
      label: "ORIGIN VERIFICATION",
      note: "Value exists without attributable origin.",
    },
    {
      id: "CHK_02",
      label: "CAUSAL LINK",
      note: "Transition lacks provable causal chain.",
    },
    {
      id: "CHK_03",
      label: "STATE CONSISTENCY",
      note: "Recorded surface diverges from reality.",
    },
  ]

  return (
    <section className="relative overflow-hidden border-y-[20px] border-black bg-white py-48 text-black">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-24 px-6 md:px-16 lg:flex-row">
        <div className="flex flex-col justify-center lg:w-1/2">
          <h2 className="text-[clamp(4rem,10vw,12rem)] leading-[0.8] font-black tracking-tighter uppercase">
            PROVE
            <br />
            <span className="font-light italic">EVERY</span>
            <br />
            STATE.
          </h2>
        </div>

        <div className="flex flex-col justify-center gap-4 lg:w-1/2">
          {checks.map((check, i) => (
            <motion.div
              key={check.id}
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: EASE_DRIFT }}
              className="group relative cursor-crosshair overflow-hidden border-[3px] border-black p-8 transition-colors duration-500 hover:bg-black hover:text-white"
            >
              <div className="absolute top-8 right-8 font-mono text-[10px] tracking-[0.4em] opacity-0 transition-opacity group-hover:opacity-100">
                FAIL
              </div>
              <div className="mb-4 font-mono text-[10px] font-bold tracking-[0.4em] uppercase opacity-40 group-hover:opacity-60">
                {check.id}
              </div>
              <h3 className="mb-4 text-4xl font-black tracking-tighter uppercase">
                {check.label}
              </h3>

              {/* Physical expansion on hover */}
              <div className="grid grid-rows-[0fr] transition-all duration-500 ease-[cubic-bezier(0.85,0,0.15,1)] group-hover:grid-rows-[1fr]">
                <div className="overflow-hidden">
                  <p className="mt-4 border-t border-current/20 pt-4 text-lg font-medium tracking-widest uppercase opacity-80">
                    {check.note}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- ACT 3: CONVERGENCE (3D Z-Axis Collapse) ---

const CONVERGENCE_LAYERS = [
  "DOCUMENT",
  "ENTITY",
  "EVENT",
  "TRANSITION",
  "CANON",
] as const

function ConvergenceLayerRow({
  layer,
  i,
  localScroll,
}: {
  layer: string
  i: number
  localScroll: MotionValue<number>
}) {
  const isCanon = i === CONVERGENCE_LAYERS.length - 1
  const depth = (i - 2) * 300
  const z = useTransform(localScroll, [0, 0.6], [depth, 0])
  const opacity = useTransform(
    localScroll,
    [0, 0.2, 0.6, 0.8],
    [0, 0.6, 1, isCanon ? 1 : 0]
  )
  const borderWeight = useTransform(
    localScroll,
    [0.5, 0.6],
    [1, isCanon ? 10 : 2]
  )

  return (
    <motion.div
      className={`absolute inset-0 m-auto flex items-center justify-center overflow-hidden ${isCanon ? "bg-white text-black" : "border border-white/20 bg-black/50 backdrop-blur-sm"}`}
      style={{
        width: 300 + i * 80,
        height: 300 + i * 80,
        z,
        opacity,
        borderWidth: borderWeight,
        transformStyle: "preserve-3d",
      }}
    >
      <span className="text-4xl font-black tracking-tighter text-white uppercase mix-blend-difference md:text-7xl">
        {layer}
      </span>
    </motion.div>
  )
}

function ActThreeConvergence({
  scroll: _scroll,
}: {
  scroll: MotionValue<number>
}) {
  const containerRef = useRef(null)
  const { scrollYProgress: localScroll } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // Physics: Rotate and slam layers into a single plane
  const rotation = useTransform(localScroll, [0, 0.6, 1], [45, 0, -5])
  const perspective = useTransform(localScroll, [0, 1], ["1200px", "400px"])
  const scale = useTransform(localScroll, [0, 0.6, 0.9, 1], [0.5, 1, 1.2, 20])
  const collapseTitleOpacity = useTransform(localScroll, [0.8, 0.9], [0, 1])

  return (
    <section
      ref={containerRef}
      className="relative h-[500vh] bg-black text-white"
    >
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden">
        <div className="absolute top-12 flex items-center gap-4 font-mono text-[10px] tracking-[0.5em] uppercase opacity-40">
          <Eye className="h-4 w-4" /> FORCED CONVERGENCE
        </div>

        <motion.div
          className="relative z-10 flex h-full w-full items-center justify-center"
          style={{ perspective }}
        >
          <motion.div
            style={{
              rotateX: rotation,
              rotateY: rotation,
              scale,
              transformStyle: "preserve-3d",
            }}
            className="relative"
          >
            {CONVERGENCE_LAYERS.map((layer, i) => (
              <ConvergenceLayerRow
                key={layer}
                layer={layer}
                i={i}
                localScroll={localScroll}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Typographic command at the end of the collapse */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
          style={{ opacity: collapseTitleOpacity }}
        >
          <h2 className="text-center text-[clamp(4rem,10vw,12rem)] leading-none font-black tracking-tighter text-black uppercase mix-blend-difference">
            ALL FRAGMENTS
            <br />
            BOUND.
          </h2>
        </motion.div>
      </div>
    </section>
  )
}

// --- ACT 4: FAILURE EXPOSURE (Inverted Absolute Override) ---

function ActFourAutopsy() {
  return (
    <section className="relative grid grid-cols-1 border-y-[20px] border-white bg-black md:grid-cols-2">
      {FAILURE_MODES.map((fail, i) => {
        const isBlack = i === 1 || i === 2

        return (
          <div
            key={fail.id}
            className={`group relative flex aspect-square items-center justify-center overflow-hidden border border-current/10 ${
              isBlack ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            {/* Background Number */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03] transition-transform duration-1000 group-hover:scale-110">
              <div className="text-[45vw] leading-none font-black tracking-tighter md:text-[25vw]">
                {i + 1}
              </div>
            </div>

            {/* Default State */}
            <div className="relative z-10 px-12 text-center transition-opacity duration-500 group-hover:opacity-0">
              <div className="mb-8 text-[10px] font-black tracking-[0.5em] uppercase opacity-50">
                Autopsy: {fail.id}
              </div>
              <h3 className="mb-6 text-5xl font-bold tracking-tighter uppercase md:text-7xl">
                {fail.title}
              </h3>
            </div>

            {/* Brutal Override State */}
            <div
              className={`absolute inset-0 flex origin-bottom scale-y-0 flex-col items-center justify-center opacity-0 transition-all duration-500 ease-[cubic-bezier(0.85,0,0.15,1)] group-hover:scale-y-100 group-hover:opacity-100 ${isBlack ? "bg-white text-black" : "bg-black text-white"}`}
            >
              <div className="mb-8 border-b-2 border-current pb-2 text-[10px] font-black tracking-[0.6em] uppercase opacity-50">
                Resulting Flaw
              </div>
              <div className="px-6 text-center text-4xl leading-[0.85] font-black tracking-tighter uppercase md:text-6xl">
                {fail.truth}
              </div>
            </div>
          </div>
        )
      })}
    </section>
  )
}

// --- ACT 5: VERDICT (The Zenith Lock) ---

function ActFiveVerdict({ scroll: _scroll }: { scroll: MotionValue<number> }) {
  const containerRef = useRef(null)
  const { scrollYProgress: localScroll } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  })

  // Mechanical Actuators slamming shut
  const topBracketY = useTransform(localScroll, [0.3, 0.7], ["-50vh", "0vh"])
  const bottomBracketY = useTransform(localScroll, [0.3, 0.7], ["50vh", "0vh"])
  const opacity = useTransform(localScroll, [0.6, 0.8], [0, 1])
  const scale = useTransform(localScroll, [0.7, 1], [0.9, 1])

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white text-black"
    >
      {/* Mechanical Actuators */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-between">
        <motion.div
          className="h-[20vh] w-[10vw] bg-black"
          style={{ y: topBracketY }}
        />
        <motion.div
          className="h-[20vh] w-[10vw] bg-black"
          style={{ y: bottomBracketY }}
        />
      </div>

      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 flex w-full max-w-screen-xl flex-col items-center px-6 text-center"
      >
        <div className="mb-12 inline-block border-b-2 border-black pb-4 text-[10px] font-black tracking-[0.6em] uppercase opacity-40">
          Terminal Declaration
        </div>

        <h2 className="mb-20 text-[clamp(5rem,15vw,18rem)] leading-[0.75] font-black tracking-tighter uppercase">
          CONTROL IS
          <br />
          <span className="font-thin italic">DENIED.</span>
        </h2>

        <button
          type="button"
          className="group relative w-full cursor-crosshair overflow-hidden border-[4px] border-black bg-white px-12 py-8 transition-colors hover:border-black md:w-auto"
        >
          <motion.div
            className="absolute inset-0 origin-left bg-black"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.4, ease: EASE_SNAP }}
          />
          <span className="relative z-10 flex items-center justify-center gap-6 text-xl font-black tracking-[0.3em] uppercase mix-blend-difference transition-colors group-hover:text-white md:text-3xl">
            INITIALIZE PROTOCOL
            <ArrowRight
              className="h-8 w-8 transition-transform group-hover:translate-x-4"
              strokeWidth={3}
            />
          </span>
        </button>

        <p className="mt-12 max-w-md text-[10px] font-black tracking-[0.5em] uppercase opacity-40">
          Entry is not exploration. It is protocol. Submit to system law or
          remain unverified.
        </p>
      </motion.div>
    </section>
  )
}

// --- MAIN ASSEMBLY ---

export default function BeastmodeLandingPage() {
  const rootRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ["start start", "end end"],
  })

  // Global smooth scroll for cinematic interpolations
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.001,
  })

  return (
    <div
      ref={rootRef}
      className="relative bg-black text-white selection:bg-white selection:text-black"
      style={{
        fontFamily: "'Helvetica Neue', system-ui, -apple-system, sans-serif",
      }}
    >
      <NoiseAndTelemetry />
      <InvertedCursor />

      <main className="relative z-10">
        <ActOneJudgment scroll={smoothProgress} />
        <ActTwoInterrogation />
        <ActThreeConvergence scroll={smoothProgress} />
        <ActFourAutopsy />
        <ActFiveVerdict scroll={smoothProgress} />
      </main>
    </div>
  )
}
