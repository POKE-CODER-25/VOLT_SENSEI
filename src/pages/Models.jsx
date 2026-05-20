import { useState, useMemo, Suspense, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Float, MeshDistortMaterial, Sphere, Box, Torus, Center, Cylinder } from "@react-three/drei";
import { Search, Box as BoxIcon, Shapes, Layers, Play, Info, RotateCcw } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import * as THREE from "three";

// --- 3D Model Components ---

function Electron({ radius, speed, offset }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const angle = time * speed + offset;
    meshRef.current.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.2, Math.sin(angle) * radius);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={2} />
    </mesh>
  );
}

function AtomStructure({ nucleusColor, shells }) {
  return (
    <group>
      <Sphere args={[0.4, 32, 32]}>
        <meshStandardMaterial color={nucleusColor} emissive={nucleusColor} emissiveIntensity={0.5} />
      </Sphere>
      {shells.map((count, i) => {
        const radius = 1.2 + i * 0.8;
        return (
          <group key={i} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
            <Torus args={[radius, 0.01, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
              <meshBasicMaterial color="white" transparent opacity={0.1} />
            </Torus>
            {Array.from({ length: count }).map((_, j) => (
              <Electron key={j} radius={radius} speed={1 - i * 0.2} offset={(j * Math.PI * 2) / count} />
            ))}
          </group>
        );
      })}
    </group>
  );
}

function Bond({ start, end, double = false }) {
  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  const dir = new THREE.Vector3().subVectors(endVec, startVec);
  const len = dir.length();
  const mid = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
  
  return (
    <group position={mid} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())}>
      {double ? (
        <>
          <Cylinder args={[0.04, 0.04, len]} position={[0.1, 0, 0]}>
            <meshStandardMaterial color="#64748b" />
          </Cylinder>
          <Cylinder args={[0.04, 0.04, len]} position={[-0.1, 0, 0]}>
            <meshStandardMaterial color="#64748b" />
          </Cylinder>
        </>
      ) : (
        <Cylinder args={[0.05, 0.05, len]}>
          <meshStandardMaterial color="#64748b" />
        </Cylinder>
      )}
    </group>
  );
}

function Molecule({ atoms, bonds }) {
  return (
    <group>
      {atoms.map((atom, i) => (
        <mesh key={i} position={atom.pos}>
          <sphereGeometry args={[atom.size || 0.4, 32, 32]} />
          <meshStandardMaterial color={atom.color} />
        </mesh>
      ))}
      {bonds.map((bond, i) => (
        <Bond key={i} start={bond.start} end={bond.end} double={bond.double} />
      ))}
    </group>
  );
}

// --- Specific Chemistry Models ---

const WaterModel = () => (
  <Molecule 
    atoms={[
      { pos: [0, 0, 0], color: "#ef4444", size: 0.5 }, // O
      { pos: [0.7, 0.6, 0], color: "#ffffff", size: 0.3 }, // H
      { pos: [-0.7, 0.6, 0], color: "#ffffff", size: 0.3 }, // H
    ]}
    bonds={[
      { start: [0, 0, 0], end: [0.7, 0.6, 0] },
      { start: [0, 0, 0], end: [-0.7, 0.6, 0] },
    ]}
  />
);

const OxygenModel = () => (
  <Molecule 
    atoms={[
      { pos: [-0.8, 0, 0], color: "#ef4444", size: 0.5 },
      { pos: [0.8, 0, 0], color: "#ef4444", size: 0.5 },
    ]}
    bonds={[{ start: [-0.8, 0, 0], end: [0.8, 0, 0], double: true }]}
  />
);

const MethaneModel = () => (
  <Molecule 
    atoms={[
      { pos: [0, 0, 0], color: "#334155", size: 0.5 }, // C
      { pos: [1, 1, 1], color: "#ffffff", size: 0.3 },
      { pos: [-1, -1, 1], color: "#ffffff", size: 0.3 },
      { pos: [1, -1, -1], color: "#ffffff", size: 0.3 },
      { pos: [-1, 1, -1], color: "#ffffff", size: 0.3 },
    ]}
    bonds={[
      { start: [0, 0, 0], end: [1, 1, 1] },
      { start: [0, 0, 0], end: [-1, -1, 1] },
      { start: [0, 0, 0], end: [1, -1, -1] },
      { start: [0, 0, 0], end: [-1, 1, -1] },
    ]}
  />
);

