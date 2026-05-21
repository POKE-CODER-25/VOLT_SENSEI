import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Torus, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function Electron({ radius, speed, offset, color }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const angle = time * speed + offset;
    
    // Create an elliptical orbit
    meshRef.current.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * 0.4,
      Math.sin(angle) * radius
    );
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={2} 
        />
        <pointLight color={color} intensity={0.5} distance={2} />
      </mesh>
      <Torus args={[radius, 0.01, 16, 100]} rotation={[Math.PI / 2, 0.3, 0]}>
        <meshBasicMaterial color={color} transparent opacity={0.1} />
      </Torus>
    </group>
  );
}

function AtomStructure() {
  const groupRef = useRef();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      mouse.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      // Base rotation
      groupRef.current.rotation.y += 0.005;
      
      // Mouse tilt
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouse.current.y * 0.3, 0.05);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -mouse.current.x * 0.3, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Nucleus */}
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <Sphere args={[0.5, 32, 32]}>
          <meshStandardMaterial 
            color="#00f5ff" 
            emissive="#00f5ff" 
            emissiveIntensity={2} 
            metalness={0.8}
            roughness={0.2}
          />
        </Sphere>
      </Float>

      {/* Orbiting Electrons */}
      <Electron radius={2.5} speed={1.2} offset={0} color="#00f5ff" />
      <Electron radius={3.5} speed={0.8} offset={Math.PI / 3} color="#f472b6" />
      <Electron radius={4.5} speed={0.6} offset={Math.PI / 1.5} color="#fbbf24" />
      
      {/* Ambient Grid for depth */}
      <gridHelper args={[20, 20, "#1e293b", "#0f172a"]} position={[0, -5, 0]} />
    </group>
  );
}

function InteractivePhysicsHero() {
  return (
    <div className="absolute inset-0 z-0 opacity-40 lg:opacity-60 pointer-events-none">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={50} />
        <ambientLight intensity={0.2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <AtomStructure />
      </Canvas>
    </div>
  );
}

export default InteractivePhysicsHero;
