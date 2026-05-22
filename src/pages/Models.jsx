import { useState, useMemo, Suspense, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Float, MeshDistortMaterial, Sphere, Box, Torus, Center, Cylinder, Html } from "@react-three/drei";
import { Search, Box as BoxIcon, Shapes, Layers, Play, Info, RotateCcw, X, Sparkles, Menu, Save } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import { useAuth } from "../context/AuthContext";
import { saveCustomModel, getCustomModels, cleanupCustomModels } from "../services/firestore";
import { askVoltSensei } from "../services/groq";
import { intelligentSearch } from "../services/search";
import * as THREE from "three";

/**
 * Utility to generate a stable hash from a string
 */
function getStringHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// --- Components for Highlighting ---

function HighlightWrapper({ active, children, color = "#fbbf24" }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    if (active) {
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 10) * 0.05;
      ref.current.scale.set(scale, scale, scale);
    } else {
      ref.current.scale.set(1, 1, 1);
    }
  });

  return (
    <group ref={ref}>
      {children}
      {active && (
        <Sphere args={[0.05]} position={[0, 0, 0]}>
          <meshBasicMaterial color={color} transparent opacity={0} />
        </Sphere>
      )}
    </group>
  );
}

// --- 3D Model Components ---

function Electron({ radius, speed, offset, highlighted }) {
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
      <meshStandardMaterial 
        color="#00f5ff" 
        emissive="#00f5ff" 
        emissiveIntensity={highlighted ? 5 : 2} 
      />
    </mesh>
  );
}

function AtomStructure({ nucleusColor, shells, highlight }) {
  const isNucleusHighlighted = highlight === "primary";
  const areOrbitsHighlighted = highlight === "secondary" || highlight === "detail";

  // Generate stable rotations for shells
  const shellRotations = useMemo(() => {
    return shells.map(() => [Math.random() * Math.PI, Math.random() * Math.PI, 0]);
  }, [shells.length]);

  return (
    <group>
      <HighlightWrapper active={isNucleusHighlighted}>
        <Sphere args={[0.4, 32, 32]}>
          <meshStandardMaterial 
            color={nucleusColor} 
            emissive={nucleusColor} 
            emissiveIntensity={isNucleusHighlighted ? 3 : 0.5} 
          />
        </Sphere>
      </HighlightWrapper>
      {shells.map((count, i) => {
        const radius = 1.2 + i * 0.8;
        return (
          <group key={i} rotation={shellRotations[i]}>
            <Torus args={[radius, 0.01, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
              <meshBasicMaterial color="white" transparent opacity={areOrbitsHighlighted ? 0.4 : 0.1} />
            </Torus>
            {Array.from({ length: count }).map((_, j) => (
              <Electron 
                key={j} 
                radius={radius} 
                speed={1 - i * 0.2} 
                offset={(j * Math.PI * 2) / count} 
                highlighted={areOrbitsHighlighted}
              />
            ))}
          </group>
        );
      })}
    </group>
  );
}

function BondMesh({ start, end, double, highlighted, isFormation, animProgress }) {
  const ref = useRef();
  const highlightRef = useRef();
  
  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  const dir = new THREE.Vector3().subVectors(endVec, startVec);
  const len = dir.length();
  const mid = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());

  useFrame((state) => {
    if (!ref.current) return;
    if (isFormation) {
      const p = animProgress.current;
      ref.current.position.copy(mid).multiplyScalar(p);
      ref.current.scale.set(p, p, p);
      ref.current.visible = p > 0.4;
    } else {
      ref.current.position.copy(mid);
      ref.current.scale.set(1, 1, 1);
      ref.current.visible = true;
    }

    if (highlightRef.current) {
      if (highlighted) {
        const scale = 1 + Math.sin(state.clock.getElapsedTime() * 5) * 0.15;
        highlightRef.current.scale.set(scale, scale, scale);
        highlightRef.current.visible = true;
      } else {
        highlightRef.current.visible = false;
      }
    }
  });

  return (
    <group ref={ref} quaternion={quaternion}>
      {double ? (
        <>
          <Cylinder args={[0.04, 0.04, len]} position={[0.1, 0, 0]}>
            <meshStandardMaterial color={highlighted ? "#fbbf24" : "#64748b"} emissive={highlighted ? "#fbbf24" : "black"} emissiveIntensity={highlighted ? 1.5 : 0} />
          </Cylinder>
          <Cylinder args={[0.04, 0.04, len]} position={[-0.1, 0, 0]}>
            <meshStandardMaterial color={highlighted ? "#fbbf24" : "#64748b"} emissive={highlighted ? "#fbbf24" : "black"} emissiveIntensity={highlighted ? 1.5 : 0} />
          </Cylinder>
        </>
      ) : (
        <Cylinder args={[0.05, 0.05, len]}>
          <meshStandardMaterial color={highlighted ? "#fbbf24" : "#64748b"} emissive={highlighted ? "#fbbf24" : "black"} emissiveIntensity={highlighted ? 1.5 : 0} />
        </Cylinder>
      )}
      <group ref={highlightRef}>
         <Cylinder args={[0.09, 0.09, len]}>
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.4} />
         </Cylinder>
      </group>
    </group>
  );
}

