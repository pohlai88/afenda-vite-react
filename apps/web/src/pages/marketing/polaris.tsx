/**
 * THE POLARIS SINGULARITY
 * * An immersive, scroll-driven 3D experience using pure React and Framer Motion.
 * The user's scroll physicalizes the pain point: fragmented, chaotic data layers
 * snapping into absolute, blinding truth.
 */

import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from 'framer-motion';
import { ArrowRight, Hexagon, Fingerprint, Globe } from 'lucide-react';

export default function App() {
  const containerRef = useRef(null);

  // The container is 400vh tall, giving us a long "runway" to scroll.
  // The actual visual content is position: sticky, locking to the viewport.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Apply a spring to the scroll progress so the 3D movements feel heavy and physical, not linear.
  const smoothProgress = useSpring(scrollYProgress, { damping: 20, stiffness: 100 });

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-black text-white selection:bg-blue-500/30">

      {/* The Sticky Cinematic Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center perspective-distant">

        <AmbientEnvironment progress={smoothProgress} />
        <TheDataCore progress={smoothProgress} />
        <NarrativeOverlays progress={smoothProgress} />

      </div>
    </div>
  );
}

// --------------------------------------------------------
// 1. THE 3D DATA CORE (The visual engine)
// --------------------------------------------------------
function TheDataCore({ progress }: { progress: MotionValue<number> }) {
  // At progress 0: Layers are spread out on the Z/Y axis, rotated chaotically.
  // At progress 0.6: Everything snaps perfectly to 0. (The Truth)
  // At progress 0.8: Core scales up to consume the screen.

  const coreScale = useTransform(progress, [0, 0.6, 0.8, 1], [0.5, 1, 1.2, 2.5]);
  const coreRotateX = useTransform(progress, [0, 0.6, 0.9], [60, 0, -20]);

  return (
    <motion.div
      className="relative z-10 flex items-center justify-center w-full h-full"
      style={{ scale: coreScale, rotateX: coreRotateX, transformStyle: "preserve-3d" }}
    >
      {/* Central Pillar of Truth (Invisible at start, blinding at end) */}
      <motion.div
        className="absolute w-[2px] h-[800px] bg-white shadow-[0_0_100px_10px_rgba(59,130,246,1)]"
        style={{
          opacity: useTransform(progress, [0.4, 0.6], [0, 1]),
          scaleY: useTransform(progress, [0.4, 0.6], [0, 1])
        }}
      />

      {/* Fractured Data Rings */}
      <DataRing progress={progress} index={0} delayOffset={0} size={400} />
      <DataRing progress={progress} index={1} delayOffset={0.1} size={300} />
      <DataRing progress={progress} index={2} delayOffset={0.2} size={200} />
      <DataRing progress={progress} index={3} delayOffset={0.3} size={100} />
    </motion.div>
  );
}

function DataRing({
  progress,
  index,
  delayOffset: _delayOffset,
  size,
}: {
  progress: MotionValue<number>;
  index: number;
  delayOffset: number;
  size: number;
}) {
  // Each ring starts at a wildly different rotation and Z-depth.
  // They all converge precisely at scroll progress 0.6.
  const zStart = (index % 2 === 0 ? 1 : -1) * (400 + index * 100);
  const rotateStart = (index % 2 === 0 ? 1 : -1) * (180 + index * 45);

  const zTranslate = useTransform(progress, [0, 0.6], [zStart, 0]);
  const rotation = useTransform(progress, [0, 0.6], [rotateStart, 0]);
  const opacity = useTransform(progress, [0, 0.6, 0.8, 1], [0.3, 1, 0.2, 0]);
  const borderOpacity = useTransform(progress, [0, 0.5, 0.6], [0.2, 0.8, 1]);

  return (
    <motion.div
      className="absolute border border-white/20 rounded-full flex items-center justify-center"
      style={{
        width: size,
        height: size,
        z: zTranslate,
        rotateZ: rotation,
        opacity: opacity,
        borderColor: useTransform(borderOpacity, v => `rgba(255,255,255,${v})`),
        transformStyle: "preserve-3d"
      }}
    >
      {/* Nodes attached to the rings */}
      <div className="absolute top-0 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
      <div className="absolute bottom-0 translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
    </motion.div>
  );
}

// --------------------------------------------------------
// 2. NARRATIVE TYPOGRAPHY (Crossfading states)
// --------------------------------------------------------
function NarrativeOverlays({ progress }: { progress: MotionValue<number> }) {
  // Use scroll ranges to crossfade text without elements moving.
  // 0.0 - 0.2: Chaos
  // 0.4 - 0.6: Convergence
  // 0.8 - 1.0: Final CTA

  const chaosOp = useTransform(progress, [0, 0.1, 0.2, 0.3], [0, 1, 1, 0]);
  const convergeOp = useTransform(progress, [0.3, 0.4, 0.5, 0.6], [0, 1, 1, 0]);
  const finalOp = useTransform(progress, [0.7, 0.85, 1], [0, 1, 1]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-20 text-center px-6">

      {/* State 1: The Pain */}
      <motion.div style={{ opacity: chaosOp }} className="absolute">
        <h2 className="text-sm tracking-[0.5em] text-white/50 uppercase mb-4">Phase 1 / Fragmentation</h2>
        <p className="text-5xl md:text-7xl font-light tracking-tight">The truth is <br/><span className="text-red-500/80 italic font-medium">scattered.</span></p>
      </motion.div>

      {/* State 2: The Process */}
      <motion.div style={{ opacity: convergeOp }} className="absolute">
        <h2 className="text-sm tracking-[0.5em] text-white/50 uppercase mb-4">Phase 2 / Polaris Protocol</h2>
        <p className="text-5xl md:text-7xl font-light tracking-tight">Forces <span className="font-medium text-blue-400">align.</span></p>
      </motion.div>

      {/* State 3: The Resolution & CTA */}
      <motion.div style={{ opacity: finalOp, pointerEvents: "auto" }} className="absolute flex flex-col items-center">
        <div className="mb-12 flex gap-4 text-blue-400">
          <Fingerprint className="w-6 h-6" /> <Hexagon className="w-6 h-6" /> <Globe className="w-6 h-6" />
        </div>
        <h1 className="text-6xl md:text-8xl font-medium tracking-tighter mb-6 bg-clip-text text-transparent bg-linear-to-b from-white to-white/50">
          Assume Nothing.
        </h1>
        <p className="text-xl text-white/50 font-light mb-12 max-w-lg">
          Zero assumptions. Single source. Enter the borderless enterprise.
        </p>

        <button className="group relative px-8 py-4 bg-white text-black rounded-full overflow-hidden hover:scale-105 transition-all duration-500">
          <span className="relative z-10 flex items-center gap-3 text-sm font-bold tracking-widest">
            INITIALIZE WORKSPACE
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-linear-to-r from-blue-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </motion.div>

    </div>
  );
}

// --------------------------------------------------------
// 3. AMBIENT ENVIRONMENT (Lighting and atmosphere)
// --------------------------------------------------------
function AmbientEnvironment({ progress }: { progress: MotionValue<number> }) {
  // Background shifts from a distressed crimson/black to a pure, electric Polaris blue based on scroll.
  const bgOpacity = useTransform(progress, [0, 0.6], [0, 0.15]);
  const blurAmount = useTransform(progress, [0, 0.6], ["100px", "50px"]);

  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-neutral-900 via-black to-black" />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-screen rounded-full bg-blue-600 mix-blend-screen pointer-events-none"
        style={{ opacity: bgOpacity, filter: useTransform(blurAmount, v => `blur(${v})`) }}
      />
    </>
  );
}
