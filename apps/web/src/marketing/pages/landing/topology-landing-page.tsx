import { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { CameraControls, type CameraControlsImpl } from "@react-three/drei"
import { AnimatePresence, motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

/**
 * AFENDA // MARKETING CINEMATIC LANDING
 *
 * Purpose:
 * - One-time opening impression for the marketing landing page.
 * - No fake terminal ritual, no user learning curve, no exploratory system behavior.
 * - A restrained black-and-white architectural reveal followed by one clear exit.
 *
 * Experience:
 * - Void → origin → reveal → lock → declaration → CTA.
 * - Subtle active cues only: breathing crosshair, quiet AFENDA // ACTIVE inscription,
 *   and faint pre-reveal structural presence.
 */

type Stage = "void" | "origin" | "reveal" | "lock" | "message" | "cta"

const FIELD_NODE_COUNT = 2200
const AXIS_NODE_COUNT = 240
const MONUMENT_COUNT = 12
const BELT_NODE_COUNT = 640
const FRACTURE_NODE_COUNT = 720
const REVEAL_CAMERA = new THREE.Vector3(0, 10, 156)
const LOCK_CAMERA = new THREE.Vector3(0, 12, 138)
const WHITE = new THREE.Color("#ffffff")

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function jitter(scale: number) {
  return (Math.random() - 0.5) * scale
}

function createAxialPositions(count: number) {
  const positions = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const t = i / Math.max(1, count - 1)
    const y = THREE.MathUtils.lerp(-82, 82, t)
    const x = Math.sin(t * Math.PI * 4.5) * 2.4 + jitter(5)
    const z = Math.cos(t * Math.PI * 3.25) * 2.1 + jitter(5)

    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z
  }

  return positions
}

function createBeltPositions(count: number) {
  const positions = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const theta = (i / count) * Math.PI * 2
    const band = i % 3
    const radiusX = band === 0 ? 74 : band === 1 ? 82 : 91
    const radiusZ = band === 0 ? 48 : band === 1 ? 56 : 64
    const layerY = band === 0 ? -14 : band === 1 ? 0 : 14

    positions[i * 3] = Math.cos(theta) * (radiusX + jitter(7))
    positions[i * 3 + 1] = layerY + jitter(10)
    positions[i * 3 + 2] = Math.sin(theta) * (radiusZ + jitter(7))
  }

  return positions
}

function createFracturePositions(count: number) {
  const positions = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const side = i % 2 === 0 ? -1 : 1
    const x = rand(-72, 72)
    const y = side * (18 + jitter(8)) + Math.sin(x * 0.06) * 6
    const z = x * 0.22 + jitter(18)

    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z
  }

  return positions
}

function createMonumentPositions(count: number) {
  const positions = new Float32Array(count * 3)
  const seeds = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-54, -24, 22),
    new THREE.Vector3(56, 28, -18),
    new THREE.Vector3(-70, 14, -26),
    new THREE.Vector3(66, -20, 28),
    new THREE.Vector3(0, 62, -12),
    new THREE.Vector3(0, -66, 14),
  ]

  for (let i = 0; i < count; i++) {
    const seed = seeds[i % seeds.length]
    positions[i * 3] = seed.x + jitter(6)
    positions[i * 3 + 1] = seed.y + jitter(6)
    positions[i * 3 + 2] = seed.z + jitter(6)
  }

  return positions
}

function mergeFloat32Arrays(arrays: Float32Array[]) {
  const totalLength = arrays.reduce((sum, array) => sum + array.length, 0)
  const merged = new Float32Array(totalLength)

  let offset = 0
  for (const array of arrays) {
    merged.set(array, offset)
    offset += array.length
  }

  return merged
}

function createFieldPositions() {
  const field = mergeFloat32Arrays([
    createAxialPositions(840),
    createBeltPositions(BELT_NODE_COUNT),
    createFracturePositions(FRACTURE_NODE_COUNT),
  ])

  return field.slice(0, FIELD_NODE_COUNT * 3)
}

function buildConnections(
  anchorPositions: Float32Array,
  monumentPositions: Float32Array
) {
  const connections: Array<{
    start: THREE.Vector3
    end: THREE.Vector3
    opacity: number
  }> = []

  for (let i = 0; i < anchorPositions.length / 3; i += 6) {
    const start = new THREE.Vector3(
      anchorPositions[i * 3],
      anchorPositions[i * 3 + 1],
      anchorPositions[i * 3 + 2]
    )
    const end = new THREE.Vector3(
      start.x * 0.16,
      start.y * 0.92,
      start.z * 0.16
    )
    connections.push({ start, end, opacity: 0.14 })
  }

  for (let i = 0; i < monumentPositions.length / 3; i++) {
    const start = new THREE.Vector3(
      monumentPositions[i * 3],
      monumentPositions[i * 3 + 1],
      monumentPositions[i * 3 + 2]
    )
    const end = new THREE.Vector3(
      start.x * 0.28,
      start.y * 0.42,
      start.z * 0.28
    )
    connections.push({ start, end, opacity: 0.18 })
  }

  return connections
}