const BenzeneModel = () => {
  const points = Array.from({ length: 6 }).map((_, i) => [
    Math.cos((i * Math.PI * 2) / 6) * 1.5,
    Math.sin((i * Math.PI * 2) / 6) * 1.5,
    0
  ]);
  const hPoints = Array.from({ length: 6 }).map((_, i) => [
    Math.cos((i * Math.PI * 2) / 6) * 2.3,
    Math.sin((i * Math.PI * 2) / 6) * 2.3,
    0
  ]);
  
  return (
    <Molecule 
      atoms={[
        ...points.map(p => ({ pos: p, color: "#334155", size: 0.4 })),
        ...hPoints.map(p => ({ pos: p, color: "#ffffff", size: 0.2 })),
      ]}
      bonds={[
        ...points.map((p, i) => ({ 
          start: p, 
          end: points[(i + 1) % 6], 
          double: i % 2 === 0 
        })),
        ...points.map((p, i) => ({ start: p, end: hPoints[i] })),
      ]}
    />
  );
};

const DNAHelixModel = () => {
  const points = Array.from({ length: 20 }).map((_, i) => {
    const angle = i * 0.8;
    const y = i * 0.4 - 4;
    return {
      p1: [Math.cos(angle) * 1.5, y, Math.sin(angle) * 1.5],
      p2: [Math.cos(angle + Math.PI) * 1.5, y, Math.sin(angle + Math.PI) * 1.5]
    };
  });

  return (
    <group>
      {points.map((p, i) => (
        <group key={i}>
          <mesh position={p.p1}><sphereGeometry args={[0.2, 16, 16]} /><meshStandardMaterial color="#3b82f6" /></mesh>
          <mesh position={p.p2}><sphereGeometry args={[0.2, 16, 16]} /><meshStandardMaterial color="#ef4444" /></mesh>
          {i % 2 === 0 && <Bond start={p.p1} end={p.p2} />}
        </group>
      ))}
    </group>
  );
};

const CrystalLatticeModel = () => (
  <group>
    {Array.from({ length: 3 }).map((_, x) => 
      Array.from({ length: 3 }).map((_, y) => 
        Array.from({ length: 3 }).map((_, z) => (
          <mesh key={`${x}${y}${z}`} position={[x - 1, y - 1, z - 1]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
        ))
      )
    )}
  </group>
);

const NaClModel = () => (
  <group>
    {Array.from({ length: 3 }).map((_, x) => 
      Array.from({ length: 3 }).map((_, y) => 
        Array.from({ length: 3 }).map((_, z) => {
          const isNa = (x + y + z) % 2 === 0;
          return (
            <mesh key={`${x}${y}${z}`} position={[(x - 1) * 1.2, (y - 1) * 1.2, (z - 1) * 1.2]}>
              <sphereGeometry args={[isNa ? 0.2 : 0.35, 32, 32]} />
              <meshStandardMaterial color={isNa ? "#818cf8" : "#4ade80"} />
            </mesh>
          );
        })
      )
    )}
  </group>
);

const CO2Model = () => (
  <Molecule 
    atoms={[
      { pos: [0, 0, 0], color: "#334155", size: 0.5 }, // C
      { pos: [1.2, 0, 0], color: "#ef4444", size: 0.5 }, // O
      { pos: [-1.2, 0, 0], color: "#ef4444", size: 0.5 }, // O
    ]}
    bonds={[
      { start: [0, 0, 0], end: [1.2, 0, 0], double: true },
      { start: [0, 0, 0], end: [-1.2, 0, 0], double: true },
    ]}
  />
);

// --- Specific Physics Models ---

function ElectricCircuitModel() {
  const electronCount = 20;
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.05, 16, 100]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <Box args={[0.8, 1, 0.5]} position={[0, 0, 2.5]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#ef4444" />
      </Box>
      {Array.from({ length: electronCount }).map((_, i) => (
        <MovingElectron key={i} radius={2.5} speed={1} offset={(i * Math.PI * 2) / electronCount} />
      ))}
    </group>
  );
}

