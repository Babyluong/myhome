import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function ClinicalPrism(): JSX.Element {
  const meshRef = useRef<THREE.Mesh>(null!);
  const wireRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.25;
    }
    if (wireRef.current) {
      wireRef.current.rotation.x -= delta * 0.15;
      wireRef.current.rotation.y -= delta * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={1.2}>
      <group>
        {/* Outer translucent geometric body */}
        <mesh ref={meshRef} scale={1.15}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#0ea5e9"
            emissive="#0284c7"
            emissiveIntensity={0.12}
            roughness={0.2}
            metalness={0.8}
            wireframe={false}
            transparent
            opacity={0.35}
          />
        </mesh>
        {/* Inner wireframe lattice */}
        <mesh ref={wireRef} scale={1.35}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#2dd4bf"
            wireframe
            transparent
            opacity={0.2}
          />
        </mesh>
      </group>
    </Float>
  );
}

export function HeroScene(): JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-10"
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#38bdf8" />
        <pointLight position={[-10, -10, -5]} intensity={0.8} color="#2dd4bf" />
        <ClinicalPrism />
      </Canvas>
    </div>
  );
}

export default HeroScene;
