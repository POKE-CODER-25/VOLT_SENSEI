import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

function RipplingSurface() {
  const meshRef = useRef();
  
  // Create a grid geometry
  const { geometry, count } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(12, 12, 64, 64);
    return { geometry: geo, count: geo.attributes.position.count };
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const pos = meshRef.current.geometry.attributes.position;
    
    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      
      // Multi-wave function for organic mathematical rippling
      const z = Math.sin(Math.sqrt(x * x + y * y) - time * 2) * 0.8 + 
                Math.cos(x * 0.5 + time) * 0.4;
      
      pos.setZ(i, z);
    }
    
    pos.needsUpdate = true;
    meshRef.current.rotation.z = time * 0.1;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 3, 0, 0]}>
      <meshStandardMaterial 
        color="#f472b6" 
        wireframe 
        transparent 
        opacity={0.4} 
        emissive="#f472b6"
        emissiveIntensity={0.5}
      />
      <meshStandardMaterial 
        color="#ec4899" 
        transparent 
        opacity={0.1} 
        side={THREE.DoubleSide} 
      />
    </mesh>
  );
}

function CoordinateGrid() {
  return (
    <group>
      <gridHelper args={[20, 20, "#ec4899", "#334155"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -2]} />
      <axesHelper args={[10]} />
    </group>
  );
}

function MathsVisualSection() {
  return (
    <section className="relative w-full overflow-hidden bg-slate-950 px-4 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-24">
          
          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-center lg:text-left z-10"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-400 mb-6">Abstract Geometry</p>
            <h2 className="text-5xl font-black text-white md:text-7xl tracking-tighter leading-[0.9]">
              Logical <br />
              <span className="text-pink-400 glow-text-strong">Precision</span>
            </h2>
            <p className="mt-8 text-lg font-medium leading-relaxed text-slate-400 max-w-xl mx-auto lg:mx-0">
              Transform abstract calculus into tangible 3D manifolds. Visualize slopes, areas, and transformations in high-fidelity coordinate space.
            </p>
            
            <div className="mt-12 grid grid-cols-2 gap-4 max-w-lg mx-auto lg:mx-0">
               <div className="rounded-2xl border border-pink-500/20 bg-pink-500/5 p-5 backdrop-blur-3xl shadow-2xl">
                  <p className="text-[9px] font-black uppercase text-pink-500 tracking-widest mb-2">Algorithm</p>
                  <p className="text-sm font-black text-white tracking-tighter uppercase">Fourier Synthesis</p>
               </div>
               <div className="rounded-2xl border border-slate-800 bg-white/5 p-5 backdrop-blur-3xl shadow-2xl">
                  <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-2">Complexity</p>
                  <p className="text-sm font-black text-white tracking-tighter uppercase">R³ Topology</p>
               </div>
               <div className="rounded-2xl border border-slate-800 bg-white/5 p-5 backdrop-blur-3xl shadow-2xl">
                  <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-2">Vector</p>
                  <p className="text-sm font-black text-white tracking-tighter uppercase">Normal Mapping</p>
               </div>
               <div className="rounded-2xl border border-pink-500/20 bg-pink-500/5 p-5 backdrop-blur-3xl shadow-2xl">
                  <p className="text-[9px] font-black uppercase text-pink-500 tracking-widest mb-2">Status</p>
                  <p className="text-sm font-black text-white tracking-tighter uppercase">Active Plot</p>
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
            <div className="absolute -inset-4 bg-pink-500/10 blur-[60px] rounded-full group-hover:bg-pink-500/20 transition-all duration-700" />
            <div className="relative h-full w-full rounded-[3rem] border border-white/10 bg-slate-900/40 backdrop-blur-3xl overflow-hidden shadow-2xl ring-1 ring-white/5">
              <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#f472b6" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />
                
                <CoordinateGrid />
                <RipplingSurface />
              </Canvas>
              
              {/* Overlay HUD */}
              <div className="absolute top-6 right-6 flex flex-col items-end gap-1">
                <div className="h-1 w-12 bg-pink-500/50 rounded-full" />
                <div className="h-1 w-8 bg-pink-500/30 rounded-full" />
              </div>
              <div className="absolute bottom-6 left-6 text-[8px] font-black text-pink-500/50 uppercase tracking-widest">
                Active Simulation_Math.01
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

export default MathsVisualSection;
