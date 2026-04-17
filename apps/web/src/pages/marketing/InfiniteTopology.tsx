/**
 * AFENDA // THE INFINITE TOPOLOGY
 * * Architecture: WebGL Canvas + React Three Fiber
 * Description: The user spawns at coordinate [0,0,0]. The DOM is stripped to a single
 * command prompt. Upon initialization, a hyperbolic camera pulls back to reveal an
 * InstancedMesh galaxy of the enterprise's financial truth.
 */

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react"
import { Link } from "react-router-dom"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import {
  CameraControls,
  CameraControlsImpl,
  Instance,
  Instances,
  Line,
} from "@react-three/drei"
import { AnimatePresence, motion } from "framer-motion"

// --------------------------------------------------------
// 1. DATA GENERATION (Simulating the TanStack Snapshot)
// --------------------------------------------------------
export const INFINITE_TOPOLOGY_NODE_COUNT = 3000
const RADIUS = 120

function generateTopologyData() {
  const positions = new Float32Array(INFINITE_TOPOLOGY_NODE_COUNT * 3)
  const connections: [THREE.Vector3, THREE.Vector3][] = []

  for (let i = 0; i < INFINITE_TOPOLOGY_NODE_COUNT; i++) {
    const u = Math.random()
    const v = Math.random()
    const theta = u * 2.0 * Math.PI
    const phi = Math.acos(2.0 * v - 1.0)
    const r = Math.cbrt(Math.random()) * RADIUS

    const x = r * Math.sin(phi) * Math.cos(theta)
    const y = r * Math.sin(phi) * Math.sin(theta)
    const z = r * Math.cos(phi)

    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z

    if (i > 0 && Math.random() > 0.85) {
      const prevIndex = Math.floor(Math.random() * i)
      connections.push([
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(
          positions[prevIndex * 3],
          positions[prevIndex * 3 + 1],
          positions[prevIndex * 3 + 2]
        ),
      ])
    }
  }
  return { positions, connections }
}

// --------------------------------------------------------
// 2. WEBGL COMPONENTS
// --------------------------------------------------------
function TopologyGalaxy({ initialized }: { initialized: boolean }) {
  const { positions, connections } = useMemo(() => generateTopologyData(), [])
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_state, delta) => {
    if (groupRef.current && initialized) {
      groupRef.current.rotation.y += delta * 0.02
      groupRef.current.rotation.z += delta * 0.01
    }
  })

  return (
    <group ref={groupRef} visible={initialized}>
      <Instances limit={INFINITE_TOPOLOGY_NODE_COUNT} range={INFINITE_TOPOLOGY_NODE_COUNT}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        {Array.from({ length: INFINITE_TOPOLOGY_NODE_COUNT }).map((_, i) => (
          <Instance
            key={i}
            position={[
              positions[i * 3],
              positions[i * 3 + 1],
              positions[i * 3 + 2],
            ]}
          />
        ))}
      </Instances>

      {connections.map((points, idx) => (
        <Line
          key={idx}
          points={points}
          color="#ffffff"
          lineWidth={1}
          transparent
          opacity={0.15}
        />
      ))}
    </group>
  )
}

function OriginCrosshair({ initialized }: { initialized: boolean }) {
  if (initialized) return null

  return (
    <group>
      <Line points={[[-5, 0, 0], [5, 0, 0]]} color="#ffffff" lineWidth={1} />
      <Line points={[[0, -5, 0], [0, 5, 0]]} color="#ffffff" lineWidth={1} />
    </group>
  )
}

function SceneController({ initialized }: { initialized: boolean }) {
  const cameraControlsRef = useRef<CameraControlsImpl | null>(null)

  useEffect(() => {
    if (initialized && cameraControlsRef.current) {
      cameraControlsRef.current.setLookAt(0, 0, 200, 0, 0, 0, true)
    }
  }, [initialized])

  return (
    <CameraControls
      ref={cameraControlsRef}
      makeDefault
      dollySpeed={2}
      minDistance={10}
      maxDistance={400}
      touches={{ one: 0, two: 0, three: 0 }}
    />
  )
}

// --------------------------------------------------------
// 3. MAIN APPLICATION & DOM LAYER
// --------------------------------------------------------
export default function AfendaWorkspace() {
  const [command, setCommand] = useState("")
  const [initialized, setInitialized] = useState(false)

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (command.trim().toUpperCase() === "INIT: GLOBAL_TOPOLOGY") {
        setInitialized(true)
      } else {
        setCommand("")
      }
    }
  }

  return (
    <div className="relative h-dvh w-full bg-[#000000] text-white font-sans overflow-hidden selection:bg-white selection:text-black">
      <nav
        className="absolute left-0 right-0 top-0 z-30 flex flex-wrap items-center justify-end gap-x-4 gap-y-2 px-4 py-4 font-mono text-[9px] uppercase tracking-[0.22em] pointer-events-auto"
        aria-label="Site"
      >
        <Link className="text-white/55 transition-colors hover:text-white" to="/">
          Home
        </Link>
        <Link className="text-white/55 transition-colors hover:text-white" to="/auth/login">
          Sign in
        </Link>
        <Link className="text-white/55 transition-colors hover:text-white" to="/auth/register">
          Register
        </Link>
      </nav>

      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.06] mix-blend-difference"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center">
        <AnimatePresence>
          {!initialized && (
            <motion.div
              exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: "easeIn" }}
              className="flex flex-col items-center pointer-events-auto"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/50 mb-4">
                Coordinate [0.000, 0.000, 0.000]
              </p>
              <div className="relative border-b border-white pb-2">
                <span className="absolute left-0 top-0 font-mono text-sm tracking-[0.2em]">
                  {">"}
                </span>
                <input
                  type="text"
                  autoFocus
                  spellCheck={false}
                  value={command}
                  onChange={(e) => setCommand(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyDown}
                  placeholder="AWAITING_COMMAND_"
                  aria-label="Topology command. Enter INIT: GLOBAL_TOPOLOGY to initialize."
                  className="bg-transparent text-white font-mono text-sm outline-none border-none pl-6 pr-4 w-[300px] uppercase tracking-[0.2em] placeholder:text-white/20"
                />
              </div>
              <p className="font-mono text-[8px] uppercase tracking-widest text-white/30 mt-4">
                Execute: INIT: GLOBAL_TOPOLOGY
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {initialized && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="absolute inset-0 p-8 pointer-events-none flex flex-col justify-between"
            >
              <header className="flex justify-between items-start w-full">
                <div>
                  <h1 className="font-mono text-[10px] uppercase tracking-[0.3em] font-bold mix-blend-difference">
                    Afenda // Core
                  </h1>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/50 mt-1">
                    SYS.ONLINE
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/50">
                    Live Nodes: {INFINITE_TOPOLOGY_NODE_COUNT.toLocaleString()}
                  </p>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-[#4ade80] mt-1">
                    WebSockets Connected
                  </p>
                </div>
              </header>

              <footer className="font-mono text-[9px] uppercase tracking-widest text-white/30 text-center">
                Scroll to traverse spatial data. Click and drag to pivot axis.
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        className="absolute inset-0 z-0"
      >
        <color attach="background" args={["#000000"]} />
        <SceneController initialized={initialized} />
        <OriginCrosshair initialized={initialized} />
        <TopologyGalaxy initialized={initialized} />
      </Canvas>
    </div>
  )
}