function MovingElectron({ radius, speed, offset }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() * speed + offset;
    ref.current.position.set(Math.cos(t) * radius, 0, Math.sin(t) * radius);
  });
  return <Sphere ref={ref} args={[0.1]}><meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} /></Sphere>;
}

function MagneticFieldModel() {
  return (
    <group>
      <Box args={[3, 0.8, 0.8]}>
        <meshStandardMaterial color="#ef4444" />
      </Box>
      <Box args={[1.5, 0.81, 0.81]} position={[0.75, 0, 0]}>
        <meshStandardMaterial color="#3b82f6" />
      </Box>
      {Array.from({ length: 12 }).map((_, i) => {
        const radius = 1.2 + i * 0.4;
        return (
          <group key={i} rotation={[0, 0, (i * Math.PI) / 6]}>
            <Torus args={[radius, 0.01, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
              <meshBasicMaterial color="white" transparent opacity={0.15} />
            </Torus>
          </group>
        );
      })}
    </group>
  );
}

function PendulumModel() {
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 2.5) * 0.7;
  });
  return (
    <group position={[0, 3, 0]}>
      <Cylinder args={[0.1, 0.1, 1.5]} rotation={[0, 0, Math.PI / 2]}><meshStandardMaterial color="#475569" /></Cylinder>
      <group ref={groupRef}>
        <Cylinder args={[0.03, 0.03, 5]} position={[0, -2.5, 0]}><meshStandardMaterial color="#94a3b8" /></Cylinder>
        <Sphere args={[0.5]} position={[0, -5, 0]}><meshStandardMaterial color="#ef4444" /></Sphere>
      </group>
    </group>
  );
}

function ProjectileMotionModel() {
  const ballRef = useRef();
  useFrame((state) => {
    const t = (state.clock.getElapsedTime() % 2.5);
    const x = t * 3 - 3.5;
    const y = 4 * t - 0.5 * 9.8 * t * t * 0.3 + 0.5;
    if (ballRef.current) ballRef.current.position.set(x, y, 0);
  });
  return (
    <group>
      <Box args={[12, 0.1, 6]} position={[0, -1, 0]}><meshStandardMaterial color="#1e293b" /></Box>
      <Sphere ref={ballRef} args={[0.3]}><meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={0.5} /></Sphere>
    </group>
  );
}

function WaveMotionModel() {
  const spheres = useRef([]);
  useFrame((state) => {
    spheres.current.forEach((s, i) => {
      if (s) s.position.y = Math.sin(state.clock.getElapsedTime() * 4 + i * 0.6) * 1.8;
    });
  });
  return (
    <group>
      {Array.from({ length: 24 }).map((_, i) => (
        <Sphere key={i} ref={el => spheres.current[i] = el} args={[0.2]} position={[i * 0.5 - 5.5, 0, 0]}>
          <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={0.3} />
        </Sphere>
      ))}
    </group>
  );
}

function ACGeneratorModel() {
  const coilRef = useRef();
  useFrame((state) => {
    if (coilRef.current) coilRef.current.rotation.x = state.clock.getElapsedTime() * 2;
  });
  return (
    <group>
      <Box args={[1, 3, 3]} position={[-3.5, 0, 0]}><meshStandardMaterial color="#ef4444" /></Box>
      <Box args={[1, 3, 3]} position={[3.5, 0, 0]}><meshStandardMaterial color="#3b82f6" /></Box>
      <group ref={coilRef}>
        <Box args={[0.08, 2, 2.5]}><meshStandardMaterial color="#fbbf24" /></Box>
        <Cylinder args={[0.1, 0.1, 6]} rotation={[0, 0, Math.PI / 2]}><meshStandardMaterial color="#94a3b8" /></Cylinder>
      </group>
    </group>
  );
}

