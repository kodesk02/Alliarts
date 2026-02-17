"use client";

import { useRef } from "react";
import * as THREE from "three";

type ChandelierProps = {
  position: [number, number, number];
};

export default function Chandelier({ position }: ChandelierProps) {
  return (
    <group position={position}>
      {/* Thin rod */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.6, 8]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Pendant disc housing */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.26, 0.20, 0.1, 24]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.6} roughness={0.25} />
      </mesh>

      {/* Glowing diffuser face */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <circleGeometry args={[0.18, 24]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#fff9f0"
          emissiveIntensity={1.5}
          roughness={0.05}
        />
      </mesh>

      {/* Light source */}
      <pointLight position={[0, -0.2, 0]} intensity={1.6} distance={16} color="#fffcf0" />
    </group>
  );
}