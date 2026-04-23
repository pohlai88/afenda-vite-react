/**
 * AFENDA: THE NEXUSCANON REFINE
 * Theme: Forensic Brutalism (B&W)
 * Core Concept: The transition from 'Narrative Chaos' to 'Provable Truth'
 */

import { useRef } from "react"
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion"

export default function AfendaExperience() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 80,
    restDelta: 0.001,
  })

  return (
    <div
      ref={containerRef}
      className="relative h-[600vh] overflow-clip bg-[#050505] text-white selection:bg-white selection:text-black"
    >
      {/* HUD / FIXED OVERLAY */}
      <div className="fixed top-8 left-8 z-50 mix-blend-difference">
        <p className="font-mono text-[10px] tracking-[0.3em] opacity-50">
          AFENDA // PRINCIPLE_001
        </p>
      </div>
      <div className="fixed right-8 bottom-8 z-50 flex items-end gap-12 mix-blend-difference">
        <div className="text-right">
          <p className="mb-1 font-mono text-[10px] tracking-[0.3em] opacity-50">
            SYSTEM_STATUS
          </p>
          <p className="font-mono text-xs tracking-widest">TRUTH_RESOLVED</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center border border-white/20 font-mono text-[10px]">
          <motion.span>
            {useTransform(smoothProgress, (v) => Math.floor(v * 100))}
          </motion.span>
          %
        </div>
      </div>

      {/* STICKY ENGINE */}
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        <ForensicGrid progress={smoothProgress} />
        <TheCanonCore progress={smoothProgress} />
        <BrutalistTypography progress={smoothProgress} />
      </div>
    </div>
  )
}

function TheCanonCore({ progress }: { progress: MotionValue<number> }) {
  // Movement Logic:
  // 0.0 - 0.4: Extreme "Z-axis" depth separation (Chaos)
  // 0.4 - 0.7: Convergence into a single "Plane of Truth"
  // 0.7 - 1.0: Expansion/Scale through the camera

  const rotation = useTransform(progress, [0, 0.7, 1], [45, 0, -15])
  const scale = useTransform(progress, [0, 0.7, 0.9, 1], [0.4, 1, 1.1, 15])
  const perspective = useTransform(progress, [0, 1], ["1000px", "400px"])

  return (
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
        {[...Array(8)].map((_, i) => (
          <TruthLayer key={i} index={i} progress={progress} />
        ))}
      </motion.div>
    </motion.div>
  )
}

function TruthLayer({
  index,
  progress,
}: {
  index: number
  progress: MotionValue<number>
}) {
  const depth = (index - 4) * 200
  // Each layer snaps to Z=0 at progress 0.6
  const z = useTransform(progress, [0, 0.6], [depth, 0])
  const opacity = useTransform(progress, [0, 0.2, 0.6, 0.8], [0, 0.4, 1, 0])
  const borderWeight = useTransform(progress, [0.5, 0.6], [1, 4])

  return (
    <motion.div
      className="absolute inset-0 m-auto flex items-center justify-center overflow-hidden border border-white/10"
      style={{
        width: 400 + index * 40,
        height: 400 + index * 40,
        z,
        opacity,
        borderWidth: borderWeight,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Generative Forensic Numbers */}
      <div className="flex h-full w-full flex-wrap gap-2 overflow-hidden p-4 font-mono text-[8px] break-all opacity-20">
        {Array(10)
          .fill(0)
          .map((_, j) => {
            const suffix = (((index * 31 + j * 17) * 2654435761) >>> 0)
              .toString(16)
              .slice(0, 6)
            return (
              <span key={j}>
                0x{index}
                {j}FF_TRUTH_STMT_{suffix}
              </span>
            )
          })}
      </div>
    </motion.div>
  )
}

function BrutalistTypography({ progress }: { progress: MotionValue<number> }) {
  const chaosY = useTransform(progress, [0, 0.3], [100, 0])
  const chaosOp = useTransform(progress, [0, 0.2, 0.3], [0, 1, 0])

  const truthScale = useTransform(progress, [0.5, 0.7], [0.8, 1])
  const truthOp = useTransform(progress, [0.5, 0.6, 0.8, 0.9], [0, 1, 1, 0])
  const doctrineOpacity = useTransform(progress, [0.85, 0.95], [0, 1])

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center text-center">
      {/* STEP 1: CHAOS */}
      <motion.div style={{ y: chaosY, opacity: chaosOp }} className="absolute">
        <h2 className="text-[120px] leading-none font-black tracking-tighter uppercase italic">
          Scattered
        </h2>
        <p className="mt-4 font-mono text-sm tracking-[0.5em]">
          NARRATIVE IS A WEAPON. SILENCE IT.
        </p>
      </motion.div>

      {/* STEP 2: CONVERGENCE */}
      <motion.div
        style={{ scale: truthScale, opacity: truthOp }}
        className="absolute px-6"
      >
        <h2 className="text-7xl font-bold tracking-tight uppercase md:text-9xl">
          Resolved.
        </h2>
        <div className="mx-auto mt-8 h-px w-64 bg-white" />
      </motion.div>

      {/* STEP 3: THE DOCTRINE (FINAL) */}
      <motion.div
        style={{ opacity: doctrineOpacity }}
        className="absolute inset-0 flex flex-col items-center justify-center bg-white p-12 text-black"
      >
        <div className="max-w-4xl space-y-8 text-left">
          <h3 className="mb-12 font-mono text-sm tracking-[0.4em]">
            FINAL_STATEMENT.EXE
          </h3>
          <p className="text-6xl leading-[0.9] font-bold tracking-tighter">
            YOU ARE FREE <br />
            TO EXECUTE.
          </p>
          <p className="max-w-xl text-2xl font-light tracking-tight">
            But every execution becomes truth. No logs. No history. Only the
            Canon.
          </p>
          <div className="pt-12">
            <button className="cursor-pointer bg-black px-12 py-6 font-mono text-sm tracking-widest text-white transition-colors hover:bg-neutral-800">
              INITIALIZE_THE_MACHINE
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function ForensicGrid({ progress }: { progress: MotionValue<number> }) {
  const gridOp = useTransform(progress, [0, 0.5, 1], [0.05, 0.15, 0.05])
  return (
    <motion.div
      style={{ opacity: gridOp }}
      className="pointer-events-none absolute inset-0"
      dangerouslySetInnerHTML={{
        __html: `
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="0.5"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            `,
      }}
    />
  )
}