function DCMotorModel() {
  const rotorRef = useRef();
  useFrame((state) => {
    if (rotorRef.current) rotorRef.current.rotation.y = state.clock.getElapsedTime() * 3;
  });
  return (
    <group>
      <Torus args={[3, 0.6, 16, 100, Math.PI]} rotation={[0, Math.PI / 2, 0]}><meshStandardMaterial color="#475569" /></Torus>
      <group ref={rotorRef}>
        <Box args={[2, 0.6, 0.6]}><meshStandardMaterial color="#ef4444" /></Box>
        <Cylinder args={[0.15, 0.15, 4]}><meshStandardMaterial color="#94a3b8" /></Cylinder>
      </group>
    </group>
  );
}

function LensModel() {
  return (
    <group>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <sphereGeometry args={[4, 32, 32, 0, Math.PI * 2, 1.3, 0.5]} />
        <meshStandardMaterial color="#00f5ff" transparent opacity={0.3} />
      </mesh>
      {Array.from({ length: 7 }).map((_, i) => (
        <PhysicsRay key={i} y={i * 0.4 - 1.2} />
      ))}
    </group>
  );
}

function PhysicsRay({ y }) {
  const points = useMemo(() => [
    new THREE.Vector3(-6, y, 0),
    new THREE.Vector3(0, y, 0),
    new THREE.Vector3(6, -y * 0.6, 0)
  ], [y]);
  return (
    <line>
      <bufferGeometry attach="geometry" setFromPoints={points} />
      <lineBasicMaterial attach="material" color="#fbbf24" linewidth={2} />
    </line>
  );
}

function PulleySystemModel() {
  const weightRef = useRef();
  useFrame((state) => {
    if (weightRef.current) weightRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.5) * 1.2 - 2;
  });
  return (
    <group>
      <Cylinder args={[1.2, 1.2, 0.5]} rotation={[Math.PI / 2, 0, 0]} position={[0, 2.5, 0]}><meshStandardMaterial color="#475569" /></Cylinder>
      <group ref={weightRef}>
        <Cylinder args={[0.03, 0.03, 5]} position={[1.2, 2.5, 0]}><meshStandardMaterial color="#94a3b8" /></Cylinder>
        <Box args={[1.2, 1.2, 1.2]} position={[1.2, 0, 0]}><meshStandardMaterial color="#ef4444" /></Box>
      </group>
      <Cylinder args={[0.03, 0.03, 8]} position={[-1.2, -1.5, 0]}><meshStandardMaterial color="#94a3b8" /></Cylinder>
    </group>
  );
}

function SolarSystemModel() {
  const earthRef = useRef();
  const moonRef = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (earthRef.current) earthRef.current.position.set(Math.cos(t * 0.4) * 6, 0, Math.sin(t * 0.4) * 6);
    if (moonRef.current) moonRef.current.position.set(Math.cos(t * 1.8) * 1.8, 0, Math.sin(t * 1.8) * 1.8);
  });
  return (
    <group>
      <Sphere args={[1.8, 32, 32]}><meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1.2} /></Sphere>
      <group ref={earthRef}>
        <Sphere args={[0.7, 32, 32]}><meshStandardMaterial color="#3b82f6" /></Sphere>
        <group ref={moonRef}>
          <Sphere args={[0.25, 16, 16]}><meshStandardMaterial color="#94a3b8" /></Sphere>
        </group>
      </group>
    </group>
  );
}

// --- Maths Model Components ---

function CubeModel() {
  return (
    <Box args={[3, 3, 3]}>
      <meshStandardMaterial color="#f472b6" wireframe />
      <meshStandardMaterial color="#f472b6" transparent opacity={0.3} />
    </Box>
  );
}

function SphereModel() {
  return (
    <Sphere args={[2, 32, 32]}>
      <meshStandardMaterial color="#f472b6" wireframe />
      <meshStandardMaterial color="#f472b6" transparent opacity={0.3} />
    </Sphere>
  );
}

