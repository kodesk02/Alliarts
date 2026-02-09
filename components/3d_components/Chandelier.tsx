"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type ChandelierProps = {
  position: [number, number, number];
};

export default function Chandelier({ position }: ChandelierProps) {
  const groupRef = useRef<THREE.Group>(null!);

  // Gentle swaying animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Chain */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Main body */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.4, 0.6, 0.8, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Crystal details - 6 around the chandelier */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * 0.5;
        const z = Math.sin(angle) * 0.5;
        
        return (
          <group key={i}>
            {/* Crystal */}
            <mesh position={[x, -0.5, z]}>
              <coneGeometry args={[0.1, 0.4, 8]} />
              <meshStandardMaterial 
                color="#ffffff" 
                metalness={0.1} 
                roughness={0.1}
                transparent
                opacity={0.8}
              />
            </mesh>
            
            {/* Light bulb */}
            <pointLight 
              position={[x, -0.3, z]} 
              intensity={0.3} 
              distance={5}
              color="#fff8e7"
            />
          </group>
        );
      })}

      {/* Center light */}
      <pointLight 
        position={[0, -0.5, 0]} 
        intensity={0.5} 
        distance={8}
        color="#fff8e7"
      />

      {/* Decorative top sphere */}
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}