function useStageTimeline(setStage: (stage: Stage) => void) {
  useEffect(() => {
    const t1 = setTimeout(() => setStage("origin"), 700)
    const t2 = setTimeout(() => setStage("reveal"), 1900)
    const t3 = setTimeout(() => setStage("lock"), 4800)
    const t4 = setTimeout(() => setStage("message"), 5200)
    const t5 = setTimeout(() => setStage("cta"), 6400)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
    }
  }, [setStage])
}

export default function AfendaLandingCinematic() {
  const [stage, setStage] = useState<Stage>("void")
  const navigate = useNavigate()

  useStageTimeline(setStage)

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-black text-white selection:bg-white selection:text-black">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 36, near: 0.1, far: 420 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 1.75]}
        className="absolute inset-0 z-0"
      >
        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#000000", 92, 240]} />
        <ambientLight intensity={0.2} />
        <LandingScene stage={stage} />
      </Canvas>

      <LandingOverlay stage={stage} onEnter={() => navigate("/platform")} />
    </div>
  )
}

function LandingScene({ stage }: { stage: Stage }) {
  return (
    <>
      <SceneCamera stage={stage} />
      <OriginCrosshair stage={stage} />
      <TopologyArchitecture stage={stage} />
    </>
  )
}

function SceneCamera({ stage }: { stage: Stage }) {
  const controlsRef = useRef<CameraControlsImpl | null>(null)

  useEffect(() => {
    if (!controlsRef.current) return

    controlsRef.current.setLookAt(0, 0, 6, 0, 0, 0, false)

    if (stage === "reveal") {
      controlsRef.current.setLookAt(
        REVEAL_CAMERA.x,
        REVEAL_CAMERA.y,
        REVEAL_CAMERA.z,
        0,
        0,
        0,
        true
      )
    }

    if (stage === "lock" || stage === "message" || stage === "cta") {
      controlsRef.current.setLookAt(
        LOCK_CAMERA.x,
        LOCK_CAMERA.y,
        LOCK_CAMERA.z,
        0,
        0,
        0,
        true
      )
    }
  }, [stage])

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      smoothTime={1.15}
      minDistance={30}
      maxDistance={240}
      dollySpeed={0}
      truckSpeed={0}
      azimuthRotateSpeed={0}
      polarRotateSpeed={0}
      mouseButtons={{ left: 0, middle: 0, right: 0, wheel: 0 }}
      touches={{ one: 0, two: 0, three: 0 }}
    />
  )
}

function OriginCrosshair({ stage }: { stage: Stage }) {
  const xMaterialRef = useRef<THREE.LineBasicMaterial>(null)
  const yMaterialRef = useRef<THREE.LineBasicMaterial>(null)
  const centerRef = useRef<THREE.Mesh>(null)

  const xPoints = useMemo(
    () => [new THREE.Vector3(-5, 0, 0), new THREE.Vector3(5, 0, 0)],
    []
  )
  const yPoints = useMemo(
    () => [new THREE.Vector3(0, -5, 0), new THREE.Vector3(0, 5, 0)],
    []
  )

  useFrame(({ clock }) => {
    if (stage === "void") return

    const t = clock.getElapsedTime()
    const pulse = 0.32 + Math.sin(t * 1.7) * 0.05
    const centerScale = 1 + Math.sin(t * 1.7) * 0.04

    if (xMaterialRef.current) xMaterialRef.current.opacity = pulse
    if (yMaterialRef.current) yMaterialRef.current.opacity = pulse
    if (centerRef.current) {
      centerRef.current.scale.setScalar(centerScale)
      ;(centerRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.54 + Math.sin(t * 1.7) * 0.06
    }
  })

  if (stage === "void") return null

  return (
    <group>
      <line>
        <bufferGeometry attach="geometry" setFromPoints={xPoints} />
        <lineBasicMaterial
          ref={xMaterialRef}
          color={WHITE}
          transparent
          opacity={0.32}
        />
      </line>
      <line>
        <bufferGeometry attach="geometry" setFromPoints={yPoints} />
        <lineBasicMaterial
          ref={yMaterialRef}
          color={WHITE}
          transparent
          opacity={0.32}
        />
      </line>
      <mesh ref={centerRef}>
        <circleGeometry args={[0.12, 16]} />
        <meshBasicMaterial color={WHITE} transparent opacity={0.54} />
      </mesh>
    </group>
  )
}

function TopologyArchitecture({ stage }: { stage: Stage }) {
  const rootRef = useRef<THREE.Group>(null)

  const fieldPositions = useMemo(() => createFieldPositions(), [])
  const anchorPositions = useMemo(
    () => createAxialPositions(AXIS_NODE_COUNT),
    []
  )
  const monumentPositions = useMemo(
    () => createMonumentPositions(MONUMENT_COUNT),
    []
  )
  const connections = useMemo(
    () => buildConnections(anchorPositions, monumentPositions),
    [anchorPositions, monumentPositions]
  )

  useFrame(({ clock }, delta) => {
    if (!rootRef.current) return

    if (stage === "lock" || stage === "message" || stage === "cta") {
      rootRef.current.rotation.y += delta * 0.0022
      rootRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.18) * 0.9
    }
  })

  return (
    <group ref={rootRef} visible={stage !== "void"}>
      <GuidePlanes stage={stage} />
      <StructuralLines stage={stage} connections={connections} />
      <FieldPoints
        stage={stage}
        positions={fieldPositions}
        size={0.42}
        kind="field"
      />
      <FieldPoints
        stage={stage}
        positions={anchorPositions}
        size={1.05}
        kind="anchor"
      />
      <MonumentSteles stage={stage} positions={monumentPositions} />
    </group>
  )
}

