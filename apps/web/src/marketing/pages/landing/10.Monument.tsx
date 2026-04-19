import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"

// --- SYSTEM CONSTANTS & PHYSICS ---
const EASE_BRUTAL: [number, number, number, number] = [0.86, 0, 0.07, 1]
const EASE_SMOOTH: [number, number, number, number] = [0.16, 1, 0.3, 1]

const VALIDATION_LOG = [
  {
    id: "CHK-01",
    label: "ORIGIN VERIFICATION",
    status: "FAIL",
    note: "Value exists without attributable origin. Eradication recommended.",
  },
  {
    id: "CHK-02",
    label: "CAUSAL LINK",
    status: "UNKNOWN",
    note: "Transition lacks provable causal chain. Narrative detected.",
  },
  {
    id: "CHK-03",
    label: "STATE CONSISTENCY",
    status: "DRIFT DETECTED",
    note: "Recorded surface diverges from operational reality.",
  },
  {
    id: "CHK-04",
    label: "CROSS-ENTITY CONTINUITY",
    status: "FRACTURED",
    note: "Truth must be rebuilt across fractured context. Unacceptable.",
  },
] as const

const FAILURE_MODES = [
  {
    code: "F-01",
    title: "UNATTRIBUTED NUMBERS",
    body: "Value exists without causal origin. Reporting surface is irrevocably contaminated.",
  },
  {
    code: "F-02",
    title: "NARRATIVE RECONCILIATION",
    body: "Manual explanation is required because system evidence is fundamentally insufficient.",
  },
  {
    code: "F-03",
    title: "ENTITY DRIFT",
    body: "Cross-border continuity breaks when operational truth fragments across decentralized systems.",
  },
  {
    code: "F-04",
    title: "AUDIT DEPENDENCY",
    body: "External tooling is required to reconstruct what should already be mathematically provable.",
  },
] as const

// --- NATIVE TEXTURE & LIGHTING ---
function AmbientMonolith() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.04] mix-blend-screen">
        <svg className="absolute inset-0 h-full w-full">
          <filter id="monolithNoise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="4"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#monolithNoise)" />
        </svg>
      </div>
      <div className="pointer-events-none fixed inset-y-0 left-1/2 z-0 w-px -translate-x-1/2 bg-white/[0.04]" />
      <motion.div
        animate={{ y: ["0vh", "100vh", "0vh"] }}
        transition={{ duration: 8, ease: "linear", repeat: Infinity }}
        className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[1px] bg-white/[0.15] shadow-[0_0_30px_rgba(255,255,255,0.2)]"
      />
    </>
  )
}

// --- ACT 0: SYSTEM BOOT (The Pre-loader) ---
function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          setTimeout(onComplete, 600) // Brief hold at 100% before shattering
          return 100
        }
        return p + Math.floor(Math.random() * 15) + 5
      })
    }, 100)
    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: EASE_BRUTAL }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse font-mono text-[10px] tracking-[0.4em] text-white/40 uppercase">
          Establishing System Boundary
        </div>
        <div className="text-[clamp(5rem,15vw,20rem)] leading-none font-black tracking-tighter">
          {progress > 100 ? 100 : progress}
          <span className="text-white/20">%</span>
        </div>
        <div className="relative h-px w-64 overflow-hidden bg-white/20">
          <motion.div
            className="absolute inset-y-0 left-0 bg-white"
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.1 }}
          />
        </div>
      </div>
    </motion.div>
  )
}

// --- ACT 1: SYSTEM ACTIVATION ---
function SystemActivation() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-5 md:px-16">
      <div className="absolute top-0 flex w-full max-w-[1680px] justify-between border-b border-white/10 px-5 py-6">
        <span className="font-mono text-[10px] tracking-[0.4em] text-white/40 uppercase">
          AFENDA MONUMENT
        </span>
        <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.4em] text-white/40 uppercase">
          <span className="h-1.5 w-1.5 animate-pulse bg-white" /> SCANNING
        </span>
      </div>

      <div className="z-10 w-full max-w-[1680px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: EASE_SMOOTH }}
          className="mb-8 font-mono text-[10px] tracking-[0.4em] text-white/30 uppercase"
        >
          Visitor Identification
        </motion.div>

        <motion.div
          initial={{
            clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
            y: 40,
          }}
          animate={{
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            y: 0,
          }}
          transition={{ duration: 1.4, delay: 0.4, ease: EASE_BRUTAL }}
        >
          <h1 className="text-[clamp(4.5rem,13vw,15rem)] leading-[0.75] font-black tracking-[-0.06em] uppercase">
            UNVERIFIED
            <br />
            INPUT
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.5, delay: 1, ease: EASE_SMOOTH }}
          className="mt-16 max-w-2xl border-l border-white/20 pl-8"
        >
          <p className="text-xl leading-relaxed text-white/70">
            This interface does not welcome you. It does not accept narrative,
            intention, or approximation. You are currently outside the boundary
            of truth.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// --- ACT 2: INTERROGATION (Kinetic Expansion Rows, No Grids) ---