function AtomMesh({ pos, size, color, highlighted, isFormation, animProgress }) {
  const ref = useRef();
  const highlightRef = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    
    if (isFormation) {
      const p = animProgress.current;
      const currentPos = new THREE.Vector3(...pos).multiplyScalar(p);
      ref.current.position.copy(currentPos);
      ref.current.scale.set(p, p, p);
    } else {
      ref.current.position.set(...pos);
      ref.current.scale.set(1, 1, 1);
    }

    if (highlightRef.current) {
      if (highlighted) {
        const scale = 1 + Math.sin(state.clock.getElapsedTime() * 5) * 0.15;
        highlightRef.current.scale.set(scale, scale, scale);
        highlightRef.current.visible = true;
      } else {
        highlightRef.current.visible = false;
      }
    }
  });

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={highlighted ? 1.5 : 0} 
        />
      </mesh>
      <mesh ref={highlightRef}>
        <sphereGeometry args={[size + 0.08, 32, 32]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

function Molecule({ atoms, bonds, highlight, formula }) {
  const isFormation = highlight === "formation";
  const areAtomsHighlighted = highlight === "primary" || highlight === "atoms";
  const areBondsHighlighted = highlight === "secondary" || highlight === "detail" || highlight === "bonds";

  const animProgress = useRef(0);

  useFrame((state, delta) => {
    if (isFormation) {
      animProgress.current = Math.min(animProgress.current + delta * 0.8, 1);
    } else {
      animProgress.current = 1;
    }
  });

  return (
    <group>
      {formula && (
        <Html position={[0, 3, 0]} center zIndexRange={[100, 0]}>
          <div className="pointer-events-none px-6 py-3 bg-slate-900/90 backdrop-blur-2xl rounded-2xl border border-white/20 text-white font-black text-2xl tracking-widest shadow-[0_0_40px_rgba(255,255,255,0.15)] ring-1 ring-white/10 whitespace-nowrap">
            {formula}
          </div>
        </Html>
      )}
      {atoms.map((atom, i) => {
        let isHighlighted = areAtomsHighlighted;
        if (highlight === `atom-${i}`) isHighlighted = true;
        if (highlight === 'atoms-H' && atom.color === '#ffffff') isHighlighted = true;
        if (highlight === 'atoms-O' && atom.color === '#ef4444') isHighlighted = true;
        if (highlight === 'atoms-C' && atom.color === '#334155') isHighlighted = true;
        
        return (
          <AtomMesh 
            key={i} 
            pos={atom.pos} 
            size={atom.size || 0.4} 
            color={atom.color} 
            highlighted={isHighlighted} 
            isFormation={isFormation} 
            animProgress={animProgress}
          />
        );
      })}
      {bonds.map((bond, i) => {
        let isHighlighted = areBondsHighlighted;
        if (highlight === `bond-${i}`) isHighlighted = true;
        return (
          <BondMesh 
            key={i} 
            start={bond.start} 
            end={bond.end} 
            double={bond.double} 
            highlighted={isHighlighted}
            isFormation={isFormation}
            animProgress={animProgress}
          />
        );
      })}
    </group>
  );
}

// --- Specific Chemistry Models ---

const WaterModel = (props) => (
  <Molecule 
    {...props}
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

const OxygenModel = (props) => (
  <Molecule 
    {...props}
    atoms={[
      { pos: [-0.8, 0, 0], color: "#ef4444", size: 0.5 },
      { pos: [0.8, 0, 0], color: "#ef4444", size: 0.5 },
    ]}
    bonds={[{ start: [-0.8, 0, 0], end: [0.8, 0, 0], double: true }]}
  />
);

const MethaneModel = (props) => (
  <Molecule 
    {...props}
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

const BenzeneModel = (props) => {
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
      {...props}
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

const DNAHelixModel = ({ highlight }) => {
  const points = Array.from({ length: 20 }).map((_, i) => {
    const angle = i * 0.8;
    const y = i * 0.4 - 4;
    return {
      p1: [Math.cos(angle) * 1.5, y, Math.sin(angle) * 1.5],
      p2: [Math.cos(angle + Math.PI) * 1.5, y, Math.sin(angle + Math.PI) * 1.5]
    };
  });

  const isBackboneHighlighted = highlight === "primary";
  const areBasesHighlighted = highlight === "secondary" || highlight === "detail";

  return (
    <group>
      {points.map((p, i) => (
        <group key={i}>
          <mesh position={p.p1}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={isBackboneHighlighted ? 2 : 0} />
          </mesh>
          <mesh position={p.p2}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={isBackboneHighlighted ? 2 : 0} />
          </mesh>
          {i % 2 === 0 && <BondMesh start={p.p1} end={p.p2} highlighted={areBasesHighlighted} />}
        </group>
      ))}
    </group>
  );
};

const CrystalLatticeModel = ({ highlight }) => (
  <group>
    {Array.from({ length: 3 }).map((_, x) => 
      Array.from({ length: 3 }).map((_, y) => 
        Array.from({ length: 3 }).map((_, z) => (
          <mesh key={`${x}${y}${z}`} position={[x - 1, y - 1, z - 1]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#94a3b8" emissive="#fbbf24" emissiveIntensity={highlight !== "none" ? 1 : 0} />
          </mesh>
        ))
      )
    )}
  </group>
);

const NaClModel = ({ highlight }) => (
  <group>
    {Array.from({ length: 3 }).map((_, x) => 
      Array.from({ length: 3 }).map((_, y) => 
        Array.from({ length: 3 }).map((_, z) => {
          const isNa = (x + y + z) % 2 === 0;
          const isHighlighted = (isNa && highlight === "primary") || (!isNa && highlight === "secondary");
          return (
            <mesh key={`${x}${y}${z}`} position={[(x - 1) * 1.2, (y - 1) * 1.2, (z - 1) * 1.2]}>
              <sphereGeometry args={[isNa ? 0.2 : 0.35, 32, 32]} />
              <meshStandardMaterial color={isNa ? "#818cf8" : "#4ade80"} emissive={isNa ? "#818cf8" : "#4ade80"} emissiveIntensity={isHighlighted ? 2 : 0} />
            </mesh>
          );
        })
      )
    )}
  </group>
);

const CO2Model = (props) => (
  <Molecule 
    {...props}
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

function ElectricCircuitModel({ highlight }) {
  const isSourceHighlighted = highlight === "primary";
  const isWireHighlighted = highlight === "secondary" || highlight === "detail";
  const electronCount = 20;

  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.05, 16, 100]} />
        <meshStandardMaterial color={isWireHighlighted ? "#fbbf24" : "#475569"} emissive={isWireHighlighted ? "#fbbf24" : "black"} emissiveIntensity={isWireHighlighted ? 1 : 0} />
      </mesh>
      <HighlightWrapper active={isSourceHighlighted}>
        <Box args={[0.8, 1, 0.5]} position={[0, 0, 2.5]}>
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={isSourceHighlighted ? 2 : 0} />
        </Box>
      </HighlightWrapper>
      {Array.from({ length: electronCount }).map((_, i) => (
        <MovingElectron key={i} radius={2.5} speed={1} offset={(i * Math.PI * 2) / electronCount} highlighted={isWireHighlighted} />
      ))}
    </group>
  );
}

function MovingElectron({ radius, speed, offset, highlighted }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() * speed + offset;
    ref.current.position.set(Math.cos(t) * radius, 0, Math.sin(t) * radius);
  });
  return (
    <Sphere ref={ref} args={[0.1]}>
      <meshStandardMaterial 
        color="#fbbf24" 
        emissive="#fbbf24" 
        emissiveIntensity={highlighted ? 5 : 1} 
      />
    </Sphere>
  );
}

function MagneticFieldModel({ highlight }) {
  const isMagnetHighlighted = highlight === "primary";
  const areLinesHighlighted = highlight === "secondary" || highlight === "detail";

  return (
    <group>
      <HighlightWrapper active={isMagnetHighlighted}>
        <Box args={[3, 0.8, 0.8]}>
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={isMagnetHighlighted ? 2 : 0} />
        </Box>
        <Box args={[1.5, 0.81, 0.81]} position={[0.75, 0, 0]}>
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={isMagnetHighlighted ? 2 : 0} />
        </Box>
      </HighlightWrapper>
      {Array.from({ length: 12 }).map((_, i) => {
        const radius = 1.2 + i * 0.4;
        return (
          <group key={i} rotation={[0, 0, (i * Math.PI) / 6]}>
            <Torus args={[radius, 0.01, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
              <meshBasicMaterial color="white" transparent opacity={areLinesHighlighted ? 0.5 : 0.15} />
            </Torus>
          </group>
        );
      })}
    </group>
  );
}

function PendulumModel({ highlight }) {
  const isBobHighlighted = highlight === "detail" || highlight === "secondary";
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 2.5) * 0.7;
  });
  return (
    <group position={[0, 3, 0]}>
      <Cylinder args={[0.1, 0.1, 1.5]} rotation={[0, 0, Math.PI / 2]}><meshStandardMaterial color="#475569" /></Cylinder>
      <group ref={groupRef}>
        <Cylinder args={[0.03, 0.03, 5]} position={[0, -2.5, 0]}><meshStandardMaterial color="#94a3b8" /></Cylinder>
        <HighlightWrapper active={isBobHighlighted}>
          <Sphere args={[0.5]} position={[0, -5, 0]}>
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={isBobHighlighted ? 2 : 0} />
          </Sphere>
        </HighlightWrapper>
      </group>
    </group>
  );
}

function ProjectileMotionModel({ highlight }) {
  const isBallHighlighted = highlight !== "none";
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
      <HighlightWrapper active={isBallHighlighted}>
        <Sphere ref={ballRef} args={[0.3]}>
          <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={isBallHighlighted ? 5 : 0.5} />
        </Sphere>
      </HighlightWrapper>
    </group>
  );
}

function WaveMotionModel({ highlight }) {
  const isWaveHighlighted = highlight !== "none";
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
          <meshStandardMaterial 
            color="#c084fc" 
            emissive="#c084fc" 
            emissiveIntensity={isWaveHighlighted ? 2 : 0.3} 
          />
        </Sphere>
      ))}
    </group>
  );
}

function ACGeneratorModel({ highlight }) {
  const isCoilHighlighted = highlight === "secondary" || highlight === "detail";
  const coilRef = useRef();
  useFrame((state) => {
    if (coilRef.current) coilRef.current.rotation.x = state.clock.getElapsedTime() * 2;
  });
  return (
    <group>
      <Box args={[1, 3, 3]} position={[-3.5, 0, 0]}><meshStandardMaterial color="#ef4444" /></Box>
      <Box args={[1, 3, 3]} position={[3.5, 0, 0]}><meshStandardMaterial color="#3b82f6" /></Box>
      <group ref={coilRef}>
        <HighlightWrapper active={isCoilHighlighted}>
          <Box args={[0.08, 2, 2.5]}>
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={isCoilHighlighted ? 2 : 0} />
          </Box>
        </HighlightWrapper>
        <Cylinder args={[0.1, 0.1, 6]} rotation={[0, 0, Math.PI / 2]}><meshStandardMaterial color="#94a3b8" /></Cylinder>
      </group>
    </group>
  );
}

function DCMotorModel({ highlight }) {
  const isRotorHighlighted = highlight === "secondary" || highlight === "detail";
  const rotorRef = useRef();
  useFrame((state) => {
    if (rotorRef.current) rotorRef.current.rotation.y = state.clock.getElapsedTime() * 3;
  });
  return (
    <group>
      <Torus args={[3, 0.6, 16, 100, Math.PI]} rotation={[0, Math.PI / 2, 0]}><meshStandardMaterial color="#475569" /></Torus>
      <group ref={rotorRef}>
        <HighlightWrapper active={isRotorHighlighted}>
          <Box args={[2, 0.6, 0.6]}>
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={isRotorHighlighted ? 2 : 0} />
          </Box>
        </HighlightWrapper>
        <Cylinder args={[0.15, 0.15, 4]}><meshStandardMaterial color="#94a3b8" /></Cylinder>
      </group>
    </group>
  );
}

function LensModel({ highlight }) {
  const isLensHighlighted = highlight === "primary";
  const areRaysHighlighted = highlight === "secondary" || highlight === "detail";
  return (
    <group>
      <HighlightWrapper active={isLensHighlighted}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <sphereGeometry args={[4, 32, 32, 0, Math.PI * 2, 1.3, 0.5]} />
          <meshStandardMaterial color="#00f5ff" transparent opacity={isLensHighlighted ? 0.6 : 0.3} emissive="#00f5ff" emissiveIntensity={isLensHighlighted ? 1 : 0} />
        </mesh>
      </HighlightWrapper>
      {Array.from({ length: 7 }).map((_, i) => (
        <PhysicsRay key={i} y={i * 0.4 - 1.2} highlighted={areRaysHighlighted} />
      ))}
    </group>
  );
}

function PhysicsRay({ y, highlighted }) {
  const points = useMemo(() => [
    new THREE.Vector3(-6, y, 0),
    new THREE.Vector3(0, y, 0),
    new THREE.Vector3(6, -y * 0.6, 0)
  ], [y]);
  return (
    <line>
      <bufferGeometry attach="geometry" setFromPoints={points} />
      <lineBasicMaterial attach="material" color={highlighted ? "#fbbf24" : "#fcd34d"} linewidth={highlighted ? 5 : 2} />
    </line>
  );
}