function FieldPoints({
  stage,
  positions,
  size,
  kind,
}: {
  stage: Stage
  positions: Float32Array
  size: number
  kind: "field" | "anchor"
}) {
  const pointsRef = useRef<THREE.Points>(null)
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return

    const material = pointsRef.current.material as THREE.PointsMaterial
    const t = clock.getElapsedTime()

    let targetOpacity = 0

    if (stage === "origin") {
      targetOpacity = kind === "field" ? 0.04 : 0.08
    } else if (stage === "reveal") {
      targetOpacity = kind === "field" ? 0.16 : 0.34
    } else if (stage === "lock" || stage === "message" || stage === "cta") {
      targetOpacity = kind === "field" ? 0.22 : 0.5
    }

    if (kind === "anchor") {
      targetOpacity += Math.sin(t * 0.8) * 0.015
    }

    material.opacity = THREE.MathUtils.lerp(
      material.opacity,
      targetOpacity,
      0.06
    )
  })

  if (stage === "void") return null

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        color={WHITE}
        size={size}
        sizeAttenuation
        transparent
        opacity={0}
        depthWrite={false}
      />
    </points>
  )
}

function MonumentSteles({
  stage,
  positions,
}: {
  stage: Stage
  positions: Float32Array
}) {
  const groupRef = useRef<THREE.Group>(null)
  const materialRefs = useRef<THREE.MeshBasicMaterial[]>([])

  const monuments = useMemo(() => {
    return Array.from({ length: positions.length / 3 }, (_, index) => ({
      position: [
        positions[index * 3],
        positions[index * 3 + 1],
        positions[index * 3 + 2],
      ] as [number, number, number],
      scale:
        index % 3 === 0
          ? ([0.85, 7.4, 0.85] as [number, number, number])
          : index % 3 === 1
            ? ([0.44, 4.8, 0.44] as [number, number, number])
            : ([1.2, 2.8, 1.2] as [number, number, number]),
    }))
  }, [positions])

  useFrame(({ clock }, delta) => {
    if (
      groupRef.current &&
      (stage === "lock" || stage === "message" || stage === "cta")
    ) {
      groupRef.current.rotation.y += delta * 0.0018
    }

    const t = clock.getElapsedTime()
    const targetOpacity =
      stage === "reveal"
        ? 0.3
        : stage === "lock" || stage === "message" || stage === "cta"
          ? 0.62
          : 0

    for (let i = 0; i < materialRefs.current.length; i++) {
      const material = materialRefs.current[i]
      if (!material) continue
      const flicker = i % 4 === 0 ? Math.sin(t * 0.7 + i) * 0.04 : 0
      material.opacity = THREE.MathUtils.lerp(
        material.opacity,
        targetOpacity + flicker,
        0.05
      )
    }
  })

  if (stage === "void" || stage === "origin") return null

  return (
    <group ref={groupRef}>
      {monuments.map((monument, index) => (
        <mesh key={index} position={monument.position} scale={monument.scale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            ref={(node) => {
              if (node) materialRefs.current[index] = node
            }}
            color={WHITE}
            transparent
            opacity={0}
          />
        </mesh>
      ))}
    </group>
  )
}

function StructuralLines({
  stage,
  connections,
}: {
  stage: Stage
  connections: Array<{
    start: THREE.Vector3
    end: THREE.Vector3
    opacity: number
  }>
}) {
  const materialRefs = useRef<THREE.LineBasicMaterial[]>([])

  useFrame(() => {
    const targetOpacity =
      stage === "reveal"
        ? 0.08
        : stage === "lock" || stage === "message" || stage === "cta"
          ? 0.14
          : 0

    for (let i = 0; i < materialRefs.current.length; i++) {
      const material = materialRefs.current[i]
      if (!material) continue
      material.opacity = THREE.MathUtils.lerp(
        material.opacity,
        targetOpacity,
        0.05
      )
    }
  })

  if (stage === "void" || stage === "origin") return null

  return (
    <group>
      {connections.map((connection, index) => {
        const points = [connection.start, connection.end]
        return (
          <line key={index}>
            <bufferGeometry attach="geometry" setFromPoints={points} />
            <lineBasicMaterial
              ref={(node) => {
                if (node) materialRefs.current[index] = node
              }}
              color={WHITE}
              transparent
              opacity={0}
            />
          </line>
        )
      })}
    </group>
  )
}

function GuidePlanes({ stage }: { stage: Stage }) {
  const groupRef = useRef<THREE.Group>(null)
  const materialsRef = useRef<THREE.MeshBasicMaterial[]>([])

  const planes = useMemo(
    () => [
      {
        position: [0, 0, -4] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        size: [232, 176] as [number, number],
      },
      {
        position: [-16, 8, 0] as [number, number, number],
        rotation: [0, Math.PI / 2.8, 0] as [number, number, number],
        size: [206, 158] as [number, number],
      },
      {
        position: [20, -12, 8] as [number, number, number],
        rotation: [Math.PI / 2.9, Math.PI / 5.4, 0] as [number, number, number],
        size: [182, 136] as [number, number],
      },
    ],
    []
  )

  useFrame((_state, delta) => {
    if (
      groupRef.current &&
      (stage === "lock" || stage === "message" || stage === "cta")
    ) {
      groupRef.current.rotation.y += delta * 0.001
    }

    const targetOpacity =
      stage === "reveal"
        ? 0.008
        : stage === "lock" || stage === "message" || stage === "cta"
          ? 0.02
          : 0

    for (let i = 0; i < materialsRef.current.length; i++) {
      const material = materialsRef.current[i]
      if (!material) continue
      material.opacity = THREE.MathUtils.lerp(
        material.opacity,
        targetOpacity,
        0.04
      )
    }
  })

  if (stage === "void" || stage === "origin") return null

  return (
    <group ref={groupRef}>
      {planes.map((plane, index) => (
        <mesh key={index} position={plane.position} rotation={plane.rotation}>
          <planeGeometry args={plane.size} />
          <meshBasicMaterial
            ref={(node) => {
              if (node) materialsRef.current[index] = node
            }}
            color={WHITE}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

function LandingOverlay({
  stage,
  onEnter,
}: {
  stage: Stage
  onEnter: () => void
}) {
  const showActiveInscription = stage !== "void"
  const showCoordinate =
    stage === "origin" || stage === "reveal" || stage === "lock"
  const showMessage = stage === "message" || stage === "cta"
  const showCta = stage === "cta"

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      <AnimatePresence>
        {showActiveInscription ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute top-6 left-6 font-mono text-[10px] tracking-[0.28em] text-white/28 uppercase sm:top-8 sm:left-8"
          >
            AFENDA // ACTIVE
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showCoordinate ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%-56px)] font-mono text-[9px] tracking-[0.42em] text-white/36 uppercase"
          >
            [0.000 / 0.000 / 0.000]
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="absolute inset-0 flex items-center justify-center px-6">
        <AnimatePresence>
          {showMessage ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="max-w-xl text-center"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="font-mono text-[11px] tracking-[0.42em] text-white/62 uppercase"
              >
                AFENDA
              </motion.p>

              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.24, duration: 0.95, ease: "easeOut" }}
                className="mt-5 text-2xl leading-[1.4] text-balance text-white/92 sm:text-3xl"
              >
                Truth is not reported.
                <br />
                It is constructed.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.42, duration: 0.95, ease: "easeOut" }}
                className="mx-auto mt-7 max-w-lg text-sm leading-7 text-white/62 sm:text-[15px]"
              >
                Every number has a cause.
                <br />
                Every change has a trace.
                <br />
                Every outcome can be proven.
              </motion.p>

              {showCta ? (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.28, duration: 0.85, ease: "easeOut" }}
                  onClick={onEnter}
                  className="pointer-events-auto mt-10 inline-flex items-center justify-center border border-white/22 px-6 py-3 font-mono text-[11px] tracking-[0.34em] text-white/90 uppercase transition hover:border-white/55 hover:bg-white hover:text-black"
                >
                  Enter the Machine
                </motion.button>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}
