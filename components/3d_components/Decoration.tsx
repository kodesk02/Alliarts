"use client";

import * as THREE from "three";

type DecorationProps = {
  position: [number, number, number];
  type: "pedestal" | "vase" | "plant";
};

export default function Decoration({ position, type }: DecorationProps) {
  if (type === "pedestal") {
    return (
      <group position={position}>
        {/* Base */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.5, 0.4, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>

        {/* Column */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.35, 1.2, 16]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.4} />
        </mesh>

        {/* Top */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.45, 0.35, 0.2, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>

        {/* Decorative vase on top */}
        <mesh position={[0, 1.8, 0]} castShadow>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial 
            color="#8b7355" 
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>

        {/* Plant leaves */}
        {Array.from({ length: 5 }).map((_, i) => {
          const angle = (i / 5) * Math.PI * 2;
          const x = Math.cos(angle) * 0.15;
          const z = Math.sin(angle) * 0.15;
          
          return (
            <mesh 
              key={i} 
              position={[x, 2.1, z]}
              rotation={[0, angle, Math.PI / 6]}
              castShadow
            >
              <coneGeometry args={[0.1, 0.4, 8]} />
              <meshStandardMaterial color="#2d5016" />
            </mesh>
          );
        })}
      </group>
    );
  }

  return null;
}