function PulleySystemModel({ highlight }) {
  const isBlockHighlighted = highlight === "detail" || highlight === "secondary";
  const weightRef = useRef();
  useFrame((state) => {
    if (weightRef.current) weightRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.5) * 1.2 - 2;
  });
  return (
    <group>
      <Cylinder args={[1.2, 1.2, 0.5]} rotation={[Math.PI / 2, 0, 0]} position={[0, 2.5, 0]}><meshStandardMaterial color="#475569" /></Cylinder>
      <group ref={weightRef}>
        <Cylinder args={[0.03, 0.03, 5]} position={[1.2, 2.5, 0]}><meshStandardMaterial color="#94a3b8" /></Cylinder>
        <HighlightWrapper active={isBlockHighlighted}>
          <Box args={[1.2, 1.2, 1.2]} position={[1.2, 0, 0]}>
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={isBlockHighlighted ? 2 : 0} />
          </Box>
        </HighlightWrapper>
      </group>
      <Cylinder args={[0.03, 0.03, 8]} position={[-1.2, -1.5, 0]}><meshStandardMaterial color="#94a3b8" /></Cylinder>
    </group>
  );
}

function SolarSystemModel({ highlight }) {
  const isSunHighlighted = highlight === "primary";
  const isSystemHighlighted = highlight === "secondary" || highlight === "detail";
  const earthRef = useRef();
  const moonRef = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (earthRef.current) earthRef.current.position.set(Math.cos(t * 0.4) * 6, 0, Math.sin(t * 0.4) * 6);
    if (moonRef.current) moonRef.current.position.set(Math.cos(t * 1.8) * 1.8, 0, Math.sin(t * 1.8) * 1.8);
  });
  return (
    <group>
      <Sphere args={[1.8, 32, 32]}>
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={isSunHighlighted ? 3 : 1.2} />
      </Sphere>
      <group ref={earthRef}>
        <Sphere args={[0.7, 32, 32]}><meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={isSystemHighlighted ? 1 : 0} /></Sphere>
        <group ref={moonRef}>
          <Sphere args={[0.25, 16, 16]}><meshStandardMaterial color="#94a3b8" emissive="#94a3b8" emissiveIntensity={isSystemHighlighted ? 1 : 0} /></Sphere>
        </group>
      </group>
    </group>
  );
}

// --- Maths Model Components ---

function CubeModel({ highlight }) {
  const isSkeletonHighlighted = highlight === "secondary";
  const areVerticesHighlighted = highlight === "detail";
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
      groupRef.current.rotation.x = state.clock.getElapsedTime() * 0.1;
    }
  });

  const corners = useMemo(() => {
    const pts = [];
    for (let x of [-1.5, 1.5]) {
      for (let y of [-1.5, 1.5]) {
        for (let z of [-1.5, 1.5]) {
          pts.push([x, y, z]);
        }
      }
    }
    return pts;
  }, []);

  const diagPoints = useMemo(() => [
    new THREE.Vector3(-1.5, -1.5, -1.5),
    new THREE.Vector3(1.5, 1.5, 1.5)
  ], []);

  const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(3, 3, 3)), []);

  return (
    <group ref={groupRef}>
      <Box args={[3, 3, 3]}>
        <meshStandardMaterial color="#f472b6" transparent opacity={0.15} />
      </Box>
      <Box args={[3, 3, 3, 3, 3, 3]}>
        <meshBasicMaterial color="#f472b6" wireframe transparent opacity={isSkeletonHighlighted ? 0.6 : 0.2} />
      </Box>
      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial color={isSkeletonHighlighted ? "#fbbf24" : "#ec4899"} linewidth={2} />
      </lineSegments>
      {corners.map((pos, i) => (
        <Sphere key={i} args={[0.08]} position={pos}>
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={areVerticesHighlighted ? 5 : 0.5} />
        </Sphere>
      ))}
      <line>
        <bufferGeometry attach="geometry" setFromPoints={diagPoints} />
        <lineBasicMaterial attach="material" color="#fbbf24" transparent opacity={highlight === "detail" ? 1 : 0.3} />
      </line>
    </group>
  );
}

