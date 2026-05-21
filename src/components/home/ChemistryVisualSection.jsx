import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sphere, PerspectiveCamera, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

function MoleculeNode({ position, color, onHover }) {
  const meshRef = useRef();
  
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh 
        position={position} 
        ref={meshRef}
        onPointerOver={() => onHover(true)}
        onPointerOut={() => onHover(false)}
      >
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={1} 
          metalness={0.9}
          roughness={0.1}
        />
        <pointLight color={color} intensity={0.5} distance={3} />
      </mesh>
    </Float>
  );
}

function BondingLine({ start, end, active }) {
  const lineRef = useRef();
  
  useFrame(() => {
    if (lineRef.current) {
      lineRef.current.geometry.setFromPoints([
        new THREE.Vector3(...start),
        new THREE.Vector3(...end)
      ]);
    }
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry attach="geometry" />
      <lineBasicMaterial 
        attach="material" 
        color={active ? "#34d399" : "#10b981"} 
        opacity={active ? 0.8 : 0.2} 
        transparent 
        linewidth={2} 
      />
    </line>
  );
}

function MolecularNetwork() {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef();
  
  const nodes = useMemo(() => [
    { pos: [0, 0, 0], color: "#10b981" },
    { pos: [2, 1.5, -1], color: "#34d399" },
    { pos: [-2, 1, 1], color: "#059669" },
    { pos: [1, -2, 0.5], color: "#10b981" },
    { pos: [-1.5, -1.5, -2], color: "#34d399" },
    { pos: [3, -0.5, -2], color: "#059669" },
    { pos: [-3, -1, -1], color: "#10b981" },
  ], []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <MoleculeNode 
          key={i} 
          position={node.pos} 
          color={node.color} 
          onHover={setHovered}
        />
      ))}
      
      {/* Dynamic Bonds */}
      {nodes.map((node, i) => 
        nodes.slice(i + 1).map((target, j) => {
          const dist = new THREE.Vector3(...node.pos).distanceTo(new THREE.Vector3(...target.pos));
          if (dist < 4) {
            return <BondingLine key={`${i}-${j}`} start={node.pos} end={target.pos} active={hovered} />;
          }
          return null;
        })
      )}
    </group>
  );
}

function ChemistryVisualSection() {
  return (
    <section className="relative w-full overflow-hidden bg-slate-950 px-4 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-center lg:text-left z-10"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-6">Molecular Engineering</p>
            <h2 className="text-5xl font-black text-white md:text-7xl tracking-tighter leading-[0.9]">
              Next-Gen <br />
              <span className="text-emerald-400 glow-text-strong">Chemistry</span>
            </h2>
            <p className="mt-8 text-lg font-medium leading-relaxed text-slate-400 max-w-xl mx-auto lg:mx-0">
              Interact with live molecular simulations. Our proprietary engine renders covalent bonds and reaction pathways with atomic precision.
            </p>
            
            <div className="mt-12 flex flex-wrap justify-center lg:justify-start gap-4">
               <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-8 py-4 backdrop-blur-3xl shadow-2xl">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">Covalent Intelligence</span>
               </div>
               <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-8 py-4 backdrop-blur-3xl shadow-2xl">
                  <div className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                  <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">Orbital Mapping</span>
               </div>
            </div>
          </motion.div>

          {/* Simulation Box */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 w-full aspect-square max-w-[500px] relative group"
          >
            <div className="absolute -inset-4 bg-emerald-500/10 blur-[60px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-700" />
            <div className="relative h-full w-full rounded-[3rem] border border-white/10 bg-slate-900/40 backdrop-blur-3xl overflow-hidden shadow-2xl ring-1 ring-white/5">
              <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
                <MolecularNetwork />
              </Canvas>
              
              {/* Overlay HUD */}
              <div className="absolute top-6 left-6 flex flex-col gap-1">
                <div className="h-1 w-12 bg-emerald-500/50 rounded-full" />
                <div className="h-1 w-8 bg-emerald-500/30 rounded-full" />
              </div>
              <div className="absolute bottom-6 right-6 text-[8px] font-black text-emerald-500/50 uppercase tracking-widest">
                Active Simulation_Chem.01
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Aesthetic Overlays */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />
    </section>
  );
}

export default ChemistryVisualSection;
