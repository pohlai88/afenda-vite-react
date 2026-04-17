/**
 * AFENDA // BEASTMODE
 * B&W as pure artistic expression.
 * Breaking every rule. Making new ones.
 */

import { useEffect, useState, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMouse = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };
    window.addEventListener("mousemove", updateMouse);
    return () => window.removeEventListener("mousemove", updateMouse);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative bg-white text-black overflow-x-hidden selection:bg-black selection:text-white"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* Optical Moiré Background */}
      <MoireBackground mouseX={mousePos.x} mouseY={mousePos.y} />

      {/* Giant Cursor Trail */}
      <CursorBlob x={mousePos.x} y={mousePos.y} />

      <main className="relative z-10">
        <HeroExplosion scrollProgress={scrollYProgress} />
        <TruthVoid />
        <TypographicMassacre />
        <TheAbyss />
        <InvertedReality />
        <FinalReckoning />
      </main>
    </div>
  );
}

// --------------------------------------------------------
// MOIRÉ PATTERN (Optical illusion background)
// --------------------------------------------------------
function MoireBackground({ mouseX, mouseY }: { mouseX: number, mouseY: number }) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.08]">
      <div
        className="absolute inset-0 transition-transform duration-1000 ease-out"
        style={{
          transform: `translate(${mouseX * 0.5 - 25}px, ${mouseY * 0.5 - 25}px)`,
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              black 2px,
              black 4px
            )
          `,
        }}
      />
      <div
        className="absolute inset-0 transition-transform duration-1000 ease-out"
        style={{
          transform: `translate(${-mouseX * 0.3 + 15}px, ${-mouseY * 0.3 + 15}px)`,
          backgroundImage: `
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 2px,
              black 2px,
              black 4px
            )
          `,
        }}
      />
    </div>
  );
}

// --------------------------------------------------------
// CURSOR BLOB (Giant interactive element)
// --------------------------------------------------------
function CursorBlob({ x, y }: { x: number, y: number }) {
  return (
    <div
      className="fixed top-0 left-0 w-screen h-screen z-5 pointer-events-none mix-blend-difference"
      style={{
        background: `radial-gradient(circle at ${x}% ${y}%, white 0%, transparent 20%)`,
        opacity: 0.15,
      }}
    />
  );
}

// --------------------------------------------------------
// HERO EXPLOSION (Typography deconstructed)
// --------------------------------------------------------
function HeroExplosion({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  const letterSpacing = useTransform(scrollProgress, [0, 0.2], ['0em', '0.8em']);
  const letterOpacity = useTransform(scrollProgress, [0, 0.15, 0.25], [1, 1, 0]);
  const scaleOut = useTransform(scrollProgress, [0, 0.25], [1, 1.8]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Background giant A */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
        style={{ scale: useTransform(scrollProgress, [0, 0.3], [1, 2.5]), opacity: useTransform(scrollProgress, [0, 0.2], [0.03, 0]) }}
      >
        <div className="text-[80vw] leading-none" style={{ fontWeight: 900 }}>A</div>
      </motion.div>

      <motion.div
        className="relative z-10 px-6 text-center"
        style={{
          scale: scaleOut,
          opacity: letterOpacity,
        }}
      >
        {/* Exploding letters */}
        <motion.h1
          className="text-[clamp(4rem,20vw,20rem)] leading-[0.8] tracking-tighter mb-16"
          style={{
            fontWeight: 900,
            letterSpacing: letterSpacing,
          }}
        >
          AFENDA
        </motion.h1>

        <motion.div
          className="overflow-hidden"
          style={{ opacity: useTransform(scrollProgress, [0, 0.1], [1, 0]) }}
        >
          <div className="flex items-center justify-center gap-4 text-xs tracking-[0.3em]">
            <span className="inline-block w-12 h-px bg-black" />
            <span>THE TRUTH ENGINE</span>
            <span className="inline-block w-12 h-px bg-black" />
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-xs tracking-[0.3em]"
        style={{ opacity: useTransform(scrollProgress, [0, 0.05], [1, 0]) }}
      >
        <div className="flex flex-col items-center gap-3">
          <span>SCROLL</span>
          <div className="w-px h-16 bg-black animate-pulse" />
        </div>
      </motion.div>
    </section>
  );
}

// --------------------------------------------------------
// TRUTH VOID (Black mass section)
// --------------------------------------------------------
function TruthVoid() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const blackMassScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const textReveal = useTransform(scrollYProgress, [0.3, 0.6], [0, 1]);

  return (
    <section ref={ref} className="relative min-h-screen bg-black text-white overflow-hidden">

      {/* Expanding black circle */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] rounded-full bg-black border-2 border-white"
        style={{ scale: blackMassScale }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <motion.div className="max-w-5xl" style={{ opacity: textReveal }}>

          <div className="mb-20">
            <div className="text-sm tracking-[0.5em] mb-8 opacity-40">PRINCIPLE 001</div>
            <h2 className="text-[clamp(3rem,12vw,12rem)] leading-[0.8] mb-12" style={{ fontWeight: 300 }}>
              Assume
              <br />
              <span style={{ fontWeight: 900 }}>Nothing</span>
            </h2>
            <p className="text-2xl leading-relaxed max-w-3xl opacity-70" style={{ fontWeight: 300 }}>
              In the void of assumptions, truth crystallizes. Black is not absence—it is the foundation upon which certainty is built.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-8 border-t border-white/20 pt-12">
            {[
              { num: '0', label: 'Assumptions' },
              { num: '∞', label: 'Precision' },
              { num: '1', label: 'Truth' },
            ].map((stat, i) => (
              <div key={i} className="border-l-2 border-white/30 pl-6">
                <div className="text-7xl mb-3" style={{ fontWeight: 100 }}>{stat.num}</div>
                <div className="text-xs tracking-[0.3em] opacity-40">{stat.label}</div>
              </div>
            ))}
          </div>

        </motion.div>
      </div>
    </section>
  );
}

// --------------------------------------------------------
// TYPOGRAPHIC MASSACRE (Extreme scale jumps)
// --------------------------------------------------------
function TypographicMassacre() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const rotate = useTransform(scrollYProgress, [0, 1], [-5, 5]);

  return (
    <section ref={ref} className="relative bg-white text-black py-48 overflow-hidden">

      {/* Giant rotated text */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none opacity-5"
        style={{ rotate }}
      >
        <div className="text-[35vw] leading-none whitespace-nowrap" style={{ fontWeight: 900 }}>
          TRUTH TRUTH TRUTH
        </div>
      </motion.div>

      <div className="relative z-10 px-6 md:px-12 max-w-7xl mx-auto">

        <div className="grid lg:grid-cols-2 gap-24 items-start">

          {/* Left: Micro text */}
          <div>
            <div className="text-[8px] tracking-[0.5em] mb-16 opacity-30">
              BEYOND BORDERS / BEYOND ASSUMPTIONS / BEYOND DOUBT
            </div>

            <div className="space-y-12">
              {[
                'Transaction truth resolves to reality, not system artifacts.',
                'Reporting truth survives pressure, audit, and scrutiny.',
                'Enterprise truth maintains continuity across all entities.',
              ].map((text, i) => (
                <div key={i} className="border-l-4 border-black pl-6">
                  <div className="text-xs tracking-[0.2em] mb-2 opacity-30">
                    CHAMBER {String(i + 1).padStart(2, '0')}
                  </div>
                  <p className="text-base leading-relaxed" style={{ fontWeight: 300 }}>
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: MASSIVE text */}
          <div className="flex items-center justify-end">
            <div className="text-right">
              <div className="text-[clamp(6rem,20vw,20rem)] leading-[0.75]" style={{ fontWeight: 900 }}>
                01
              </div>
              <div className="text-2xl tracking-wider mt-6" style={{ fontWeight: 300 }}>
                Single source
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------
// THE ABYSS (Inverted section with depth)
// --------------------------------------------------------
function TheAbyss() {
  const words = ['POLARIS', 'BORDERS', 'CLARITY', 'TRUTH'];

  return (
    <section className="relative bg-black text-white py-32 overflow-hidden">

      {/* Stacked text creating depth */}
      <div className="relative px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {words.map((word, i) => (
            <motion.div
              key={word}
              className="text-[clamp(4rem,15vw,15rem)] leading-none tracking-tighter select-none"
              style={{
                fontWeight: 900,
                opacity: 0.03 + (i * 0.15),
                marginTop: i === 0 ? 0 : '-0.4em',
              }}
              initial={{ x: i % 2 === 0 ? -100 : 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 0.03 + (i * 0.15) }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: i * 0.1 }}
            >
              {word}
            </motion.div>
          ))}

          {/* Overlay content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-3xl">
              <h2 className="text-6xl mb-8 tracking-tight" style={{ fontWeight: 300 }}>
                The Glass Framework
              </h2>
              <p className="text-xl leading-relaxed opacity-60" style={{ fontWeight: 300 }}>
                Transparency isn't decoration. It's the visual manifestation of zero assumptions. Every layer, every datum, visible and verifiable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------
// INVERTED REALITY (Checkerboard chaos)
// --------------------------------------------------------
function InvertedReality() {
  const chambers = [
    { id: 'A', title: 'Transaction', truth: 'Reality over approximation' },
    { id: 'B', title: 'Reporting', truth: 'Evidence over assumption' },
    { id: 'C', title: 'Enterprise', truth: 'Continuity over drift' },
    { id: 'D', title: 'Polaris', truth: 'Direction over chaos' },
  ];

  return (
    <section className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {chambers.map((chamber, i) => {
          const isBlack = i % 2 === 0;

          return (
            <motion.div
              key={chamber.id}
              className={`relative aspect-square flex items-center justify-center overflow-hidden group cursor-pointer ${
                isBlack ? 'bg-black text-white' : 'bg-white text-black'
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ scale: 0.98 }}
            >
              {/* Background letter */}
              <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none opacity-5">
                <div className="text-[30vw] leading-none" style={{ fontWeight: 900 }}>
                  {chamber.id}
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10 text-center px-12">
                <div className={`text-sm tracking-[0.4em] mb-6 ${isBlack ? 'opacity-40' : 'opacity-30'}`}>
                  CHAMBER {chamber.id}
                </div>
                <h3 className="text-6xl mb-8 tracking-tight" style={{ fontWeight: 600 }}>
                  {chamber.title}
                </h3>
                <p className={`text-lg tracking-wide ${isBlack ? 'opacity-60' : 'opacity-50'}`} style={{ fontWeight: 300 }}>
                  {chamber.truth}
                </p>
              </div>

              {/* Hover effect: diagonal wipe */}
              <div className={`absolute inset-0 ${isBlack ? 'bg-white' : 'bg-black'} origin-bottom-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out`} />

              {/* Inverted text on hover */}
              <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isBlack ? 'text-black' : 'text-white'}`}>
                <div className="text-center px-12">
                  <div className="text-sm tracking-[0.4em] mb-6 opacity-40">
                    INVERTED
                  </div>
                  <div className="text-7xl" style={{ fontWeight: 900 }}>
                    {chamber.id}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

// --------------------------------------------------------
// FINAL RECKONING (The call to action)
// --------------------------------------------------------
function FinalReckoning() {
  return (
    <section className="relative min-h-screen bg-white text-black flex items-center justify-center overflow-hidden">

      {/* Radiating lines */}
      <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 100 100" preserveAspectRatio="none">
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * 360;
          return (
            <line
              key={i}
              x1="50"
              y1="50"
              x2={50 + Math.cos((angle * Math.PI) / 180) * 100}
              y2={50 + Math.sin((angle * Math.PI) / 180) * 100}
              stroke="black"
              strokeWidth="0.1"
            />
          );
        })}
      </svg>

      <div className="relative z-10 text-center px-6 max-w-5xl">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div className="text-xs tracking-[0.5em] mb-12 opacity-30">
            FINAL PROTOCOL
          </div>

          <h2 className="text-[clamp(4rem,15vw,15rem)] leading-[0.8] mb-16 tracking-tighter" style={{ fontWeight: 900 }}>
            ENTER
            <br />
            <span style={{ fontWeight: 100 }}>THE</span>
            <br />
            TRUTH
          </h2>

          <div className="flex flex-col items-center gap-8">
            <button type="button" className="group relative px-16 py-8 border-4 border-black overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-black"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: 'left' }}
              />
              <span className="relative z-10 flex items-center gap-4 text-xl tracking-[0.3em] group-hover:text-white transition-colors" style={{ fontWeight: 600 }}>
                INITIALIZE AFENDA
                <ArrowRight className="w-6 h-6" strokeWidth={2} />
              </span>
            </button>

            <p className="text-sm tracking-[0.3em] opacity-30">
              NO ASSUMPTIONS / NO BORDERS / NO DRIFT
            </p>
          </div>
        </motion.div>

      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs tracking-[0.4em] opacity-20">
        AFENDA © 2026
      </div>
    </section>
  );
}