function ConeModel() {
  return (
    <group position={[0, -1, 0]}>
      <mesh>
        <coneGeometry args={[2, 4, 32]} />
        <meshStandardMaterial color="#f472b6" wireframe />
      </mesh>
      <mesh>
        <coneGeometry args={[2, 4, 32]} />
        <meshStandardMaterial color="#f472b6" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function CylinderModel() {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[1.5, 1.5, 4, 32]} />
        <meshStandardMaterial color="#f472b6" wireframe />
      </mesh>
      <mesh>
        <cylinderGeometry args={[1.5, 1.5, 4, 32]} />
        <meshStandardMaterial color="#f472b6" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function PyramidModel() {
  return (
    <group position={[0, -1, 0]}>
      <mesh>
        <coneGeometry args={[2.5, 3.5, 4]} />
        <meshStandardMaterial color="#f472b6" wireframe />
      </mesh>
      <mesh>
        <coneGeometry args={[2.5, 3.5, 4]} />
        <meshStandardMaterial color="#f472b6" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function CoordinatePlaneModel() {
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
  });
  return (
    <group ref={groupRef}>
      <gridHelper args={[10, 10, "#f472b6", "#475569"]} rotation={[0, 0, 0]} />
      <gridHelper args={[10, 10, "#f472b6", "#475569"]} rotation={[Math.PI / 2, 0, 0]} />
      <gridHelper args={[10, 10, "#f472b6", "#475569"]} rotation={[0, 0, Math.PI / 2]} />
      <axesHelper args={[6]} />
    </group>
  );
}

function VectorVisualizationModel() {
  const dir1 = useMemo(() => new THREE.Vector3(1, 1, 1).normalize(), []);
  const dir2 = useMemo(() => new THREE.Vector3(-1, 0.5, 0).normalize(), []);
  const origin = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
  });
  return (
    <group ref={groupRef}>
      <arrowHelper args={[dir1, origin, 5, 0xf472b6, 1, 0.5]} />
      <arrowHelper args={[dir2, origin, 4, 0x3b82f6, 1, 0.5]} />
      <gridHelper args={[10, 10, "#475569", "#1e293b"]} />
    </group>
  );
}

function ParabolaGraphModel() {
  const points = useMemo(() => {
    const p = [];
    for (let x = -5; x <= 5; x += 0.1) {
      p.push(new THREE.Vector3(x, (x * x) / 4 - 2, 0));
    }
    return p;
  }, []);

  return (
    <group>
      <gridHelper args={[10, 10, "#475569", "#1e293b"]} rotation={[Math.PI / 2, 0, 0]} />
      <line>
        <bufferGeometry attach="geometry" setFromPoints={points} />
        <lineBasicMaterial attach="material" color="#f472b6" linewidth={3} />
      </line>
      <Sphere args={[0.15]} position={[0, -2, 0]}>
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" />
      </Sphere>
    </group>
  );
}

function SineWaveGraphModel() {
  const lineRef = useRef();
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const points = [];
    for (let x = -5; x <= 5; x += 0.1) {
      points.push(new THREE.Vector3(x, Math.sin(x + time * 2) * 2, 0));
    }
    if (lineRef.current) {
      lineRef.current.geometry.setFromPoints(points);
    }
  });

  return (
    <group>
      <gridHelper args={[10, 10, "#475569", "#1e293b"]} rotation={[Math.PI / 2, 0, 0]} />
      <line ref={lineRef}>
        <bufferGeometry attach="geometry" />
        <lineBasicMaterial attach="material" color="#f472b6" linewidth={3} />
      </line>
    </group>
  );
}

function FunctionSurfaceModel() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      meshRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(8, 8, 50, 50);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const dist = Math.sqrt(x * x + y * y);
      pos.setZ(i, Math.sin(dist) * 1.5);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 3, 0, 0]}>
      <meshStandardMaterial color="#f472b6" wireframe />
      <meshStandardMaterial color="#f472b6" transparent opacity={0.4} side={THREE.DoubleSide} />
    </mesh>
  );
}

// --- Data ---