function SphereModel({ highlight }) {
  const areRingsHighlighted = highlight === "secondary" || highlight === "detail";
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
      groupRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.2;
    }
  });

  const radiusPoints = useMemo(() => [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 2, 0)
  ], []);

  return (
    <group ref={groupRef}>
      <Sphere args={[2, 32, 32]}>
        <meshStandardMaterial color="#f472b6" transparent opacity={0.15} />
      </Sphere>
      <Sphere args={[2, 16, 16]}>
        <meshBasicMaterial color="#f472b6" wireframe transparent opacity={0.15} />
      </Sphere>
      
      <Torus args={[2, 0.015, 32, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color={areRingsHighlighted ? "#fbbf24" : "#ec4899"} />
      </Torus>
      <Torus args={[2, 0.015, 32, 100]}>
        <meshBasicMaterial color={areRingsHighlighted ? "#fbbf24" : "#ec4899"} />
      </Torus>
      <Torus args={[2, 0.015, 32, 100]} rotation={[0, Math.PI / 2, 0]}>
        <meshBasicMaterial color={areRingsHighlighted ? "#fbbf24" : "#ec4899"} />
      </Torus>

      <Torus args={[Math.sqrt(3), 0.01, 32, 100]} position={[0, 1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#f472b6" transparent opacity={areRingsHighlighted ? 1 : 0.6} />
      </Torus>
      <Torus args={[Math.sqrt(3), 0.01, 32, 100]} position={[0, -1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#f472b6" transparent opacity={areRingsHighlighted ? 1 : 0.6} />
      </Torus>

      <line>
        <bufferGeometry attach="geometry" setFromPoints={radiusPoints} />
        <lineBasicMaterial attach="material" color="#fbbf24" />
      </line>
      <Sphere args={[0.08]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
      </Sphere>
      <Sphere args={[0.08]} position={[0, 2, 0]}>
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
      </Sphere>
    </group>
  );
}

function ConeModel({ highlight }) {
  const isSkeletonHighlighted = highlight !== "none";
  return (
    <group position={[0, -1, 0]}>
      <mesh>
        <coneGeometry args={[2, 4, 32]} />
        <meshStandardMaterial color="#f472b6" wireframe emissive="#f472b6" emissiveIntensity={isSkeletonHighlighted ? 1 : 0} />
      </mesh>
      <mesh>
        <coneGeometry args={[2, 4, 32]} />
        <meshStandardMaterial color="#f472b6" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function CylinderModel({ highlight }) {
  const isSkeletonHighlighted = highlight !== "none";
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[1.5, 1.5, 4, 32]} />
        <meshStandardMaterial color="#f472b6" wireframe emissive="#f472b6" emissiveIntensity={isSkeletonHighlighted ? 1 : 0} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[1.5, 1.5, 4, 32]} />
        <meshStandardMaterial color="#f472b6" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function PyramidModel({ highlight }) {
  const isSkeletonHighlighted = highlight !== "none";
  return (
    <group position={[0, -1, 0]}>
      <mesh>
        <coneGeometry args={[2.5, 3.5, 4]} />
        <meshStandardMaterial color="#f472b6" wireframe emissive="#f472b6" emissiveIntensity={isSkeletonHighlighted ? 1 : 0} />
      </mesh>
      <mesh>
        <coneGeometry args={[2.5, 3.5, 4]} />
        <meshStandardMaterial color="#f472b6" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function CoordinatePlaneModel({ highlight }) {
  const isPlaneHighlighted = highlight !== "none";
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
  });
  return (
    <group ref={groupRef}>
      <gridHelper args={[10, 10, isPlaneHighlighted ? "#fbbf24" : "#f472b6", "#475569"]} rotation={[0, 0, 0]} />
      <gridHelper args={[10, 10, isPlaneHighlighted ? "#fbbf24" : "#f472b6", "#475569"]} rotation={[Math.PI / 2, 0, 0]} />
      <gridHelper args={[10, 10, isPlaneHighlighted ? "#fbbf24" : "#f472b6", "#475569"]} rotation={[0, 0, Math.PI / 2]} />
      <axesHelper args={[6]} />
    </group>
  );
}

function VectorVisualizationModel({ highlight }) {
  const isVectorHighlighted = highlight !== "none";
  const dir1 = useMemo(() => new THREE.Vector3(1, 1, 1).normalize(), []);
  const dir2 = useMemo(() => new THREE.Vector3(-1, 0.5, 0).normalize(), []);
  const origin = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
  });
  return (
    <group ref={groupRef}>
      <arrowHelper args={[dir1, origin, 5, isVectorHighlighted ? 0xfbbf24 : 0xf472b6, 1, 0.5]} />
      <arrowHelper args={[dir2, origin, 4, isVectorHighlighted ? 0xfbbf24 : 0x3b82f6, 1, 0.5]} />
      <gridHelper args={[10, 10, "#475569", "#1e293b"]} />
    </group>
  );
}

function ParabolaGraphModel({ highlight }) {
  const isGraphHighlighted = highlight !== "none";
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
        <lineBasicMaterial attach="material" color={isGraphHighlighted ? "#fbbf24" : "#f472b6"} linewidth={3} />
      </line>
      <Sphere args={[0.15]} position={[0, -2, 0]}>
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={isGraphHighlighted ? 2 : 1} />
      </Sphere>
    </group>
  );
}

function SineWaveGraphModel({ highlight }) {
  const isGraphHighlighted = highlight !== "none";
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
        <lineBasicMaterial attach="material" color={isGraphHighlighted ? "#fbbf24" : "#f472b6"} linewidth={3} />
      </line>
    </group>
  );
}

function FunctionSurfaceModel({ highlight }) {
  const isSurfaceHighlighted = highlight !== "none";
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
      <meshStandardMaterial color={isSurfaceHighlighted ? "#fbbf24" : "#f472b6"} wireframe emissive={isSurfaceHighlighted ? "#fbbf24" : "black"} emissiveIntensity={isSurfaceHighlighted ? 1 : 0} />
      <meshStandardMaterial color="#f472b6" transparent opacity={0.4} side={THREE.DoubleSide} />
    </mesh>
  );
}

// --- AI Procedural Components (Placeholders) ---

function AIChemistryPlaceholder({ highlight, name, formula }) {
  const hash = useMemo(() => getStringHash(name || "default"), [name]);
  
  const { atoms, bonds } = useMemo(() => {
    const geometryIndex = hash % 6; 
    const atomsList = [];
    const colors = ["#ef4444", "#3b82f6", "#10b981", "#fbbf24", "#ffffff", "#a855f7"];
    
    // Central atom
    atomsList.push({ pos: [0, 0, 0], color: colors[hash % colors.length], size: 0.55 });
    
    const r = 2.2;
    // Standard molecular geometries based on VSEPR
    const geometries = [
      [[r, 0, 0], [-r, 0, 0]], // Linear
      [[r * 0.86, r * 0.5, 0], [-r * 0.86, r * 0.5, 0]], // Bent
      [[r, 0, 0], [r * -0.5, r * 0.86, 0], [r * -0.5, r * -0.86, 0]], // Trigonal Planar
      [[r, r, r], [r, -r, -r], [-r, r, -r], [-r, -r, r]].map(p => new THREE.Vector3(...p).normalize().multiplyScalar(r).toArray()), // Tetrahedral
      [[0, r, 0], [0, -r, 0], [r, 0, 0], [r*-0.5, 0, r*0.86], [r*-0.5, 0, r*-0.86]], // Trigonal Bipyramidal
      [[r, 0, 0], [-r, 0, 0], [0, r, 0], [0, -r, 0], [0, 0, r], [0, 0, -r]], // Octahedral
    ];
    
    const points = geometries[geometryIndex];
    points.forEach((p, i) => {
      atomsList.push({
        pos: p,
        color: colors[(hash + i + 1) % colors.length],
        size: 0.35
      });
    });

    const bondsList = [];
    for (let i = 1; i < atomsList.length; i++) {
       bondsList.push({ start: atomsList[0].pos, end: atomsList[i].pos });
    }
    
    return { atoms: atomsList, bonds: bondsList };
  }, [hash]);

  return <Molecule atoms={atoms} bonds={bonds} highlight={highlight} formula={formula} />;
}

function AIPhysicsPlaceholder({ highlight, name, formula }) {
  const isHigh = highlight !== "none";
  const hash = useMemo(() => getStringHash(name || "default"), [name]);
  const type = hash % 3;
  const rotorRef = useRef();

  useFrame((state) => {
    if (rotorRef.current) {
      rotorRef.current.rotation.y = state.clock.getElapsedTime() * 2;
    }
  });

  return (
    <group>
      {formula && (
        <Html position={[0, 4, 0]} center zIndexRange={[100, 0]}>
          <div className="pointer-events-none px-6 py-3 bg-slate-900/90 backdrop-blur-2xl rounded-2xl border border-white/20 text-white font-black text-2xl tracking-widest shadow-[0_0_40px_rgba(255,255,255,0.15)] ring-1 ring-white/10 whitespace-nowrap">
            {formula}
          </div>
        </Html>
      )}
      {/* Heavy Lab Base */}
      <Box args={[6, 0.4, 4]} position={[0, -2.5, 0]}>
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </Box>

      {type === 0 && ( // Optics Apparatus
        <group>
          <group position={[-2, -1, 0]}>
            <Box args={[1.5, 1, 1]}><meshStandardMaterial color="#1e293b" /></Box>
            <Cylinder args={[0.2, 0.2, 0.5]} rotation={[0, 0, Math.PI / 2]} position={[0.8, 0, 0]}>
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={5} />
            </Cylinder>
          </group>
          <group position={[0, -1, 0]} rotation={[0, Math.PI/4, 0]}>
            <mesh><cylinderGeometry args={[1, 1, 2.5, 3]} /><meshStandardMaterial color="#00f5ff" transparent opacity={0.4} /></mesh>
          </group>
          <Cylinder args={[0.02, 0.02, 8]} rotation={[0, 0, Math.PI / 2]} position={[1, -1, 0]}>
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={10} />
          </Cylinder>
        </group>
      )}

      {type === 1 && ( // Mechanics Apparatus
        <group>
          <Cylinder args={[0.15, 0.15, 6]} position={[-2, 0, 0]}><meshStandardMaterial color="#94a3b8" /></Cylinder>
          <Box args={[4, 0.15, 0.15]} position={[0, 2.8, 0]}><meshStandardMaterial color="#94a3b8" /></Box>
          <group position={[1.5, 2.8, 0]}>
             <Torus args={[0.5, 0.1, 16, 32]} rotation={[0, Math.PI/2, 0]}><meshStandardMaterial color="#475569" /></Torus>
             <Cylinder args={[0.02, 0.02, 4]} position={[0, -2, 0]}><meshStandardMaterial color="#ffffff" /></Cylinder>
             <Box args={[1, 1, 1]} position={[0, -4, 0]}>
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={isHigh ? 2 : 0} />
             </Box>
          </group>
        </group>
      )}

      {type === 2 && ( // EM Apparatus
        <group>
          <group rotation={[0, Math.PI/2, 0]}>
            <Torus args={[2, 0.3, 16, 100]} position={[0, 0, -1]}><meshStandardMaterial color="#b45309" /></Torus>
            <Torus args={[2, 0.3, 16, 100]} position={[0, 0, 1]}><meshStandardMaterial color="#b45309" /></Torus>
          </group>
          <group ref={rotorRef}>
            {Array.from({ length: 12 }).map((_, i) => (
               <Sphere key={i} args={[0.1]} position={[Math.cos(i) * 1.2, Math.sin(i) * 1.2, 0]}>
                  <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
               </Sphere>
            ))}
          </group>
          <Cylinder args={[0.1, 0.1, 4]} rotation={[0, 0, Math.PI/2]}><meshStandardMaterial color="#94a3b8" /></Cylinder>
        </group>
      )}
    </group>
  );
}

function AIMathsPlaceholder({ highlight, name, formula }) {
  const isHigh = highlight !== "none";
  const hash = useMemo(() => getStringHash(name || "default"), [name]);
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  const type = hash % 3;

  return (
    <group>
      {formula && (
        <Html position={[0, 4, 0]} center zIndexRange={[100, 0]}>
          <div className="pointer-events-none px-6 py-3 bg-slate-900/90 backdrop-blur-2xl rounded-2xl border border-white/20 text-white font-black text-2xl tracking-widest shadow-[0_0_40px_rgba(255,255,255,0.15)] ring-1 ring-white/10 whitespace-nowrap">
            {formula}
          </div>
        </Html>
      )}
      <gridHelper args={[10, 10, "#475569", "#1e293b"]} position={[0, -3, 0]} />
      {type === 0 && (
        <mesh ref={meshRef}>
          <torusKnotGeometry args={[1.5, 0.5, 128, 16]} />
          <meshStandardMaterial color="#f472b6" wireframe={hash % 2 === 0} emissive="#f472b6" emissiveIntensity={isHigh ? 1 : 0.2} transparent opacity={0.8} />
        </mesh>
      )}
      {type === 1 && (
        <mesh ref={meshRef}>
          <sphereGeometry args={[2, 64, 64]} />
          <meshDistortMaterial color="#f472b6" speed={3} distort={0.5} wireframe />
        </mesh>
      )}
      {type === 2 && (
        <group ref={meshRef}>
          <axesHelper args={[5]} />
          {Array.from({ length: 6 }).map((_, i) => (
             <group key={i} rotation={[Math.sin(i)*Math.PI, Math.cos(i)*Math.PI, i]}>
                <arrowHelper args={[new THREE.Vector3(1, 1, 1).normalize(), new THREE.Vector3(0,0,0), 4, 0xfbbf24, 1, 0.4]} />
             </group>
          ))}
        </group>
      )}
    </group>
  );
}

// --- Data ---

const modelData = {
  physics: [
    { 
      id: "p1", 
      name: "Electric Circuit", 
      category: "Electricity", 
      Component: ElectricCircuitModel,
      explanation: "This model demonstrates the flow of electric charge (current) through a closed loop. The battery provides the potential difference that drives electrons through the conductive path.",
      observation: "Observe how the yellow particles (electrons) move at a constant speed along the wire. Notice they originate from the negative terminal and return to the positive terminal."
    },
    { 
      id: "p2", 
      name: "Magnetic Field", 
      category: "Magnetism", 
      Component: MagneticFieldModel,
      explanation: "Visualizes the invisible lines of magnetic force surrounding a bar magnet. The field is strongest at the poles and weakens with distance.",
      observation: "Notice the closed loops of the field lines. Observe how they emerge from the North pole (red) and enter the South pole (blue) in a symmetrical pattern."
    },
    { 
      id: "p3", 
      name: "Pendulum", 
      category: "Oscillations", 
      Component: PendulumModel,
      explanation: "A classic example of Simple Harmonic Motion (SHM). It demonstrates the continuous exchange between potential energy (at the peaks) and kinetic energy (at the center).",
      observation: "Watch the velocity changes: the bob moves fastest at the equilibrium position (bottom) and stops momentarily at the maximum displacement."
    },
    { 
      id: "p4", 
      name: "Projectile Motion", 
      category: "Mechanics", 
      Component: ProjectileMotionModel,
      explanation: "Shows an object moving under the influence of gravity alone. The horizontal motion remains constant while vertical motion is accelerated downward.",
      observation: "Observe the parabolic arc. Notice how the vertical height increases and decreases symmetrically, while the horizontal progress is steady."
    },
    { 
      id: "p5", 
      name: "Wave Motion", 
      category: "Waves", 
      Component: WaveMotionModel,
      explanation: "Demonstrates a transverse wave where individual particles oscillate perpendicular to the direction of energy propagation.",
      observation: "Focus on a single sphere. Notice it only moves up and down, but the overall 'wave pattern' appears to travel horizontally across the screen."
    },
    { 
      id: "p6", 
      name: "AC Generator", 
      category: "Electromagnetism", 
      Component: ACGeneratorModel,
      explanation: "Converts mechanical energy into electrical energy using Faraday's Law of Induction. A rotating coil in a magnetic field induces an alternating current.",
      observation: "Observe the yellow armature coil rotating between the red and blue magnets. In a real generator, this rotation would create a varying magnetic flux."
    },
    { 
      id: "p7", 
      name: "DC Motor", 
      category: "Electromagnetism", 
      Component: DCMotorModel,
      explanation: "Uses the magnetic force on a current-carrying wire to produce rotation. It's the inverse of a generator, converting electrical energy to mechanical work.",
      observation: "Notice the central rotor spinning. The interaction between the current in the coil and the external magnetic field creates a torque that drives the motion."
    },
    { 
      id: "p8", 
      name: "Lens Model", 
      category: "Optics", 
      Component: LensModel,
      explanation: "Demonstrates the principle of refraction. Light rays bend as they pass through a medium with a different refractive index, converging at a focal point.",
      observation: "Follow the yellow rays. Notice how they are parallel before entering the lens and converge to a single point (Focus) after passing through."
    },
    { 
      id: "p9", 
      name: "Pulley System", 
      category: "Mechanics", 
      Component: PulleySystemModel,
      explanation: "A simple machine that changes the direction of a force and can provide mechanical advantage, allowing heavy loads to be lifted with less effort.",
      observation: "Observe the vertical motion of the red block. Notice how the rope length and pulley rotation work together to translate the input force."
    },
    { 
      id: "p10", 
      name: "Solar System", 
      category: "Astrophysics", 
      Component: SolarSystemModel,
      explanation: "A scale-simplified model of gravitational orbits. Planets are kept in path by the balance between their inertia and the Sun's gravitational pull.",
      observation: "Compare the speeds of the Earth and the Moon. Notice how the Moon orbits the Earth while both simultaneously orbit the central Sun."
    },
  ],
  chemistry: [
    { 
      id: "c1", 
      name: "Hydrogen Atom", 
      category: "Atomic", 
      Component: (props) => <AtomStructure nucleusColor="#ef4444" shells={[1]} {...props} />,
      explanation: "The simplest element, consisting of one proton in the nucleus and one electron in the 1s orbital.",
      observation: "Observe the single electron orbit. In quantum mechanics, this represents a probability density cloud (1s orbital)."
    },
    { 
      id: "c2", 
      name: "Helium Atom", 
      category: "Atomic", 
      Component: (props) => <AtomStructure nucleusColor="#fbbf24" shells={[2]} {...props} />,
      explanation: "A noble gas with a completely filled first electron shell (1s²). This configuration makes it chemically inert.",
      observation: "Notice the two electrons sharing the same inner shell. This stability is the reason helium doesn't easily form bonds."
    },
    { 
      id: "c3", 
      name: "Carbon Atom", 
      category: "Atomic", 
      Component: (props) => <AtomStructure nucleusColor="#334155" shells={[2, 4]} {...props} />,
      explanation: "The backbone of organic chemistry. It has 4 valence electrons, allowing it to form 4 stable covalent bonds.",
      observation: "Observe the two shells. The outer shell has 4 electrons, which are the 'valence' electrons used in chemical reactions."
    },
    { 
      id: "c4", 
      name: "Oxygen Atom", 
      category: "Atomic", 
      Component: (props) => <AtomStructure nucleusColor="#ef4444" shells={[2, 6]} {...props} />,
      explanation: "A highly electronegative element with 6 valence electrons. It typically seeks to gain 2 more to complete its octet.",
      observation: "Notice the 6 electrons in the outer shell. Its high reactivity comes from its 'hunger' to fill those remaining two spots."
    },
    { 
      id: "c5", 
      name: "Water Molecule", 
      category: "Molecular", 
      Component: WaterModel,
      explanation: "A polar molecule (H₂O). The oxygen atom pulls electrons more strongly than hydrogen, creating a dipole.",
      observation: "Notice the V-shaped geometry. This 104.5° angle is caused by the repulsive force of oxygen's two lone pairs of electrons.",
      steps: [
        { title: "Meet Water 👋", highlight: "formation", formula: "H₂O", content: "Let's observe how water forms. It brings together one Oxygen and two Hydrogen atoms." },
        { title: "The Oxygen Atom", highlight: "atoms-O", formula: "H₂O", content: "This central red atom is Oxygen. It is highly electronegative, meaning it loves pulling electrons towards itself." },
        { title: "The Hydrogen Atoms", highlight: "atoms-H", formula: "H₂O", content: "These two smaller white atoms are Hydrogen. They share their single electron with Oxygen to form a bond." },
        { title: "Covalent Bonds", highlight: "bonds", formula: "H₂O", content: "These lines are polar covalent bonds. The electrons are shared, but Oxygen pulls them closer, creating a slight negative charge on Oxygen and positive on Hydrogen." },
        { title: "Bent Geometry", highlight: "none", formula: "H₂O", content: "Notice the shape? It's not a straight line! Oxygen has two 'lone pairs' of electrons pushing the hydrogen atoms down, creating this 'Bent' V-shape with a 104.5° angle." }
      ]
    },
    { 
      id: "c6", 
      name: "CO2 Molecule", 
      category: "Molecular", 
      Component: CO2Model,
      explanation: "Carbon Dioxide is a linear molecule. Despite having polar bonds, the overall molecule is non-polar due to its symmetry.",
      observation: "Observe the double bonds (double cylinders). The atoms are perfectly aligned in a straight line (180° angle).",
      steps: [
        { title: "Meet Carbon Dioxide 👋", highlight: "formation", formula: "CO₂", content: "Carbon Dioxide is the gas we exhale, and a vital molecule for plants." },
        { title: "The Carbon Center", highlight: "atoms-C", formula: "CO₂", content: "The central Carbon atom forms double bonds with both Oxygen atoms to fulfill its octet." },
        { title: "Double Bonds", highlight: "bonds", formula: "CO₂", content: "Notice the thick double connections? Each consists of one sigma and one pi bond." },
        { title: "Linear Geometry", highlight: "none", formula: "CO₂", content: "Unlike water, CO₂ has no lone pairs on the central Carbon to push the bonds around. The two double bonds repel each other exactly to opposite sides, creating a perfect 180° 'Linear' shape." }
      ]
    },
    { 
      id: "c7", 
      name: "Methane Molecule", 
      category: "Molecular", 
      Component: MethaneModel,
      explanation: "The simplest hydrocarbon (CH₄). The carbon atom undergoes sp³ hybridization to form four equivalent bonds.",
      observation: "Rotate the model to see the tetrahedral shape. Every H-C-H bond angle is exactly 109.5°, maximizing the distance between electrons.",
      steps: [
        { title: "Meet Methane 👋", highlight: "formation", formula: "CH₄", content: "Methane is the simplest organic molecule, the main component of natural gas." },
        { title: "The Carbon Core", highlight: "atoms-C", formula: "CH₄", content: "The central grey atom is Carbon. With 4 valence electrons, it wants to form 4 bonds to be stable." },
        { title: "Hydrogen Companions", highlight: "atoms-H", formula: "CH₄", content: "Four Hydrogen atoms bond with Carbon, each sharing one electron." },
        { title: "Tetrahedral Geometry", highlight: "bonds", formula: "CH₄", content: "Carbon undergoes sp³ hybridization. The 4 electron pairs repel each other equally in 3D space, forming a perfect 'Tetrahedron' with 109.5° bond angles." }
      ]
    },
    { 
      id: "c8", 
      name: "Benzene", 
      category: "Organic", 
      Component: BenzeneModel,
      explanation: "A classic aromatic ring (C₆H₆). The alternating single and double bonds represent resonance and electron delocalization.",
      observation: "Notice the hexagonal symmetry. The delocalized pi-electrons create a very stable structure compared to open-chain hydrocarbons."
    },
    { 
      id: "c9", 
      name: "Crystal Lattice", 
      category: "Solid State", 
      Component: CrystalLatticeModel,
      explanation: "Represents the ordered internal arrangement of atoms in a solid. This specific model shows a simple cubic lattice.",
      observation: "Observe how every atom has a fixed position. The repeating 'unit cell' determines the macroscopic properties of the material."
    },
    { 
      id: "c10", 
      name: "DNA Structure", 
      category: "Biochemistry", 
      Component: DNAHelixModel,
      explanation: "The double helix structure of Deoxyribonucleic acid. It consists of two strands winding around each other connected by base pairs.",
      observation: "Follow the two spiraling backbones. The horizontal bonds represent the hydrogen bonding between nitrogenous bases (A-T, G-C)."
    },
  ],
  maths: [
    { 
      id: "m1", 
      name: "Cube", 
      category: "Geometry", 
      Component: CubeModel,
      explanation: "A regular 3D solid with 6 square faces. It's one of the five Platonic solids, characterized by its perfect symmetry.",
      observation: "Notice that every edge length is equal and every interior angle is 90 degrees. It represents a 3D extension of a square."
    },
    { 
      id: "m2", 
      name: "Sphere", 
      category: "Geometry", 
      Component: SphereModel,
      explanation: "The set of all points in 3D space that are at a fixed distance (radius) from a central point.",
      observation: "Observe the perfect curvature. A sphere has the smallest surface area for a given volume, making it a frequent shape in nature."
    },
    { 
      id: "m3", 
      name: "Cone", 
      category: "Geometry", 
      Component: ConeModel,
      explanation: "Formed by a set of line segments connecting a common point (apex) to all points on a circular base.",
      observation: "Rotate to see the circular bottom and the single sharp vertex at the top. Its volume is exactly 1/3 of a cylinder with the same base."
    },
    { 
      id: "m4", 
      name: "Cylinder", 
      category: "Geometry", 
      Component: CylinderModel,
      explanation: "A solid with two identical circular bases connected by a curved surface. It is generated by rotating a rectangle around one edge.",
      observation: "Notice the two parallel circular faces. The distance between them is the height, and the curved surface area is 2πrh."
    },
    { 
      id: "m5", 
      name: "Pyramid", 
      category: "Geometry", 
      Component: PyramidModel,
      explanation: "A polyhedron with a polygonal base and triangular lateral faces that meet at a single apex.",
      observation: "This specific model has a square base. Notice how the 4 triangular sides converge upward. It's a key shape in geometry and architecture."
    },
    { 
      id: "m6", 
      name: "Coordinate Plane", 
      category: "Algebra", 
      Component: CoordinatePlaneModel,
      explanation: "A 3D Cartesian coordinate system using three perpendicular axes (X, Y, Z) to define any point in spatial volume.",
      observation: "Observe the three intersecting grid planes. Each plane (XY, YZ, XZ) divides the 3D space into 8 regions called octants."
    },
    { 
      id: "m7", 
      name: "Vector Visualization", 
      category: "Vectors", 
      Component: VectorVisualizationModel,
      explanation: "A mathematical object with both magnitude (length) and direction. Used to represent forces, velocities, and fields.",
      observation: "Notice the arrows. The direction they point and their length are their defining characteristics, independent of their starting position."
    },
    { 
      id: "m8", 
      name: "Parabola Graph", 
      category: "Algebra", 
      Component: ParabolaGraphModel,
      explanation: "The graph of a quadratic function (y = ax² + bx + c). It's a U-shaped curve that is symmetric about a central vertical axis.",
      observation: "Look at the lowest point (the vertex). Notice how the curve opens wider as you move away from the center along the X-axis."
    },
    { 
      id: "m9", 
      name: "Sine Wave Graph", 
      category: "Trigonometry", 
      Component: SineWaveGraphModel,
      explanation: "Represents periodic oscillation. It's the most basic waveform in nature, describing sound, light, and AC electricity.",
      observation: "Watch the animation. The peak (crest) and valley (trough) heights are constant. This periodic repetition is the core of trig functions."
    },
    { 
      id: "m10", 
      name: "3D Function Surface", 
      category: "Calculus", 
      Component: FunctionSurfaceModel,
      explanation: "Visualizes a function of two variables z = f(x, y). The height (Z) depends on the spatial position on the XY plane.",
      observation: "Observe the peaks and valleys on the surface. These represent local maxima and minima, key concepts in multivariable calculus."
    },
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
  const { currentUser } = useAuth();
  const meta = subjectMeta[subject] || subjectMeta.physics;
  const models = modelData[subject] || modelData.physics;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [showConcept, setShowConcept] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [customModels, setCustomModels] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // { success: boolean, message: string }
  const { loading: authLoading } = useAuth();

  // Reset selected model when subject changes
  useEffect(() => {
    setSelectedModel(models[0]);
    setShowConcept(false);
    setIsSimulating(false);
    setSearchQuery("");
  }, [subject, models]);

  useEffect(() => {
    const loadCustom = async () => {
      if (currentUser) {
        // Run cleanup first to remove any accidental duplicates from DB
        await cleanupCustomModels(currentUser.uid, subject);
        
        // Fetch deduplicated models
        const data = await getCustomModels(currentUser.uid, subject);
        const mapped = data.map(m => ({
          ...m,
          Component: m.subject === "chemistry" ? AIChemistryPlaceholder 
                   : m.subject === "physics" ? AIPhysicsPlaceholder 
                   : AIMathsPlaceholder
        }));
        setCustomModels(mapped);
      }
    };
    loadCustom();
  }, [currentUser, subject]);

  const handleSaveModel = async () => {
    if (!selectedModel || !selectedModel.isAi) return;
    
    if (authLoading) {
      setSaveStatus({ success: false, message: "Checking login..." });
      return;
    }

    if (!currentUser) {
      setSaveStatus({ success: false, message: "Please login to save model" });
      return;
    }

    const result = await saveCustomModel(currentUser.uid, selectedModel, subject);
    setSaveStatus(result);

    if (result.success) {
      // Refresh custom models list
      const data = await getCustomModels(currentUser.uid, subject);
      const mapped = data.map(m => ({
        ...m,
        Component: m.subject === "chemistry" ? AIChemistryPlaceholder 
                 : m.subject === "physics" ? AIPhysicsPlaceholder 
                 : AIMathsPlaceholder
      }));
      setCustomModels(mapped);
      
      // Wait to show success message before closing
      setTimeout(() => {
        setShowSaveModal(false);
        setSaveStatus(null);
      }, 1500);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setShowGallery(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getSimulationSteps = (model) => {
    if (model.steps) return model.steps;
    
    // AI or Dynamic Step Generation
    if (model.isAi) {
      if (model.subject === "chemistry") {
        return [
          { title: `Exploring ${model.name} 👋`, highlight: "formation", formula: model.name, content: `Let's break down the molecular structure of ${model.name}. In JEE Chemistry, visualizing spatial geometry is the first step to mastering reactivity.` },
          { title: "Central Core", highlight: "atom-0", formula: model.name, content: "This is the central atom. Its hybridization (sp, sp², sp³, etc.) determines the bond angles and the overall symmetry of the molecule." },
          { title: "Peripheral Atoms", highlight: "atoms", formula: model.name, content: "These atoms are bonded to the center. Notice their distribution—they position themselves as far apart as possible to minimize electron repulsion (VSEPR theory)." },
          { title: "Bonding Framework", highlight: "bonds", formula: model.name, content: "These cylinders represent covalent bonds. The strength and length of these bonds depend on the overlapping orbitals." },
          { title: "JEE Summary 🎯", highlight: "none", formula: model.name, content: `Mastering ${model.name} involves understanding its dipole moment and symmetry. JEE Advanced often tests these concepts through coordination compounds or organic mechanisms.` }
        ];
      }
      if (model.subject === "physics") {
        return [
          { title: `Physics of ${model.name} ⚙️`, highlight: "formation", formula: model.name, content: `Welcome! Let's examine the mechanical/electrical components of ${model.name}. Understanding the physical framework is key to solving numericals.` },
          { title: "Primary Apparatus", highlight: "primary", formula: model.name, content: "This is the main structural component where the physical interaction occurs. Focus on the geometry and material properties." },
          { title: "Functional Interaction", highlight: "secondary", formula: model.name, content: "Notice how these parts interact. Whether it's magnetic flux, optical refraction, or mechanical torque, this is where the physics 'happens'." },
          { title: "Detailed Observation", highlight: "detail", formula: model.name, content: "Look closely at the movement or fields. In JEE, we often assume ideal conditions here (no friction, uniform fields)." },
          { title: "JEE Insight 🎯", highlight: "none", formula: model.name, content: `Questions on ${model.name} usually involve conservation laws or field equations. Use this visual to map your free-body diagrams or circuit loops.` }
        ];
      }
      if (model.subject === "maths") {
        return [
          { title: `Mathematical ${model.name} 📐`, highlight: "formation", formula: "y = f(x,z)", content: `Let's visualize the geometric properties of ${model.name}. Spatial reasoning is a massive advantage in JEE Calculus and Geometry.` },
          { title: "Primary Geometry", highlight: "primary", formula: "z = f(x,y)", content: "This is the core locus or surface. Every point follows a specific coordinate equation." },
          { title: "Skeleton & Planes", highlight: "secondary", formula: "P(x,y,z)", content: "Notice the grid and skeletal structure. This helps us understand the boundaries and symmetry of the function." },
          { title: "Vertex & Critical Points", highlight: "detail", formula: "df/dx = 0", content: "Focus on the extreme points or vertices. These are often the 'answer' in optimization or coordinate geometry problems." },
          { title: "JEE Mastery 🎯", highlight: "none", formula: "QED", content: `Visualizing ${model.name} helps you solve complex integration or 3D geometry problems without getting lost in the algebra.` }
        ];
      }
    }

    const expl = model.explanation || `This visualizes the concepts of ${model.category}.`;
    const obs = model.observation || `Zoom in and rotate to observe the spatial properties.`;
    
    const explSentences = expl.match(/[^.!?]+[.!?]+/g) || [expl];
    const obsSentences = obs.match(/[^.!?]+[.!?]+/g) || [obs];

    const step1Expl = explSentences[0]?.trim();
    const step2Expl = explSentences.slice(1).join(" ").trim();
    
    const step1Obs = obsSentences[0]?.trim();
    const step2Obs = obsSentences.slice(1).join(" ").trim();

    const steps = [
      { 
        title: "Welcome! 👋", 
        highlight: "none",
        content: `Hello future engineer! Let's break down the ${model.name}. Go ahead—click and drag to rotate it and get a feel for the 3D space.` 
      },
      { 
        title: "The Core Idea", 
        highlight: "primary",
        content: `${step1Expl} Think of it as a logical, real-world system rather than just textbook theory.` 
      }
    ];

    if (step2Expl) {
      steps.push({ 
        title: "How it works ⚙️", 
        highlight: "secondary",
        content: `${step2Expl} Everything follows strict mathematical and physical laws.` 
      });
    }

    steps.push({ 
      title: "Look at this part 👀", 
      highlight: "detail",
      content: `${step1Obs} Focus closely on that specific interaction.` 
    });

    if (step2Obs) {
      steps.push({ 
        title: "Notice the pattern", 
        highlight: "detail",
        content: `${step2Obs} This is exactly what your formulas are trying to calculate.` 
      });
    }

    steps.push(
      { 
        title: "JEE Relevance 🎯", 
        highlight: "none",
        content: `Why do we care? JEE loves asking tricky questions on ${model.category}. Visualizing this model in your head saves you from making silly formula mistakes during the exam.` 
      },
      { 
        title: "Mental Check ✅", 
        highlight: "none",
        content: `Does it make sense? Play with the simulation until you can close your eyes and picture it perfectly. Then you're ready to move on!` 
      }
    );

    return steps;
  };

  const { items: filteredModels, topConfidence, bestMatch, hasExactFullMatch } = useMemo(() => {
    const standard = models;
    const custom = customModels.filter(m => m.subject === subject);
    return intelligentSearch([...standard, ...custom], searchQuery, ['name']);
  }, [models, customModels, searchQuery, subject]);

  // Auto-select model if confidence is high
  useEffect(() => {
    if (searchQuery.length > 3 && topConfidence > 0.85 && bestMatch && bestMatch.id !== selectedModel.id) {
      setSelectedModel(bestMatch);
      setShowConcept(false);
      if (isMobile) setShowGallery(false);
    }
  }, [searchQuery, topConfidence, bestMatch, selectedModel.id, isMobile]);

  const generateAiModel = () => {
    if (!searchQuery.trim()) return;

    const id = `ai-${Date.now()}`;
    const name = searchQuery.trim();
    
    const AiComp = subject === "chemistry" ? AIChemistryPlaceholder 
                 : subject === "physics" ? AIPhysicsPlaceholder 
                 : AIMathsPlaceholder;

    const newModel = {
      id,
      name,
      category: "AI Generated",
      subject,
      isAi: true,
      Component: AiComp,
      explanation: `This model provides a procedural visualization of ${name} within the context of JEE ${subject}. It is designed to help you map theoretical equations to a spatial framework.`,
      observation: `The geometry highlights the symmetry and spatial distribution of ${name}. In the exam, use this mental image to determine ${subject === 'chemistry' ? 'bond polarities and geometries' : subject === 'physics' ? 'vector fields and force directions' : 'function limits and surface boundaries'}.`
    };

    setCustomModels(prev => [...prev, newModel]);
    setSelectedModel(newModel);
    setShowConcept(false);
    setShowSaveModal(true);
    setSaveStatus(null);
  };

  // Handle case where subject changed but selectedModel is from old subject
  const currentModel = useMemo(() => {
    const found = filteredModels.find(m => m.id === selectedModel.id);
    return found || filteredModels[0] || models[0];
  }, [filteredModels, selectedModel, models]);

  // Sync concept panel state when model changes
  useEffect(() => {
    setShowConcept(false);
  }, [currentModel.id]);

  const ActiveModel = currentModel.Component;

  return (
    <div className="min-h-screen bg-slate-950 pb-20 overflow-x-hidden">
      <PageHeader
        title={meta.title}
        subtitle={`Interactive spatial visualizations for JEE ${subject}.`}
        icon={<meta.icon size={24} className={meta.color} />}
      />

      <div className="mx-auto max-w-[1600px] px-4 md:px-8">
        {/* Mobile Gallery Toggle */}
        <div className="mb-4 flex lg:hidden">
          <button
            onClick={() => setShowGallery(true)}
            className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-300 transition hover:bg-white/10"
          >
            <div className="flex items-center gap-3">
              <Menu size={20} />
              <span className="text-sm font-black uppercase tracking-widest">Browse Models</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500">{filteredModels.length} Models</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 relative">
          
          {/* Left: Model Grid Selection (Collapsible on Mobile) */}
          <AnimatePresence>
            {(!isMobile || showGallery) && (
              <motion.div 
                initial={isMobile ? { x: -300, opacity: 0 } : false}
                animate={{ x: 0, opacity: 1 }}
                exit={isMobile ? { x: -300, opacity: 0 } : false}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={`${
                  isMobile 
                    ? "fixed inset-y-0 left-0 z-[60] w-[85%] bg-slate-950 p-6 shadow-2xl overflow-y-auto" 
                    : "lg:col-span-4 space-y-6"
                }`}
              >
                {isMobile && (
                  <div className="mb-8 flex items-center justify-between">
                    <h3 className="text-xl font-black text-white">Model Gallery</h3>
                    <button onClick={() => setShowGallery(false)} className="rounded-xl bg-white/5 p-2 text-slate-400">
                      <X size={20} />
                    </button>
                  </div>
                )}

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

                <div className="premium-surface lg:max-h-[700px] overflow-y-auto rounded-[2.5rem] border border-white/10 p-4 custom-scrollbar">
                  <div className="px-2 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Model Gallery
                  </div>
                  <div className="grid grid-cols-2 gap-3 pb-20 lg:pb-0">
                    {filteredModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model);
                          setShowConcept(false);
                          if (isMobile) setShowGallery(false);
                        }}
                        className={`group relative flex flex-col items-center rounded-2xl p-4 text-center transition-all ${
                          currentModel.id === model.id 
                            ? "bg-white/10 ring-1 ring-white/20" 
                            : "bg-white/[0.02] hover:bg-white/5"
                        }`}
                      >
                        {model.isAi && (
                          <div className="absolute top-2 right-2 rounded-full bg-electric/20 px-1.5 py-0.5 text-[7px] font-black uppercase text-electric ring-1 ring-electric/30">
                            AI
                          </div>
                        )}
                        <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 transition-transform group-hover:scale-110 ${currentModel.id === model.id ? meta.color : "text-slate-400"}`}>
                          {model.isAi ? <Sparkles size={18} className="text-electric" /> : <BoxIcon size={20} />}
                        </div>
                        <span className={`text-[11px] font-black leading-tight ${currentModel.id === model.id ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}>
                          {model.name}
                        </span>
                      </button>
                    ))}
                    
                    {!hasExactFullMatch && searchQuery.trim().length > 0 && (
                      <button
                        onClick={generateAiModel}
                        className="col-span-2 group flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 p-8 text-center transition-all hover:bg-white/10 hover:border-electric"
                      >
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-electric/10 text-electric shadow-[0_0_20px_rgba(0,245,255,0.15)] group-hover:scale-110 transition-transform">
                          <Sparkles size={28} />
                        </div>
                        <p className="text-sm font-black text-white">Generate model</p>
                        <p className="mt-1 text-[11px] font-bold text-slate-500">"{searchQuery}"</p>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Backdrop for mobile drawer */}
          {showGallery && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGallery(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />
          )}

          {/* Right: Viewer Area */}
          <div className="lg:col-span-8 space-y-6">
            <div className="relative aspect-[4/5] sm:aspect-video lg:aspect-auto lg:h-[750px] overflow-hidden rounded-[3rem] border border-white/10 bg-slate-900/40 backdrop-blur-3xl shadow-2xl">
              <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
              
              <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color={meta.theme === 'cyan' ? '#00f5ff' : meta.theme === 'teal' ? '#2dd4bf' : '#f472b6'} />
                
                <Suspense fallback={null}>
                  <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                    <Center>
                      <ActiveModel 
                        highlight={isSimulating ? getSimulationSteps(currentModel)[simStep].highlight : "none"} 
                        formula={isSimulating ? getSimulationSteps(currentModel)[simStep].formula : undefined}
                        name={currentModel.name}
                      />
                    </Center>
                  </Float>
                  <OrbitControls enablePan={false} minDistance={2} maxDistance={20} />
                </Suspense>
              </Canvas>

              {/* Viewer UI Overlays */}
              <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-10">
                <motion.div
                  key={currentModel.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl sm:rounded-2xl border border-white/10 bg-black/60 p-3 sm:p-5 backdrop-blur-xl"
                >
                  <h3 className="text-sm sm:text-xl font-black text-white">{currentModel.name}</h3>
                  <p className="text-[9px] sm:text-xs font-bold text-slate-400 mt-0.5 sm:mt-1 uppercase tracking-wider">{currentModel.category}</p>
                </motion.div>
              </div>

              <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-10 flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3">
                <button 
                  onClick={() => { setIsSimulating(true); setSimStep(0); setShowConcept(false); }}
                  className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl bg-white px-4 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-black text-slate-950 transition hover:bg-slate-200 shadow-lg active:scale-95"
                >
                  <Play size={14} className="sm:w-[18px] sm:h-[18px]" fill="currentColor" />
                  Simulate
                </button>
              </div>

              <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 z-10">
                 <button 
                  onClick={() => setShowConcept(!showConcept)}
                  className={`flex items-center gap-2 rounded-xl sm:rounded-2xl border px-3 py-2.5 sm:px-4 sm:py-3 text-[9px] sm:text-[11px] font-black uppercase tracking-widest transition backdrop-blur-xl active:scale-95 ${
                    showConcept 
                      ? "border-white/40 bg-white text-slate-950" 
                      : "border-white/10 bg-black/60 text-slate-300 hover:text-white"
                  }`}
                 >
                   <Info size={12} className="sm:w-[14px] sm:h-[14px]" /> {showConcept ? "Close" : "Concept"}
                 </button>
              </div>

              {/* Concept Deep-Dive Panel */}
              <AnimatePresence>
                {showConcept && (
                  <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    className="absolute inset-y-0 right-0 z-20 w-full sm:w-96 border-l border-white/10 bg-slate-950/80 p-8 backdrop-blur-2xl"
                  >
                    <div className="flex items-center justify-between mb-8">
                       <div>
                         <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${meta.color}`}>JEE {subject}</p>
                         <h2 className="text-2xl font-black text-white mt-1">{currentModel.name}</h2>
                       </div>
                       <button 
                        onClick={() => setShowConcept(false)}
                        className="p-2 rounded-full hover:bg-white/10 text-slate-400 transition"
                       >
                         <X size={20} />
                       </button>
                    </div>

                    <div className="space-y-8 overflow-y-auto max-h-[calc(100vh-250px)] pr-2 custom-scrollbar">
                       <section>
                         <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-widest mb-3">How it works</h4>
                         <p className="text-sm font-medium leading-relaxed text-slate-300">
                           {currentModel.explanation}
                         </p>
                       </section>

                       <section>
                         <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-widest mb-3">Key Observation</h4>
                         <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                           <p className="text-xs font-bold leading-relaxed text-slate-400">
                             {currentModel.observation}
                           </p>
                         </div>
                       </section>

                       <section>
                         <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-widest mb-3">Parts Explained</h4>
                         <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                           <div className="flex items-center gap-3">
                              <div className={`h-2 w-2 rounded-full ${meta.color} bg-current`} />
                              <p className="text-[10px] font-black text-white uppercase tracking-wider">Main Body</p>
                           </div>
                           <p className="text-[11px] font-bold text-slate-400 leading-tight">The primary structure that defines the physical or mathematical locus.</p>
                           <div className="flex items-center gap-3 pt-2">
                              <div className="h-2 w-2 rounded-full bg-slate-500" />
                              <p className="text-[10px] font-black text-white uppercase tracking-wider">Connectors/Skeleton</p>
                           </div>
                           <p className="text-[11px] font-bold text-slate-400 leading-tight">The framework providing support and showing internal symmetry.</p>
                         </div>
                       </section>

                       <section>
                         <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-widest mb-3">JEE Relevance</h4>
                         <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-4">
                           <p className="text-xs font-bold leading-relaxed text-teal-400">
                             Mastering this visualization allows you to solve advanced problems on {currentModel.name} by correctly mapping the theory to spatial vectors and equations.
                           </p>
                         </div>
                       </section>

                       <section>
                         <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-widest mb-3">Model Stats</h4>
                         <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-white/[0.03] p-3">
                               <p className="text-[9px] font-black uppercase text-slate-600 mb-1">Precision</p>
                               <p className="text-xs font-black text-white">1:1 Conceptual</p>
                            </div>
                            <div className="rounded-xl bg-white/[0.03] p-3">
                               <p className="text-[9px] font-black uppercase text-slate-600 mb-1">Complexity</p>
                               <p className="text-xs font-black text-white">JEE Advanced</p>
                            </div>
                         </div>
                       </section>
                    </div>

                    <div className="absolute bottom-8 left-8 right-8">
                       <button 
                        onClick={() => setShowConcept(false)}
                        className="w-full py-4 rounded-2xl bg-white text-slate-950 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition"
                       >
                         Understood
                       </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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

      {/* Fullscreen Simulation Overlay */}
      <AnimatePresence>
        {isSimulating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col bg-slate-950 text-white"
          >
            {/* Header */}
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-slate-900/50 px-6 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <BoxIcon className={meta.color} size={20} />
                <h2 className="text-lg font-black">{currentModel.name} - Simulation</h2>
              </div>
              <button 
                onClick={() => setIsSimulating(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black transition hover:bg-white/10 hover:text-rose-400"
              >
                Exit Simulation
              </button>
            </header>
            
            {/* Main Content */}
            <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
              {/* 3D Viewer */}
              <div className="relative flex-1 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] h-1/2 lg:h-auto">
                <Canvas shadows>
                  <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
                  <ambientLight intensity={0.5} />
                  <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                  <pointLight position={[-10, -10, -10]} intensity={0.5} color={meta.theme === 'cyan' ? '#00f5ff' : meta.theme === 'teal' ? '#2dd4bf' : '#f472b6'} />
                  
                  <Suspense fallback={null}>
                    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                      <Center>
                        <ActiveModel 
                          highlight={getSimulationSteps(currentModel)[simStep].highlight} 
                          formula={getSimulationSteps(currentModel)[simStep].formula}
                          name={currentModel.name}
                        />
                      </Center>
                    </Float>
                    <OrbitControls enablePan={false} minDistance={2} maxDistance={20} makeDefault />
                  </Suspense>
                </Canvas>
              </div>

              {/* Steps Panel */}
              <div className="w-full lg:w-96 shrink-0 border-t lg:border-t-0 lg:border-l border-white/10 bg-slate-900/50 p-6 lg:p-8 backdrop-blur-md flex flex-col overflow-y-auto h-1/2 lg:h-auto">
                <div className="mb-6 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Step {simStep + 1} of {getSimulationSteps(currentModel).length}</span>
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={simStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1"
                  >
                    <h3 className={`text-2xl font-black mb-4 ${meta.color}`}>
                      {getSimulationSteps(currentModel)[simStep].title}
                    </h3>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <p className="text-sm font-medium leading-relaxed text-slate-300">
                        {getSimulationSteps(currentModel)[simStep].content}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-8 flex gap-3 shrink-0">
                  <button
                    disabled={simStep === 0}
                    onClick={() => setSimStep(s => Math.max(0, s - 1))}
                    className="flex-1 rounded-2xl border border-white/10 bg-black/40 py-4 text-xs font-black transition hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-black/40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={simStep === getSimulationSteps(currentModel).length - 1}
                    onClick={() => setSimStep(s => Math.min(getSimulationSteps(currentModel).length - 1, s + 1))}
                    className="flex-1 rounded-2xl bg-white text-slate-950 py-4 text-xs font-black transition hover:bg-slate-200 disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative"
            >
              <div className="relative z-10 text-center">
                <div className="mb-6 mx-auto h-16 w-16 rounded-full bg-electric/10 flex items-center justify-center">
                  <Sparkles size={32} className="text-electric" />
                </div>
                
                <h3 className="text-2xl font-black text-white mb-2">Save this model?</h3>
                <p className="text-slate-400 text-sm mb-8">
                  Would you like to add <span className="text-white font-bold">"{selectedModel?.name}"</span> to your personal gallery for quick access?
                </p>

                {saveStatus ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-8 p-4 rounded-2xl border ${saveStatus.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}
                  >
                    <p className="text-sm font-black uppercase tracking-widest">{saveStatus.message}</p>
                  </motion.div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleSaveModel}
                      className="w-full py-4 rounded-2xl bg-electric text-slate-950 text-sm font-black uppercase tracking-widest hover:scale-[1.02] transition-all"
                    >
                      Save to Gallery
                    </button>
                    <button
                      onClick={() => setShowSaveModal(false)}
                      className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-sm font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      Let it go
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default Models;