function InterrogationRows() {
  return (
    <section className="relative border-t border-white/10 bg-black pt-32 pb-20">
      <div className="mx-auto mb-20 max-w-[1680px] px-5 md:flex md:items-end md:justify-between md:px-16">
        <h2 className="text-[clamp(3rem,7vw,8rem)] leading-[0.8] font-black tracking-[-0.05em] uppercase">
          DOCTRINE IS
          <br />
          <span className="text-white/30">EXECUTED</span>
        </h2>
        <p className="mt-8 max-w-sm text-sm text-white/50 md:mt-0 md:text-right">
          Hover to inspect the system log.
        </p>
      </div>

      <div className="w-full border-t border-white/10">
        {VALIDATION_LOG.map((check) => (
          <motion.div
            key={check.id}
            initial="idle"
            whileHover="hover"
            className="group relative w-full cursor-crosshair overflow-hidden border-b border-white/10 transition-colors duration-500 hover:bg-white"
          >
            <div className="relative z-10 mx-auto flex max-w-[1680px] flex-col justify-between px-5 py-10 md:flex-row md:items-center md:px-16 md:py-16">
              <div className="flex items-center gap-8 md:gap-16">
                <span className="font-mono text-[10px] tracking-[0.4em] text-white/30 uppercase transition-colors group-hover:text-black/40 md:text-xs">
                  {check.id}
                </span>
                <h3 className="text-3xl font-black tracking-[-0.04em] text-white uppercase transition-colors group-hover:text-black md:text-6xl">
                  {check.label}
                </h3>
              </div>

              {/* Kinetic Reveal on Hover */}
              <div className="mt-6 flex flex-col gap-2 text-left md:mt-0 md:items-end md:text-right">
                <motion.div
                  variants={{
                    idle: { opacity: 0, height: 0, y: 10 },
                    hover: { opacity: 1, height: "auto", y: 0 },
                  }}
                  transition={{ duration: 0.4, ease: EASE_SMOOTH }}
                  className="max-w-md text-sm font-medium text-black/80 md:text-base"
                >
                  {check.note}
                </motion.div>
                <div className="border border-white/20 px-4 py-2 font-mono text-[10px] tracking-[0.3em] text-white uppercase transition-all group-hover:border-black group-hover:bg-black group-hover:text-white md:text-xs">
                  {check.status}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// --- ACT 3: FORCED CONVERGENCE ---
function ConvergenceEngine() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
  })

  const scaleDoc = useTransform(smoothProgress, [0, 0.3], [1, 0.8])
  const opacityDoc = useTransform(smoothProgress, [0, 0.3], [1, 0])
  const scaleEnt = useTransform(smoothProgress, [0.1, 0.5], [1, 0.8])
  const opacityEnt = useTransform(smoothProgress, [0.1, 0.5], [0.4, 0])
  const scaleEvent = useTransform(smoothProgress, [0.3, 0.7], [1, 0.8])
  const opacityEvent = useTransform(smoothProgress, [0.3, 0.7], [0.15, 0])
  const scaleCanon = useTransform(smoothProgress, [0.6, 1], [0.4, 1])
  const opacityCanon = useTransform(smoothProgress, [0.6, 1], [0, 1])
  const letterSpacingCanon = useTransform(
    smoothProgress,
    [0.6, 1],
    ["0.5em", "-0.05em"]
  )

  return (
    <section ref={containerRef} className="relative h-[350vh] bg-black">
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden">
        <div className="absolute top-12 font-mono text-[10px] tracking-[0.4em] text-white/30 uppercase">
          NexusCanon Chamber
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <motion.h2
            style={{ scale: scaleDoc, opacity: opacityDoc }}
            className="absolute text-[12vw] font-black text-white/80 uppercase"
          >
            DOCUMENT
          </motion.h2>
          <motion.h2
            style={{ scale: scaleEnt, opacity: opacityEnt }}
            className="absolute text-[15vw] font-black text-white/50 uppercase"
          >
            ENTITY
          </motion.h2>
          <motion.h2
            style={{ scale: scaleEvent, opacity: opacityEvent }}
            className="absolute text-[18vw] font-black text-white/20 uppercase"
          >
            EVENT
          </motion.h2>
          <motion.h2
            style={{
              scale: scaleCanon,
              opacity: opacityCanon,
              letterSpacing: letterSpacingCanon,
            }}
            className="absolute text-[22vw] leading-[0.8] font-black text-white uppercase"
          >
            CANON
          </motion.h2>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center">
          <div className="font-mono text-[10px] tracking-[0.4em] text-white/40 uppercase">
            Forced Alignment
          </div>
          <div className="mx-auto mt-4 h-24 w-px bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </div>
    </section>
  )
}

// --- ACT 4: FAILURE EXPOSURE (Sticky Stack, No Grids) ---
function FailureStack() {
  return (
    <section className="relative bg-black py-32 md:py-48">
      <div className="mx-auto max-w-[1680px] px-5 md:px-16">
        <div className="mb-32">
          <div className="mb-8 font-mono text-[10px] tracking-[0.4em] text-white/40 uppercase">
            System Autopsy
          </div>
          <h2 className="text-[clamp(3.5rem,7vw,8rem)] leading-[0.85] font-black tracking-[-0.04em] uppercase">
            WHERE ORDINARY
            <br />
            SYSTEMS BREAK
          </h2>
        </div>

        <div className="relative">
          {FAILURE_MODES.map((fail, index) => (
            <div
              key={fail.code}
              className="sticky top-20 pt-10 md:pt-20"
              style={{ zIndex: index }}
            >
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 0.8, ease: EASE_SMOOTH }}
                className="flex flex-col justify-between gap-10 border-t border-white/20 bg-[#0a0a0a] px-8 py-16 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] md:flex-row md:items-end md:p-24"
              >
                <div className="md:w-2/3">
                  <div className="mb-6 font-mono text-[10px] tracking-[0.4em] text-white/40 uppercase md:mb-10 md:text-sm">
                    ERROR LOG: {fail.code}
                  </div>
                  <h3 className="mb-6 text-4xl font-black tracking-[-0.03em] text-white/90 uppercase md:text-6xl">
                    {fail.title}
                  </h3>
                  <p className="max-w-2xl text-lg leading-relaxed text-white/50 md:text-2xl">
                    {fail.body}
                  </p>
                </div>

                <div className="pointer-events-none text-[8rem] leading-none font-black text-white/[0.03] select-none md:text-[14rem]">
                  {index + 1}
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- ACT 5: FINAL VERDICT ---
function FinalVerdict() {
  return (
    <section className="relative z-50 border-t border-white/10 bg-black px-5 pt-48 pb-32 md:px-16">
      <div className="mx-auto grid max-w-[1680px] grid-cols-1 items-end gap-20 md:grid-cols-12">
        <div className="md:col-span-7">
          <div className="mb-8 font-mono text-[10px] tracking-[0.4em] text-white/40 uppercase">
            Terminal Declaration
          </div>
          <h2 className="text-[clamp(3.5rem,8vw,9rem)] leading-[0.8] font-black tracking-[-0.05em] uppercase">
            CONTROL IS DENIED.
            <br />
            <span className="text-white/30">ONLY TRUTH PERSISTS.</span>
          </h2>
        </div>

        <div className="flex flex-col justify-end md:col-span-5">
          <p className="mb-10 max-w-md text-lg text-white/60">
            Entry is not exploration. It is protocol. Submit to system law or
            remain unverified.
          </p>

          <Link
            to="/marketing/flagship"
            className="group relative block w-full overflow-hidden border border-white/20 bg-black"
          >
            <div className="absolute inset-0 z-0 origin-left scale-x-0 bg-white transition-transform duration-700 ease-[cubic-bezier(0.86,0,0.07,1)] group-hover:scale-x-100" />

            <div className="relative z-10 flex items-center justify-between p-8 transition-colors duration-500 group-hover:text-black">
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] tracking-[0.4em] uppercase opacity-50 group-hover:opacity-60">
                  Verdict
                </span>
                <span className="text-xl font-bold tracking-[-0.02em] uppercase">
                  Initialize Protocol
                </span>
              </div>
              <ArrowRight className="h-6 w-6 -translate-x-4 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}

// --- MAIN PAGE ASSEMBLY ---
export default function MonumentLandingPage() {
  const [booting, setBooting] = useState(true)

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-black font-sans text-white selection:bg-white selection:text-black">
      <AnimatePresence>
        {booting && <BootSequence onComplete={() => setBooting(false)} />}
      </AnimatePresence>

      {!booting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <AmbientMonolith />
          <SystemActivation />
          <InterrogationRows />
          <ConvergenceEngine />
          <FailureStack />
          <FinalVerdict />
        </motion.div>
      )}
    </div>
  )
}