const modelData = {
  physics: [
    { id: "p1", name: "Electric Circuit", category: "Electricity", Component: ElectricCircuitModel },
    { id: "p2", name: "Magnetic Field", category: "Magnetism", Component: MagneticFieldModel },
    { id: "p3", name: "Pendulum", category: "Oscillations", Component: PendulumModel },
    { id: "p4", name: "Projectile Motion", category: "Mechanics", Component: ProjectileMotionModel },
    { id: "p5", name: "Wave Motion", category: "Waves", Component: WaveMotionModel },
    { id: "p6", name: "AC Generator", category: "Electromagnetism", Component: ACGeneratorModel },
    { id: "p7", name: "DC Motor", category: "Electromagnetism", Component: DCMotorModel },
    { id: "p8", name: "Lens Model", category: "Optics", Component: LensModel },
    { id: "p9", name: "Pulley System", category: "Mechanics", Component: PulleySystemModel },
    { id: "p10", name: "Solar System", category: "Astrophysics", Component: SolarSystemModel },
  ],
  chemistry: [
    { id: "c1", name: "Hydrogen Atom", category: "Atomic", Component: () => <AtomStructure nucleusColor="#ef4444" shells={[1]} /> },
    { id: "c2", name: "Helium Atom", category: "Atomic", Component: () => <AtomStructure nucleusColor="#fbbf24" shells={[2]} /> },
    { id: "c3", name: "Carbon Atom", category: "Atomic", Component: () => <AtomStructure nucleusColor="#334155" shells={[2, 4]} /> },
    { id: "c4", name: "Oxygen Atom", category: "Atomic", Component: () => <AtomStructure nucleusColor="#ef4444" shells={[2, 6]} /> },
    { id: "c5", name: "Water Molecule", category: "Molecular", Component: WaterModel },
    { id: "c6", name: "CO2 Molecule", category: "Molecular", Component: CO2Model },
    { id: "c7", name: "Methane Molecule", category: "Molecular", Component: MethaneModel },
    { id: "c8", name: "Benzene", category: "Organic", Component: BenzeneModel },
    { id: "c9", name: "Crystal Lattice", category: "Solid State", Component: CrystalLatticeModel },
    { id: "c10", name: "DNA Structure", category: "Biochemistry", Component: DNAHelixModel },
  ],
  maths: [
    { id: "m1", name: "Cube", category: "Geometry", Component: CubeModel },
    { id: "m2", name: "Sphere", category: "Geometry", Component: SphereModel },
    { id: "m3", name: "Cone", category: "Geometry", Component: ConeModel },
    { id: "m4", name: "Cylinder", category: "Geometry", Component: CylinderModel },
    { id: "m5", name: "Pyramid", category: "Geometry", Component: PyramidModel },
    { id: "m6", name: "Coordinate Plane", category: "Algebra", Component: CoordinatePlaneModel },
    { id: "m7", name: "Vector Visualization", category: "Vectors", Component: VectorVisualizationModel },
    { id: "m8", name: "Parabola Graph", category: "Algebra", Component: ParabolaGraphModel },
    { id: "m9", name: "Sine Wave Graph", category: "Trigonometry", Component: SineWaveGraphModel },
    { id: "m10", name: "3D Function Surface", category: "Calculus", Component: FunctionSurfaceModel },
  ],
};

const subjectMeta = {
  physics: { title: "Physics 3D Models", icon: BoxIcon, color: "text-cyan-400", theme: "cyan" },
  chemistry: { title: "Chemistry 3D Models", icon: Shapes, color: "text-teal-400", theme: "teal" },
  maths: { title: "Maths 3D Models", icon: Layers, color: "text-pink-400", theme: "pink" },
};

// --- Main Component ---

