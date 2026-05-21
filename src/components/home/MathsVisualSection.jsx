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
    <section className="relative h-[650px] w-full overflow-hidden bg-slate-950 px-4 py-24 md:px-8">
      {/* Background 3D View */}
      <div className="absolute inset-0 z-0 opacity-30 lg:opacity-50">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#f472b6" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />
          
          <CoordinateGrid />
          <RipplingSurface />
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-400 mb-6">Abstract Geometry</p>
          <h2 className="text-5xl font-black text-white md:text-7xl lg:text-8xl tracking-tighter">
            Logical <span className="text-pink-400 glow-text-strong">Precision</span>
          </h2>
          <p className="mt-8 text-lg font-medium leading-relaxed text-slate-400 max-w-2xl mx-auto">
            Transform abstract calculus into tangible 3D manifolds. Visualize slopes, areas, and transformations in high-fidelity coordinate space.
          </p>
          
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
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
      </div>

      {/* Aesthetic Overlays */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-slate-950 via-slate-950/80 to-transparent" />
    </section>
  );
}

export default MathsVisualSection;