function Models() {
  const { subject } = useParams();
  const meta = subjectMeta[subject] || subjectMeta.physics;
  const models = modelData[subject] || modelData.physics;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState(models[0]);

  const filteredModels = useMemo(() => {
    return models.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [models, searchQuery]);

  // Handle case where subject changed but selectedModel is from old subject
  const currentModel = useMemo(() => {
    const found = models.find(m => m.id === selectedModel.id);
    return found || models[0];
  }, [models, selectedModel]);

  const ActiveModel = currentModel.Component;

  return (
    <div className="min-h-screen bg-slate-950 pb-20 overflow-x-hidden">
      <PageHeader
        title={meta.title}
        subtitle={`Interactive spatial visualizations for JEE ${subject}.`}
        icon={<meta.icon size={24} className={meta.color} />}
      />

      <div className="mx-auto max-w-[1600px] px-4 md:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Left: Model Grid Selection */}
          <div className="lg:col-span-4 space-y-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-sm font-medium outline-none focus:border-white/20 transition-all"
              />
            </div>

            <div className="premium-surface max-h-[700px] overflow-y-auto rounded-[2.5rem] border border-white/10 p-4 custom-scrollbar">
              <div className="px-2 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                Model Gallery
              </div>
              <div className="grid grid-cols-2 gap-3">
                {filteredModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model)}
                    className={`group flex flex-col items-center rounded-2xl p-4 text-center transition-all ${
                      currentModel.id === model.id 
                        ? "bg-white/10 ring-1 ring-white/20" 
                        : "bg-white/[0.02] hover:bg-white/5"
                    }`}
                  >
                    <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 transition-transform group-hover:scale-110 ${currentModel.id === model.id ? meta.color : "text-slate-400"}`}>
                      <BoxIcon size={20} />
                    </div>
                    <span className={`text-[11px] font-black leading-tight ${currentModel.id === model.id ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}>
                      {model.name}
                    </span>
                  </button>
                ))}
                {filteredModels.length === 0 && (
                  <div className="col-span-2 p-8 text-center text-sm font-medium text-slate-500">
                    No models found.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Viewer Area */}
          <div className="lg:col-span-8 space-y-6">
            <div className="relative aspect-video lg:aspect-auto lg:h-[750px] overflow-hidden rounded-[3rem] border border-white/10 bg-slate-900/40 backdrop-blur-3xl shadow-2xl">
              <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
              
              <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color={meta.theme === 'cyan' ? '#00f5ff' : meta.theme === 'teal' ? '#2dd4bf' : '#f472b6'} />
                
                <Suspense fallback={null}>
                  <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                    <Center>
                      <ActiveModel />
                    </Center>
                  </Float>
                  <OrbitControls enablePan={false} minDistance={2} maxDistance={20} />
                </Suspense>
              </Canvas>

              {/* Viewer UI Overlays */}
              <div className="absolute top-8 left-8 z-10">
                <motion.div
                  key={currentModel.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl"
                >
                  <h3 className="text-xl font-black text-white">{currentModel.name}</h3>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{currentModel.category}</p>
                </motion.div>
              </div>

              <div className="absolute bottom-8 right-8 z-10 flex items-center gap-3">
                <button 
                  onClick={() => setSelectedModel(models[0])}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/40 text-white transition hover:bg-white/10 backdrop-blur-xl"
                >
                  <RotateCcw size={20} />
                </button>
                <button className="flex items-center gap-3 rounded-2xl bg-white px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-200 shadow-lg">
                  <Play size={18} fill="currentColor" />
                  Simulate
                </button>
              </div>

              <div className="absolute bottom-8 left-8 z-10">
                 <button className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-300 transition hover:text-white backdrop-blur-xl">
                   <Info size={14} /> View Concept
                 </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="premium-surface rounded-3xl border border-white/10 p-6">
                  <h4 className="text-sm font-black text-white mb-2">Controls</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">Use mouse to rotate, scroll to zoom. Atomic radii represent Bohr-calculated constants.</p>
               </div>
               <div className="premium-surface rounded-3xl border border-white/10 p-6">
                  <h4 className="text-sm font-black text-white mb-2">Spatial Context</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">Models follow VSEPR theory and valence-bond geometry scaling.</p>
               </div>
               <div className="premium-surface rounded-3xl border border-white/10 p-6">
                  <h4 className="text-sm font-black text-white mb-2">Related Topics</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">Hybridization, Molecular Orbitals, Crystal Structures.</p>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Models;
